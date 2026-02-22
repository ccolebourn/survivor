// Draft algorithms for the Survivor 50 fantasy draft game

export interface DraftOrderEntry {
  player_id: string;
  rank: number;
}

export interface SnakeDraftParams {
  // Players in rank order (rank 1 first)
  draftOrder: Array<{ player_id: string; rank: number }>;
  // Each player's ranked survivor preferences (rank 1 = most wanted)
  // Key: player_id, Value: array of survivor_ids sorted by rank ascending
  playerRankings: Record<string, number[]>;
  // All available survivor IDs (not yet drafted)
  availableSurvivorIds: number[];
}

export interface DraftPick {
  player_id: string;
  survivor_id: number;
  round: number;
  rank_in_round: number; // position within the round (1-based)
  is_random_pick: boolean; // true if selected randomly because player had no ranked survivors left
}

/**
 * Fisher-Yates shuffle — mutates the array in place and returns it.
 */
function fisherYatesShuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Randomly shuffles the given player IDs and assigns each a rank 1..N.
 * Uses a Fisher-Yates shuffle to guarantee true randomness.
 */
export function generateDraftOrder(playerIds: string[]): DraftOrderEntry[] {
  const shuffled = fisherYatesShuffle([...playerIds]);
  return shuffled.map((player_id, index) => ({
    player_id,
    rank: index + 1,
  }));
}

/**
 * Runs a snake draft and returns every pick made, in order.
 *
 * Snake rules:
 *   - Odd rounds  (1, 3, 5, …): pick in rank order  (rank 1 → rank N)
 *   - Even rounds (2, 4, 6, …): pick in reverse rank order (rank N → rank 1)
 *
 * A round is only started when there are enough survivors for every player
 * to receive at least one pick.  The draft stops the moment
 * `availableSurvivorIds.length < playerCount`.
 *
 * Selection per turn:
 *   1. Find the highest-ranked (lowest rank number) survivor on the player's
 *      list that is still available.
 *   2. If none exist, pick uniformly at random from remaining survivors.
 */
export function runSnakeDraft(params: SnakeDraftParams): DraftPick[] {
  const { draftOrder, playerRankings, availableSurvivorIds } = params;

  // Sort draftOrder by rank ascending so index 0 = rank 1
  const orderedPlayers = [...draftOrder].sort((a, b) => a.rank - b.rank);
  const playerCount = orderedPlayers.length;

  // Work with a mutable set for O(1) availability checks
  const available = new Set<number>(availableSurvivorIds);

  // Mutable per-player ranking pointer: we advance through each player's
  // preference list as survivors get drafted, avoiding repeated scans.
  // We keep the full list and simply skip already-drafted IDs.
  const playerPrefs: Record<string, number[]> = {};
  for (const { player_id } of orderedPlayers) {
    playerPrefs[player_id] = [...(playerRankings[player_id] ?? [])];
  }

  const picks: DraftPick[] = [];
  let round = 1;

  while (available.size >= playerCount) {
    // Determine pick order for this round
    const isForward = round % 2 === 1;
    const roundOrder = isForward
      ? [...orderedPlayers]
      : [...orderedPlayers].reverse();

    for (let i = 0; i < roundOrder.length; i++) {
      const { player_id } = roundOrder[i];
      const prefs = playerPrefs[player_id];

      let chosenId: number | undefined;
      let isRandom = false;

      // Walk preference list to find the first still-available survivor
      let prefIndex = 0;
      while (prefIndex < prefs.length) {
        const candidate = prefs[prefIndex];
        if (available.has(candidate)) {
          chosenId = candidate;
          // Remove from front of the effective list by splicing so future
          // turns don't re-scan from the beginning unnecessarily
          prefs.splice(0, prefIndex + 1);
          break;
        }
        prefIndex++;
      }

      if (chosenId === undefined) {
        // No ranked survivors remain — pick randomly
        const remaining = Array.from(available);
        const randomIndex = Math.floor(Math.random() * remaining.length);
        chosenId = remaining[randomIndex];
        isRandom = true;
        // Clear scanned (all already gone) prefix so we don't re-scan
        prefs.length = 0;
      }

      available.delete(chosenId);

      picks.push({
        player_id,
        survivor_id: chosenId,
        round,
        rank_in_round: i + 1,
        is_random_pick: isRandom,
      });
    }

    round++;
  }

  return picks;
}

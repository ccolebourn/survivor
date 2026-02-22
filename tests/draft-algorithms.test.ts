import {
  generateDraftOrder,
  runSnakeDraft,
  type DraftOrderEntry,
  type DraftPick,
} from "@/lib/draft-algorithms";

// ---------------------------------------------------------------------------
// generateDraftOrder
// ---------------------------------------------------------------------------

describe("generateDraftOrder", () => {
  const playerIds = ["alice", "bob", "carol", "dave", "eve"];

  it("returns the correct number of entries", () => {
    const result = generateDraftOrder(playerIds);
    expect(result).toHaveLength(playerIds.length);
  });

  it("contains every player ID exactly once", () => {
    const result = generateDraftOrder(playerIds);
    const returnedIds = result.map((e) => e.player_id).sort();
    expect(returnedIds).toEqual([...playerIds].sort());
  });

  it("assigns ranks 1..N with no gaps or duplicates", () => {
    const result = generateDraftOrder(playerIds);
    const ranks = result.map((e) => e.rank).sort((a, b) => a - b);
    const expected = playerIds.map((_, i) => i + 1);
    expect(ranks).toEqual(expected);
  });

  it("produces different orderings across multiple calls (randomness check)", () => {
    // Run 10 times and collect the serialised rank orders.
    // The probability that all 10 are identical for N=5 players is
    // (1/5!)^9 ≈ 3e-12, so a flaky failure here is astronomically unlikely.
    const orders = Array.from({ length: 10 }, () =>
      generateDraftOrder(playerIds)
        .sort((a, b) => a.rank - b.rank)
        .map((e) => e.player_id)
        .join(",")
    );
    const uniqueOrders = new Set(orders);
    expect(uniqueOrders.size).toBeGreaterThan(1);
  });

  it("works correctly for a single player", () => {
    const result = generateDraftOrder(["solo"]);
    expect(result).toEqual([{ player_id: "solo", rank: 1 }]);
  });

  it("does not mutate the original playerIds array", () => {
    const original = ["alice", "bob", "carol"];
    const copy = [...original];
    generateDraftOrder(original);
    expect(original).toEqual(copy);
  });
});

// ---------------------------------------------------------------------------
// runSnakeDraft — helpers
// ---------------------------------------------------------------------------

/** Build a draftOrder array from a simple ordered list of player IDs. */
function makeDraftOrder(playerIds: string[]) {
  return playerIds.map((player_id, i) => ({ player_id, rank: i + 1 }));
}

/** Build a sequential list of survivor IDs starting from 1. */
function makeAvailable(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i + 1);
}

/**
 * Build a playerRankings map where each player ranks survivors in the order
 * given by `survivorIds` (index 0 = most preferred).
 */
function makeUniformRankings(
  playerIds: string[],
  survivorIds: number[]
): Record<string, number[]> {
  return Object.fromEntries(playerIds.map((id) => [id, [...survivorIds]]));
}

// ---------------------------------------------------------------------------
// runSnakeDraft — tests
// ---------------------------------------------------------------------------

describe("runSnakeDraft", () => {
  // -------------------------------------------------------------------------
  it("produces the correct snake order across three rounds (3 players, 9 survivors)", () => {
    const players = ["p1", "p2", "p3"];
    const survivors = makeAvailable(9);
    const picks = runSnakeDraft({
      draftOrder: makeDraftOrder(players),
      playerRankings: makeUniformRankings(players, survivors),
      availableSurvivorIds: survivors,
    });

    expect(picks).toHaveLength(9);

    const round1 = picks.filter((p) => p.round === 1).map((p) => p.player_id);
    const round2 = picks.filter((p) => p.round === 2).map((p) => p.player_id);
    const round3 = picks.filter((p) => p.round === 3).map((p) => p.player_id);

    // Round 1 (odd) — forward order
    expect(round1).toEqual(["p1", "p2", "p3"]);
    // Round 2 (even) — reverse order
    expect(round2).toEqual(["p3", "p2", "p1"]);
    // Round 3 (odd) — forward order again
    expect(round3).toEqual(["p1", "p2", "p3"]);
  });

  // -------------------------------------------------------------------------
  it("never drafts the same survivor twice", () => {
    const players = ["p1", "p2", "p3"];
    const survivors = makeAvailable(12);
    const picks = runSnakeDraft({
      draftOrder: makeDraftOrder(players),
      playerRankings: makeUniformRankings(players, survivors),
      availableSurvivorIds: survivors,
    });

    const draftedIds = picks.map((p) => p.survivor_id);
    const uniqueIds = new Set(draftedIds);
    expect(uniqueIds.size).toBe(draftedIds.length);
  });

  // -------------------------------------------------------------------------
  it("gives each player an equal number of picks when survivors divide evenly", () => {
    const players = ["p1", "p2", "p3"];
    const survivors = makeAvailable(9); // 9 / 3 = 3 picks each
    const picks = runSnakeDraft({
      draftOrder: makeDraftOrder(players),
      playerRankings: makeUniformRankings(players, survivors),
      availableSurvivorIds: survivors,
    });

    for (const pid of players) {
      const playerPicks = picks.filter((p) => p.player_id === pid);
      expect(playerPicks).toHaveLength(3);
    }
  });

  // -------------------------------------------------------------------------
  it("stops when survivors remaining < playerCount (3 players, 7 survivors → 2 full rounds, 1 left over)", () => {
    // 3 players, 7 survivors:
    //   Round 1: 3 picks  (4 left)
    //   Round 2: 3 picks  (1 left — can't start round 3 because 1 < 3)
    const players = ["p1", "p2", "p3"];
    const survivors = makeAvailable(7);
    const picks = runSnakeDraft({
      draftOrder: makeDraftOrder(players),
      playerRankings: makeUniformRankings(players, survivors),
      availableSurvivorIds: survivors,
    });

    expect(picks).toHaveLength(6); // 2 full rounds × 3 players
    const rounds = [...new Set(picks.map((p) => p.round))].sort((a, b) => a - b);
    expect(rounds).toEqual([1, 2]);
  });

  // -------------------------------------------------------------------------
  it("stops after 0 rounds when survivors < playerCount from the start", () => {
    const players = ["p1", "p2", "p3"];
    const survivors = makeAvailable(2); // 2 < 3 — no round can begin
    const picks = runSnakeDraft({
      draftOrder: makeDraftOrder(players),
      playerRankings: makeUniformRankings(players, survivors),
      availableSurvivorIds: survivors,
    });

    expect(picks).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  it("marks is_random_pick=true when a player's ranked list is exhausted", () => {
    // p1 has ranked only survivors 1 and 2.
    // p2 has ranked only survivors 3 and 4.
    // 4 survivors, 2 players → 2 rounds (each player picks twice).
    // In round 1 both players exhaust their preference lists.
    // After round 1: survivor 1 → p1, survivor 3 → p2.
    // Round 2: p2 picks first (snake reverse). p2's list has survivor 4 left → ranked.
    //           p1 picks next. p1's list only had survivor 2 left → ranked.
    // So in this deterministic scenario nobody should need a random pick.
    //
    // To force a random pick, give p1 a list of only [1] (just one preference)
    // but run 2 rounds (4 survivors, 2 players).
    const players = ["p1", "p2"];
    const survivors = [1, 2, 3, 4];
    const picks = runSnakeDraft({
      draftOrder: makeDraftOrder(players),
      playerRankings: {
        p1: [1], // only one preference — will need random in round 2
        p2: [2, 3, 4, 1], // full list
      },
      availableSurvivorIds: survivors,
    });

    // Round 1 (forward): p1 picks survivor 1, p2 picks survivor 2
    // Round 2 (reverse): p2 picks survivor 3, p1 has no ranked picks left → random
    expect(picks).toHaveLength(4);

    const p1Picks = picks.filter((p) => p.player_id === "p1");
    expect(p1Picks).toHaveLength(2);

    const p1Round1 = p1Picks.find((p) => p.round === 1);
    const p1Round2 = p1Picks.find((p) => p.round === 2);

    expect(p1Round1?.survivor_id).toBe(1);
    expect(p1Round1?.is_random_pick).toBe(false);

    expect(p1Round2?.is_random_pick).toBe(true);
    // The random pick must still be a valid, previously-undrafted survivor
    const draftedBefore = new Set([p1Round1?.survivor_id, 2, 3]); // survivors taken before p1's round-2 turn
    // After round 1 p1 took 1, p2 took 2. Round 2 p2 takes 3. p1 gets one of {4}.
    expect(p1Round2?.survivor_id).toBe(4);
  });

  // -------------------------------------------------------------------------
  it("is_random_pick is false when a player uses their preference list", () => {
    const players = ["p1", "p2"];
    const survivors = makeAvailable(4);
    const picks = runSnakeDraft({
      draftOrder: makeDraftOrder(players),
      playerRankings: makeUniformRankings(players, survivors),
      availableSurvivorIds: survivors,
    });

    expect(picks.every((p) => p.is_random_pick === false)).toBe(true);
  });

  // -------------------------------------------------------------------------
  it("drafts all 24 survivors with 2 players over 12 rounds", () => {
    const players = ["p1", "p2"];
    const survivors = makeAvailable(24);
    const picks = runSnakeDraft({
      draftOrder: makeDraftOrder(players),
      playerRankings: makeUniformRankings(players, survivors),
      availableSurvivorIds: survivors,
    });

    expect(picks).toHaveLength(24);

    const rounds = [...new Set(picks.map((p) => p.round))].sort((a, b) => a - b);
    expect(rounds).toHaveLength(12);
    expect(rounds[0]).toBe(1);
    expect(rounds[11]).toBe(12);

    // Every survivor appears exactly once
    const draftedSet = new Set(picks.map((p) => p.survivor_id));
    expect(draftedSet.size).toBe(24);
    for (const sid of survivors) {
      expect(draftedSet.has(sid)).toBe(true);
    }
  });

  // -------------------------------------------------------------------------
  it("assigns correct rank_in_round values within each round", () => {
    const players = ["p1", "p2", "p3"];
    const survivors = makeAvailable(6);
    const picks = runSnakeDraft({
      draftOrder: makeDraftOrder(players),
      playerRankings: makeUniformRankings(players, survivors),
      availableSurvivorIds: survivors,
    });

    for (let round = 1; round <= 2; round++) {
      const roundPicks = picks
        .filter((p) => p.round === round)
        .sort((a, b) => a.rank_in_round - b.rank_in_round);

      expect(roundPicks.map((p) => p.rank_in_round)).toEqual([1, 2, 3]);
    }
  });

  // -------------------------------------------------------------------------
  it("honours player preferences: highest-ranked available survivor is always picked", () => {
    // p1 prefers: 5, 3, 1, 2, 4
    // p2 prefers: 4, 2, 3, 1, 5
    // 2 players, 4 survivors → 2 rounds
    //
    // Round 1 (forward):
    //   p1 picks 5 (top pref, available)
    //   p2 picks 4 (top pref, available)
    // Round 2 (reverse):
    //   p2 picks 2 (next available pref after 4 gone)
    //   p1 picks 3 (next available pref after 5 gone)
    const players = ["p1", "p2"];
    const picks = runSnakeDraft({
      draftOrder: makeDraftOrder(players),
      playerRankings: {
        p1: [5, 3, 1, 2, 4],
        p2: [4, 2, 3, 1, 5],
      },
      availableSurvivorIds: [1, 2, 3, 4, 5],
    });

    // Only 4 survivors get drafted (5 available, 5 % 2 leaves 1 remainder →
    // 2 full rounds = 4 picks; 1 survivor left over)
    expect(picks).toHaveLength(4);

    const byRoundAndRank = (round: number, rank: number) =>
      picks.find((p) => p.round === round && p.rank_in_round === rank);

    expect(byRoundAndRank(1, 1)?.player_id).toBe("p1");
    expect(byRoundAndRank(1, 1)?.survivor_id).toBe(5);
    expect(byRoundAndRank(1, 1)?.is_random_pick).toBe(false);

    expect(byRoundAndRank(1, 2)?.player_id).toBe("p2");
    expect(byRoundAndRank(1, 2)?.survivor_id).toBe(4);
    expect(byRoundAndRank(1, 2)?.is_random_pick).toBe(false);

    expect(byRoundAndRank(2, 1)?.player_id).toBe("p2");
    expect(byRoundAndRank(2, 1)?.survivor_id).toBe(2);
    expect(byRoundAndRank(2, 1)?.is_random_pick).toBe(false);

    expect(byRoundAndRank(2, 2)?.player_id).toBe("p1");
    expect(byRoundAndRank(2, 2)?.survivor_id).toBe(3);
    expect(byRoundAndRank(2, 2)?.is_random_pick).toBe(false);
  });

  // -------------------------------------------------------------------------
  it("does not mutate the availableSurvivorIds array passed in", () => {
    const players = ["p1", "p2"];
    const survivors = makeAvailable(4);
    const originalCopy = [...survivors];
    runSnakeDraft({
      draftOrder: makeDraftOrder(players),
      playerRankings: makeUniformRankings(players, survivors),
      availableSurvivorIds: survivors,
    });
    expect(survivors).toEqual(originalCopy);
  });

  // -------------------------------------------------------------------------
  it("works with a single player who drafts all survivors one round at a time", () => {
    const players = ["solo"];
    const survivors = makeAvailable(5);
    const picks = runSnakeDraft({
      draftOrder: makeDraftOrder(players),
      playerRankings: makeUniformRankings(players, survivors),
      availableSurvivorIds: survivors,
    });

    // With 1 player, every round has exactly 1 pick and stops only when 0 remain.
    // 5 survivors / 1 player → 5 rounds, all drafted.
    expect(picks).toHaveLength(5);
    const draftedSet = new Set(picks.map((p) => p.survivor_id));
    expect(draftedSet.size).toBe(5);
  });
});

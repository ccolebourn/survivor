export default function RulesPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">How to Play</h1>
        <p className="text-gray-500 text-sm">
          A fantasy draft game for Survivor Season 50 — 24 castaways, one winner.
        </p>
      </div>

      {/* Overview */}
      <section className="">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Overview</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Each group of friends drafts Survivor castaways before the season begins. As players are
          eliminated on the show, your drafted survivors are eliminated from your roster. The last
          person with a surviving castaway wins your group.
        </p>
      </section>

      {/* Phase 1: Sign Up */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
            1
          </span>
          <h2 className="text-lg font-semibold text-gray-900">Sign Up &amp; Join a Group</h2>
        </div>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span className="text-gray-400 mt-0.5">&#8227;</span>
            One person creates a group and becomes the <strong>Administrator</strong>. The admin is
            also a player in their group.
          </li>
          <li className="flex gap-2">
            <span className="text-gray-400 mt-0.5">&#8227;</span>
            The admin invites others by email. Invitees sign up for the site and are added to the
            group automatically.
          </li>
          <li className="flex gap-2">
            <span className="text-gray-400 mt-0.5">&#8227;</span>
            There must be at least <strong>two players</strong> in the group before the draft can
            begin.
          </li>
          <li className="flex gap-2">
            <span className="text-gray-400 mt-0.5">&#8227;</span>
            Players can belong to multiple groups. You can be an admin in one group and a player in
            another.
          </li>
        </ul>
      </section>

      {/* Phase 2: Rank Survivors */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
            2
          </span>
          <h2 className="text-lg font-semibold text-gray-900">Rank Your Survivors</h2>
        </div>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span className="text-gray-400 mt-0.5">&#8227;</span>
            Before the draft, every player must rank <strong>all 24 castaways</strong> from most
            wanted (#1) to least wanted (#24).
          </li>
          <li className="flex gap-2">
            <span className="text-gray-400 mt-0.5">&#8227;</span>
            Your rankings are private — other players cannot see your list until after the draft.
          </li>
          <li className="flex gap-2">
            <span className="text-gray-400 mt-0.5">&#8227;</span>
            Use the Random button to automatically assign ranks to any
            survivors you haven&apos;t ordered yet. Handy if you&apos;ve ranked your top picks but
            don&apos;t care about the rest.
          </li>
          <li className="flex gap-2">
            <span className="text-gray-400 mt-0.5">&#8227;</span>
            You can update your rankings at any time before the draft starts.
          </li>
        </ul>
      </section>

      {/* Phase 3: The Draft */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
            3
          </span>
          <h2 className="text-lg font-semibold text-gray-900">The Draft</h2>
        </div>

        <div className="space-y-5 text-sm text-gray-600">
          <div>
            <h3 className="font-semibold text-gray-800 mb-1.5">Draft Order</h3>
            <p>
              The admin posts the draft order when ready. An algorithm randomly assigns each player a
              rank from 1 to N (where N is the number of players). This determines who picks when.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-1.5">Snake Draft</h3>
            <p className="mb-2">
              The draft uses a snake format to keep things fair. With 4 players as an example:
            </p>
            <div className="rounded-lg bg-gray-50 border border-gray-100 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-100 text-gray-500 uppercase tracking-wide">
                    <th className="px-3 py-2 text-left font-semibold">Round</th>
                    <th className="px-3 py-2 text-left font-semibold">Pick Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-700">Round 1</td>
                    <td className="px-3 py-2 text-gray-600">Player 1 → Player 2 → Player 3 → Player 4</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-700">Round 2</td>
                    <td className="px-3 py-2 text-gray-600">Player 4 → Player 3 → Player 2 → Player 1</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-700">Round 3</td>
                    <td className="px-3 py-2 text-gray-600">Player 1 → Player 2 → Player 3 → Player 4</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-700">...</td>
                    <td className="px-3 py-2 text-gray-500 italic">and so on</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-1.5">How Picks Work</h3>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span className="text-gray-400 mt-0.5">&#8227;</span>
                When it&apos;s your turn, the algorithm automatically selects your
                highest-ranked survivor that hasn&apos;t been drafted yet.
              </li>
              <li className="flex gap-2">
                <span className="text-gray-400 mt-0.5">&#8227;</span>
                If all of your ranked survivors are already taken, the algorithm picks one for you at 
                random from the remaining available castaways.
              </li>
              <li className="flex gap-2">
                <span className="text-gray-400 mt-0.5">&#8227;</span>
                Rounds continue until there aren&apos;t enough survivors left for every player to
                pick at least one. Some castaways will go undrafted.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Phase 4: The Game */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
            4
          </span>
          <h2 className="text-lg font-semibold text-gray-900">The Game</h2>
        </div>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span className="text-gray-400 mt-0.5">&#8227;</span>
            Each week a castaway is eliminated from Survivor. Their corresponding fantasy player
            loses that castaway from their roster.
          </li>
          <li className="flex gap-2">
            <span className="text-gray-400 mt-0.5">&#8227;</span>
            When all of your drafted survivors have been eliminated, you are out of the game.
          </li>
          <li className="flex gap-2">
            <span className="text-gray-400 mt-0.5">&#8227;</span>
            Free Agent Pick: If you lose a castaway and there are still undrafted
            survivors available, you may claim one as a free agent to keep you in the game.
          </li>
          <li className="flex gap-2">
            <span className="text-gray-400 mt-0.5">&#8227;</span>
            The winner is the last player with a non-eliminated survivor once all
            other players are out.
          </li>
        </ul>
      </section>

      {/* Tips */}
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-lg font-semibold text-amber-900 mb-3">Tips</h2>
        <ul className="space-y-2 text-sm text-amber-800">
          <li className="flex gap-2">
            <span className="text-amber-500 mt-0.5">&#8227;</span>
            Don&apos;t leave rankings unfinished. Any unranked survivors at draft time will be
            treated as lower priority, and you could end up with castaways you didn&apos;t want.
          </li>
          <li className="flex gap-2">
            <span className="text-amber-500 mt-0.5">&#8227;</span>
            The snake format gives later draft positions a small advantage in round 2 — picking
            last in round 1 means picking first in round 2.
          </li>
          <li className="flex gap-2">
            <span className="text-amber-500 mt-0.5">&#8227;</span>
            Keep an eye on undrafted survivors early in the season — free agent pickups can be a
            lifeline.
          </li>
        </ul>
      </section>
    </div>
  );
}

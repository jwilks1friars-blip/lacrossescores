import { mockGames } from "./lib/mockData";
import ScoreCard from "./components/ScoreCard";

export default function ScoresPage() {
  const liveGames = mockGames.filter((g) => g.status === "live");
  const todayFinals = mockGames.filter(
    (g) => g.status === "final" && g.date === "2026-02-27"
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Live Scores</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Today · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Live games */}
      {liveGames.length > 0 ? (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
            In Progress
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {liveGames.map((game) => (
              <ScoreCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 py-12 text-center">
          <p className="text-zinc-500">No games in progress right now.</p>
        </section>
      )}

      {/* Today's finals */}
      {todayFinals.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Final
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {todayFinals.map((game) => (
              <ScoreCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

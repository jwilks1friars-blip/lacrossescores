import { fetchScoreboard } from "./lib/ncaa";
import ScoreCard from "./components/ScoreCard";
import LiveRefresh from "./components/LiveRefresh";

// Revalidate this page on the server every 30 seconds
export const revalidate = 30;

export default async function ScoresPage() {
  const games = await fetchScoreboard();

  const liveGames = games.filter((g) => g.status === "live");
  const finalGames = games.filter((g) => g.status === "final");
  const scheduledGames = games.filter((g) => g.status === "scheduled");

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Scores</h1>
          <p className="mt-1 text-sm text-zinc-500">Today · {today}</p>
        </div>
        {liveGames.length > 0 && <LiveRefresh />}
      </div>

      {/* No games at all today */}
      {games.length === 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 py-16 text-center">
          <p className="text-lg font-medium text-zinc-400">No games today</p>
          <p className="mt-1 text-sm text-zinc-600">
            Check the{" "}
            <a href="/schedule" className="text-green-400 hover:underline">
              schedule
            </a>{" "}
            for upcoming games.
          </p>
        </div>
      )}

      {/* Live games */}
      {liveGames.length > 0 && (
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
      )}

      {/* Today's final scores */}
      {finalGames.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Final
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {finalGames.map((game) => (
              <ScoreCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}

      {/* Today's upcoming games */}
      {scheduledGames.length > 0 && liveGames.length === 0 && finalGames.length === 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Today&apos;s Games
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {scheduledGames.map((game) => (
              <ScoreCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

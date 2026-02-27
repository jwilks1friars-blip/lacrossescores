import { fetchSchedule, fetchScoreboardRange } from "../lib/ncaa";
import { Game } from "../lib/types";
import GameRow from "../components/GameRow";

// Revalidate every 5 minutes — results don't change but new ones appear
export const revalidate = 300;

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Generate the last N dates ending today */
function lastDays(n: number): Date[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  });
}

export default async function ResultsPage() {
  // Try the full schedule first; fall back to querying the last 30 days
  let allGames: Game[] = await fetchSchedule();

  if (allGames.length === 0) {
    allGames = await fetchScoreboardRange(lastDays(30));
  }

  const today = new Date().toISOString().slice(0, 10);

  const past = allGames
    .filter((g) => g.status === "final" && g.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date));

  const grouped = past.reduce<Record<string, Game[]>>((acc, game) => {
    acc[game.date] ??= [];
    acc[game.date].push(game);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Results</h1>
        <p className="mt-1 text-sm text-zinc-500">
          NCAA D1 Men&apos;s Lacrosse scores
        </p>
      </div>

      {dates.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 py-16 text-center">
          <p className="text-lg font-medium text-zinc-400">No results yet</p>
          <p className="mt-1 text-sm text-zinc-600">
            The NCAA D1 season typically runs February through May.
          </p>
        </div>
      ) : (
        dates.map((date) => (
          <section key={date}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              {formatDate(date)}
            </h2>
            <div className="space-y-2">
              {grouped[date].map((game) => (
                <GameRow key={game.id} game={game} showResult />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

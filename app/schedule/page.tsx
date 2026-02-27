import { fetchSchedule, fetchScoreboardRange } from "../lib/ncaa";
import { Game } from "../lib/types";
import GameRow from "../components/GameRow";

// Cache for 10 minutes — schedule doesn't change often
export const revalidate = 600;

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Generate the next N dates starting from today */
function nextDays(n: number): Date[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

export default async function SchedulePage() {
  // Try the schedule endpoint first; fall back to querying the next 14 days
  let allGames: Game[] = await fetchSchedule();

  if (allGames.length === 0) {
    allGames = await fetchScoreboardRange(nextDays(14));
  }

  const today = new Date().toISOString().slice(0, 10);

  const upcoming = allGames
    .filter((g) => g.status === "scheduled" && g.date >= today)
    .sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      return dateCmp !== 0 ? dateCmp : (a.time ?? "").localeCompare(b.time ?? "");
    });

  const grouped = upcoming.reduce<Record<string, Game[]>>((acc, game) => {
    acc[game.date] ??= [];
    acc[game.date].push(game);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Schedule</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Upcoming NCAA D1 Men&apos;s Lacrosse
        </p>
      </div>

      {dates.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 py-16 text-center">
          <p className="text-lg font-medium text-zinc-400">No upcoming games found</p>
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
                <GameRow key={game.id} game={game} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

import { mockGames } from "../lib/mockData";
import GameRow from "../components/GameRow";

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function ResultsPage() {
  const past = mockGames
    .filter((g) => g.status === "final" && g.date < "2026-02-27")
    .sort((a, b) => b.date.localeCompare(a.date));

  const grouped = past.reduce<Record<string, typeof past>>((acc, game) => {
    if (!acc[game.date]) acc[game.date] = [];
    acc[game.date].push(game);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Results</h1>
        <p className="mt-1 text-sm text-zinc-500">Past game scores</p>
      </div>

      {dates.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 py-12 text-center">
          <p className="text-zinc-500">No results yet.</p>
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

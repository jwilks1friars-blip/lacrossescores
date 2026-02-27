import { Game } from "../lib/types";

interface ScoreCardProps {
  game: Game;
}

export default function ScoreCard({ game }: ScoreCardProps) {
  const isLive = game.status === "live";
  const isFinal = game.status === "final";
  const homeWon = isFinal && game.homeScore > game.awayScore;
  const awayWon = isFinal && game.awayScore > game.homeScore;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700">
      {/* Status bar */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          {game.league}
        </span>
        {isLive ? (
          <span className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-red-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
            Live · {game.period} {game.clock}
          </span>
        ) : isFinal ? (
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Final</span>
        ) : null}
      </div>

      {/* Teams and scores */}
      <div className="space-y-2">
        <TeamRow
          name={game.awayTeam.name}
          abbr={game.awayTeam.abbreviation}
          record={game.awayTeam.record}
          score={game.awayScore}
          won={awayWon}
          showScore={isLive || isFinal}
        />
        <TeamRow
          name={game.homeTeam.name}
          abbr={game.homeTeam.abbreviation}
          record={game.homeTeam.record}
          score={game.homeScore}
          won={homeWon}
          showScore={isLive || isFinal}
        />
      </div>

      {/* Venue */}
      {game.venue && (
        <p className="mt-3 truncate text-xs text-zinc-600">{game.venue}</p>
      )}
    </div>
  );
}

function TeamRow({
  name,
  abbr,
  record,
  score,
  won,
  showScore,
}: {
  name: string;
  abbr: string;
  record?: string;
  score: number;
  won: boolean;
  showScore: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <span
          className={`truncate text-sm font-semibold ${
            won ? "text-white" : "text-zinc-300"
          }`}
        >
          {name}
        </span>
        {record && (
          <span className="ml-2 text-xs text-zinc-600">({record})</span>
        )}
      </div>
      {showScore && (
        <span
          className={`text-xl font-bold tabular-nums ${
            won ? "text-white" : "text-zinc-400"
          }`}
        >
          {score}
        </span>
      )}
    </div>
  );
}

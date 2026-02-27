import { Game } from "../lib/types";

interface GameRowProps {
  game: Game;
  showResult?: boolean;
}

export default function GameRow({ game, showResult = false }: GameRowProps) {
  const homeWon = game.homeScore > game.awayScore;
  const awayWon = game.awayScore > game.homeScore;

  return (
    <div className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 hover:border-zinc-700">
      {/* Time / Result */}
      <div className="w-20 shrink-0 text-center">
        {showResult ? (
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Final
          </span>
        ) : (
          <span className="text-sm font-medium text-zinc-400">{game.time}</span>
        )}
      </div>

      {/* Matchup */}
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between">
          <span
            className={`text-sm font-semibold ${
              showResult && awayWon ? "text-white" : "text-zinc-300"
            }`}
          >
            {game.awayTeam.name}
            {game.awayTeam.record && (
              <span className="ml-1.5 text-xs font-normal text-zinc-600">
                ({game.awayTeam.record})
              </span>
            )}
          </span>
          {showResult && (
            <span
              className={`text-sm font-bold tabular-nums ${
                awayWon ? "text-white" : "text-zinc-500"
              }`}
            >
              {game.awayScore}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span
            className={`text-sm font-semibold ${
              showResult && homeWon ? "text-white" : "text-zinc-300"
            }`}
          >
            {game.homeTeam.name}
            {game.homeTeam.record && (
              <span className="ml-1.5 text-xs font-normal text-zinc-600">
                ({game.homeTeam.record})
              </span>
            )}
          </span>
          {showResult && (
            <span
              className={`text-sm font-bold tabular-nums ${
                homeWon ? "text-white" : "text-zinc-500"
              }`}
            >
              {game.homeScore}
            </span>
          )}
        </div>
      </div>

      {/* Venue */}
      {game.venue && (
        <div className="hidden w-44 shrink-0 text-right sm:block">
          <span className="truncate text-xs text-zinc-600">{game.venue}</span>
        </div>
      )}

      {/* League badge */}
      <span className="shrink-0 rounded bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-400">
        {game.league}
      </span>
    </div>
  );
}

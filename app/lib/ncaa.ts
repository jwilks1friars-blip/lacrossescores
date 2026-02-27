import { Game, GameStatus, Team } from "./types";

const NCAA_API_BASE = "https://ncaa-api.henrygd.me";

// ─── NCAA API response types ──────────────────────────────────────────────────

interface NcaaNames {
  char6: string;
  char8: string;
  short: string;
  seo: string;
  full: string;
}

interface NcaaTeam {
  names: NcaaNames;
  score: string;
  winner?: boolean;
  record?: string;
  seed?: string;
}

interface NcaaVenue {
  name: string;
  city: string;
  state: string;
}

interface NcaaGame {
  gameID: string;
  startDate: string;    // "MM/DD/YYYY"
  startTime: string;    // "H:MM PM ET" | "TBD"
  startDateTimestamp?: number;
  gameState: "pre" | "live" | "final";
  currentPeriod?: string;
  contestClock?: string;
  home: NcaaTeam;
  away: NcaaTeam;
  venue?: NcaaVenue;
}

interface NcaaScoreboardResponse {
  games?: Array<{ game: NcaaGame }>;
}

interface NcaaScheduleGame {
  game: NcaaGame;
}

interface NcaaScheduleResponse {
  games?: NcaaScheduleGame[];
}

// ─── Transformers ─────────────────────────────────────────────────────────────

function mapStatus(state: string): GameStatus {
  switch (state) {
    case "live":
      return "live";
    case "final":
      return "final";
    default:
      return "scheduled";
  }
}

/** "MM/DD/YYYY" → "YYYY-MM-DD" */
function parseNcaaDate(raw: string): string {
  const [m, d, y] = raw.split("/");
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function makeTeam(t: NcaaTeam, fallbackId: string): Team {
  return {
    id: t.names?.seo || fallbackId,
    name: t.names?.full || t.names?.short || fallbackId,
    abbreviation: t.names?.char6 || t.names?.char8 || fallbackId,
    record: t.record,
  };
}

function transformGame(g: NcaaGame): Game {
  const status = mapStatus(g.gameState);
  const date = parseNcaaDate(g.startDate);

  let venue: string | undefined;
  if (g.venue) {
    venue = `${g.venue.name}, ${g.venue.city} ${g.venue.state}`;
  }

  return {
    id: g.gameID,
    homeTeam: makeTeam(g.home, "HOME"),
    awayTeam: makeTeam(g.away, "AWAY"),
    homeScore: parseInt(g.home.score ?? "0", 10) || 0,
    awayScore: parseInt(g.away.score ?? "0", 10) || 0,
    status,
    period: g.currentPeriod,
    clock: g.contestClock,
    date,
    time: g.startTime !== "TBD" ? g.startTime : undefined,
    venue,
    league: "NCAA D1",
  };
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function ncaaFetch<T>(path: string, revalidate = 30): Promise<T | null> {
  try {
    const res = await fetch(`${NCAA_API_BASE}${path}`, {
      next: { revalidate },
      headers: { "User-Agent": "lacrossescores.com/1.0" },
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

function dateSegments(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return { y, m, d };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Fetch scoreboard for a specific date (defaults to today). */
export async function fetchScoreboard(date: Date = new Date()): Promise<Game[]> {
  const { y, m, d } = dateSegments(date);
  const data = await ncaaFetch<NcaaScoreboardResponse>(
    `/scoreboard/lacrosse-men/d1/${y}/${m}/${d}/all-conf`,
    30
  );
  if (!data?.games?.length) return [];
  return data.games.map((g) => transformGame(g.game));
}

/**
 * Fetch the full season schedule. Returns all games (past, present, future).
 * Cached for 10 minutes since it rarely changes mid-day.
 */
export async function fetchSchedule(): Promise<Game[]> {
  const year = new Date().getFullYear();
  const data = await ncaaFetch<NcaaScheduleResponse>(
    `/schedule/lacrosse-men/d1/${year}/all-conf`,
    600
  );
  if (!data?.games?.length) return [];
  return data.games.map((g) => transformGame(g.game));
}

/**
 * Fetch scoreboards for a range of dates and return combined results.
 * Used when the schedule endpoint isn't available or for recent results.
 */
export async function fetchScoreboardRange(dates: Date[]): Promise<Game[]> {
  const results = await Promise.all(dates.map((d) => fetchScoreboard(d)));
  return results.flat();
}

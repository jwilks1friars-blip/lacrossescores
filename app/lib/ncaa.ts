import { Game, GameStatus, Team } from "./types";

const ESPN_API =
  "https://site.api.espn.com/apis/site/v2/sports/lacrosse/mens-college-lacrosse";

// ─── ESPN API response types ───────────────────────────────────────────────

interface EspnTeamInfo {
  id: string;
  shortDisplayName: string;
  displayName: string;
  abbreviation: string;
  logo?: string;
}

interface EspnCompetitor {
  homeAway: "home" | "away";
  team: EspnTeamInfo;
  score?: string;
  records?: Array<{ type: string; summary: string }>;
}

interface EspnStatusType {
  name: string;
  state: "pre" | "in" | "post";
  completed: boolean;
  detail: string;
  shortDetail: string;
}

interface EspnStatus {
  clock: number;
  displayClock: string;
  period: number;
  type: EspnStatusType;
}

interface EspnVenue {
  fullName?: string;
  address?: { city?: string; state?: string };
}

interface EspnCompetition {
  id: string;
  date: string;
  competitors: EspnCompetitor[];
  status: EspnStatus;
  venue?: EspnVenue;
}

interface EspnEvent {
  id: string;
  competitions: EspnCompetition[];
}

interface EspnScoreboardResponse {
  events?: EspnEvent[];
}

// ─── Transformers ─────────────────────────────────────────────────────────

function mapStatus(s: EspnStatusType): GameStatus {
  if (s.completed) return "final";
  if (s.state === "in") return "live";
  if (s.name === "STATUS_POSTPONED" || s.name === "STATUS_CANCELED") return "postponed";
  return "scheduled";
}

function makeTeam(c: EspnCompetitor): Team {
  const record = c.records?.find((r) => r.type === "total")?.summary;
  return {
    id: c.team.id,
    name: c.team.shortDisplayName || c.team.displayName,
    abbreviation: c.team.abbreviation,
    logo: c.team.logo,
    record,
  };
}

function periodLabel(period: number): string {
  if (period <= 4) return `Q${period}`;
  return `OT${period > 5 ? period - 4 : ""}`;
}

function transformEvent(event: EspnEvent): Game {
  const comp = event.competitions[0];
  const home = comp.competitors.find((c) => c.homeAway === "home")!;
  const away = comp.competitors.find((c) => c.homeAway === "away")!;
  const status = comp.status;
  const gameStatus = mapStatus(status.type);

  const date = comp.date.split("T")[0];
  const timeStr = new Date(comp.date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
    timeZoneName: "short",
  });

  let venue: string | undefined;
  if (comp.venue?.fullName) {
    const { city, state } = comp.venue.address ?? {};
    venue = [comp.venue.fullName, city, state].filter(Boolean).join(", ");
  }

  return {
    id: comp.id,
    homeTeam: makeTeam(home),
    awayTeam: makeTeam(away),
    homeScore: parseInt(home.score ?? "0", 10) || 0,
    awayScore: parseInt(away.score ?? "0", 10) || 0,
    status: gameStatus,
    period: status.period > 0 ? periodLabel(status.period) : undefined,
    clock: gameStatus === "live" ? status.displayClock : undefined,
    date,
    time: timeStr,
    venue,
    league: "NCAA D1",
  };
}

// ─── Fetch helpers ─────────────────────────────────────────────────────────

async function espnFetch<T>(path: string, revalidate = 30): Promise<T | null> {
  try {
    const res = await fetch(`${ESPN_API}${path}`, {
      next: { revalidate },
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

// ─── Public API ────────────────────────────────────────────────────────────

/** Fetch scoreboard for a specific date (defaults to today). */
export async function fetchScoreboard(date: Date = new Date()): Promise<Game[]> {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const data = await espnFetch<EspnScoreboardResponse>(
    `/scoreboard?dates=${y}${m}${d}&limit=100`,
    30
  );
  if (!data?.events?.length) return [];
  return data.events.map(transformEvent);
}

/** Fetch the full season schedule. */
export async function fetchSchedule(): Promise<Game[]> {
  const data = await espnFetch<EspnScoreboardResponse>(
    `/scoreboard?limit=300`,
    600
  );
  if (!data?.events?.length) return [];
  return data.events.map(transformEvent);
}

/** Fetch scoreboards for a range of dates and return combined results. */
export async function fetchScoreboardRange(dates: Date[]): Promise<Game[]> {
  const results = await Promise.all(dates.map((d) => fetchScoreboard(d)));
  return results.flat();
}

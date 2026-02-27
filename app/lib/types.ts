export type GameStatus = "live" | "final" | "scheduled" | "postponed";

export interface Team {
  id: string;
  name: string;
  abbreviation: string;
  logo?: string;
  record?: string;
}

export interface Game {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  status: GameStatus;
  period?: string;
  clock?: string;
  date: string;
  time?: string;
  venue?: string;
  league: string;
}

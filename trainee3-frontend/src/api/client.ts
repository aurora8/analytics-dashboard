import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface TopTitlesFilters {
  yearFrom?: number;
  yearTo?: number;
  genre?: string;
  limit?: number;
}

function buildParams(filters: TopTitlesFilters) {
  const params: Record<string, string | number> = {};
  if (filters.yearFrom) params.yearFrom = filters.yearFrom;
  if (filters.yearTo) params.yearTo = filters.yearTo;
  if (filters.genre) params.genre = filters.genre;
  if (filters.limit) params.limit = filters.limit;
  return params;
}

export interface Overview {
  total_titles: number;
  total_movies: number;
  total_people: number;
  avg_rating: string;
  total_votes: string;
  earliest_year: number;
  latest_year: number;
}

export interface GenreBreakdown {
  genre: string;
  avg_rating: string;
  total_votes: string;
  title_count: number;
}

export interface GenreTrend {
  genre: string;
  decade: number;
  title_count: number;
}

export interface TopTitle {
  tconst: string;
  primarytitle: string;
  startyear: number;
  genres: string;
  runtimeminutes: number;
  averagerating: string;
  numvotes: string;
}

export interface CastMember {
  primaryname: string;
  title_count: number;
  avg_rating: string;
}

export interface ScatterPoint {
  runtime: number;
  rating: string;
  votes: string;
}

export interface ScatterData {
  points: ScatterPoint[];
  correlation: string;
}

export interface Collaboration {
  actor_name: string;
  director_name: string;
  collab_count: number;
}

export async function getOverview(): Promise<Overview> {
  const res = await api.get("/metrics/overview");
  return res.data;
}

export async function getGenreBreakdown(): Promise<GenreBreakdown[]> {
  const res = await api.get("/metrics/genres");
  return res.data;
}

export async function getGenreTrends(): Promise<GenreTrend[]> {
  const res = await api.get("/metrics/genre-trends");
  return res.data;
}

export async function getTopTitles(filters: TopTitlesFilters = {}): Promise<TopTitle[]> {
  const res = await api.get("/metrics/top-titles", { params: buildParams(filters) });
  return res.data;
}

export async function getCastAnalysis(): Promise<CastMember[]> {
  const res = await api.get("/metrics/cast");
  return res.data;
}

export async function getScatterData(): Promise<ScatterData> {
  const res = await api.get("/metrics/scatter");
  return res.data;
}

export async function getCollaborations(): Promise<Collaboration[]> {
  const res = await api.get("/metrics/collaborations");
  return res.data;
}

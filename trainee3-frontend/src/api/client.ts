import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface MetricsFilters {
  from?: string;
  to?: string;
  issuerId?: string;
  verifierId?: string;
  method?: string;
}

function buildParams(filters: MetricsFilters) {
  const params: Record<string, string> = {};
  if (filters.from) params.from = filters.from;
  if (filters.to) params.to = filters.to;
  if (filters.issuerId) params.issuerId = filters.issuerId;
  if (filters.verifierId) params.verifierId = filters.verifierId;
  if (filters.method) params.method = filters.method;
  return params;
}

export async function getOverview(filters: MetricsFilters = {}) {
  const res = await api.get("/metrics/overview", { params: buildParams(filters) });
  return res.data;
}

export async function getAuthMetrics(filters: MetricsFilters = {}) {
  const res = await api.get("/metrics/auth", { params: buildParams(filters) });
  return res.data;
}

export async function getFunnel(kind: "verification" | "issuance", filters: MetricsFilters = {}) {
  const res = await api.get(`/metrics/funnel/${kind}`, { params: buildParams(filters) });
  return res.data;
}

export async function getLatency(kind: "verification" | "issuance", filters: MetricsFilters = {}) {
  const res = await api.get(`/metrics/latency/${kind}`, { params: buildParams(filters) });
  return res.data;
}
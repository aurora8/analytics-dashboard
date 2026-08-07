"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
exports.getOverview = getOverview;
exports.getAuthMetrics = getAuthMetrics;
exports.getFunnel = getFunnel;
exports.getLatency = getLatency;
const axios_1 = __importDefault(require("axios"));
const API_BASE_URL = "http://localhost:3000";
exports.api = axios_1.default.create({
    baseURL: API_BASE_URL,
});
function buildParams(filters) {
    const params = {};
    if (filters.from)
        params.from = filters.from;
    if (filters.to)
        params.to = filters.to;
    if (filters.issuerId)
        params.issuerId = filters.issuerId;
    if (filters.verifierId)
        params.verifierId = filters.verifierId;
    if (filters.method)
        params.method = filters.method;
    return params;
}
async function getOverview(filters = {}) {
    const res = await exports.api.get("/metrics/overview", { params: buildParams(filters) });
    return res.data;
}
async function getAuthMetrics(filters = {}) {
    const res = await exports.api.get("/metrics/auth", { params: buildParams(filters) });
    return res.data;
}
async function getFunnel(kind, filters = {}) {
    const res = await exports.api.get(`/metrics/funnel/${kind}`, { params: buildParams(filters) });
    return res.data;
}
async function getLatency(kind, filters = {}) {
    const res = await exports.api.get(`/metrics/latency/${kind}`, { params: buildParams(filters) });
    return res.data;
}

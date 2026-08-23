"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsController = void 0;
const common_1 = require("@nestjs/common");
const metrics_service_1 = require("./metrics.service");
const top_titles_query_dto_1 = require("./dto/top-titles-query.dto");
let MetricsController = class MetricsController {
    constructor(metricsService) {
        this.metricsService = metricsService;
    }
    getOverview() {
        return this.metricsService.getOverview();
    }
    getGenreBreakdown() {
        return this.metricsService.getGenreBreakdown();
    }
    getGenreTrends() {
        return this.metricsService.getGenreTrends();
    }
    getTopTitles(query) {
        return this.metricsService.getTopTitles(query);
    }
    getCastAnalysis() {
        return this.metricsService.getCastAnalysis();
    }
    getCollaborations() {
        return this.metricsService.getCollaborations();
    }
};
exports.MetricsController = MetricsController;
__decorate([
    (0, common_1.Get)('overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MetricsController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('genres'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MetricsController.prototype, "getGenreBreakdown", null);
__decorate([
    (0, common_1.Get)('genre-trends'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MetricsController.prototype, "getGenreTrends", null);
__decorate([
    (0, common_1.Get)('top-titles'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [top_titles_query_dto_1.TopTitlesQueryDto]),
    __metadata("design:returntype", void 0)
], MetricsController.prototype, "getTopTitles", null);
__decorate([
    (0, common_1.Get)('cast'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MetricsController.prototype, "getCastAnalysis", null);
__decorate([
    (0, common_1.Get)('collaborations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MetricsController.prototype, "getCollaborations", null);
exports.MetricsController = MetricsController = __decorate([
    (0, common_1.Controller)('metrics'),
    __metadata("design:paramtypes", [metrics_service_1.MetricsService])
], MetricsController);

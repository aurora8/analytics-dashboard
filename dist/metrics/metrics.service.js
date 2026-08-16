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
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const auth_event_entity_1 = require("../auth-events/auth-event.entity");
const issuance_session_entity_1 = require("../issuance-sessions/issuance-session.entity");
const verification_session_entity_1 = require("../verification-sessions/verification-session.entity");
let MetricsService = class MetricsService {
    constructor(authEventsRepo, issuanceRepo, verificationRepo) {
        this.authEventsRepo = authEventsRepo;
        this.issuanceRepo = issuanceRepo;
        this.verificationRepo = verificationRepo;
    }
    async getSummary() {
        const [totalAuthEvents, failedAuthEvents, totalIssuance, totalVerification] = await Promise.all([
            this.authEventsRepo.count(),
            this.authEventsRepo.count({ where: { success: false } }),
            this.issuanceRepo.count(),
            this.verificationRepo.count(),
        ]);
        return {
            totalAuthEvents,
            failedAuthEvents,
            totalIssuanceSessions: totalIssuance,
            totalVerificationSessions: totalVerification,
        };
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(auth_event_entity_1.AuthEvent)),
    __param(1, (0, typeorm_1.InjectRepository)(issuance_session_entity_1.IssuanceSession)),
    __param(2, (0, typeorm_1.InjectRepository)(verification_session_entity_1.VerificationSession)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MetricsService);

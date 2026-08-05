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
exports.LoggingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const auth_event_entity_1 = require("../entities/auth-event.entity");
/**
 * Central place for recording the events the dashboard needs to chart:
 * login attempts, MFA outcomes, and (via the session repositories,
 * used directly by whichever service owns verification/issuance flows)
 * session status transitions.
 *
 * Call this from the auth flow wherever a login or MFA step happens —
 * e.g. authService.recordAuthEvent(userId, 'login_failure', req).
 */
let LoggingService = class LoggingService {
    constructor(authEventRepo) {
        this.authEventRepo = authEventRepo;
    }
    async recordAuthEvent(userId, eventType, opts = {}) {
        const event = this.authEventRepo.create({
            userId,
            eventType,
            ipAddress: opts.ipAddress,
            userAgent: opts.userAgent,
            metadata: opts.metadata,
        });
        return this.authEventRepo.save(event);
    }
    recordLoginAttempt(userId, ipAddress, userAgent) {
        return this.recordAuthEvent(userId, 'login_attempt', { ipAddress, userAgent });
    }
    recordLoginResult(userId, success, ipAddress) {
        return this.recordAuthEvent(userId, success ? 'login_success' : 'login_failure', { ipAddress });
    }
    recordMfaResult(userId, success, ipAddress) {
        return this.recordAuthEvent(userId, success ? 'mfa_success' : 'mfa_failure', { ipAddress });
    }
};
exports.LoggingService = LoggingService;
exports.LoggingService = LoggingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(auth_event_entity_1.AuthEvent)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LoggingService);

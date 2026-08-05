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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationSession = void 0;
const typeorm_1 = require("typeorm");
const verifier_entity_1 = require("./verifier.entity");
let VerificationSession = class VerificationSession {
};
exports.VerificationSession = VerificationSession;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VerificationSession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => verifier_entity_1.Verifier),
    (0, typeorm_1.JoinColumn)({ name: 'verifier_id' }),
    __metadata("design:type", verifier_entity_1.Verifier)
], VerificationSession.prototype, "verifier", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'verifier_id' }),
    __metadata("design:type", String)
], VerificationSession.prototype, "verifierId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'holder_did' }),
    __metadata("design:type", String)
], VerificationSession.prototype, "holderDid", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VerificationSession.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], VerificationSession.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_at', nullable: true }),
    __metadata("design:type", Date)
], VerificationSession.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'latency_ms', nullable: true }),
    __metadata("design:type", Number)
], VerificationSession.prototype, "latencyMs", void 0);
exports.VerificationSession = VerificationSession = __decorate([
    (0, typeorm_1.Entity)('verification_sessions')
], VerificationSession);

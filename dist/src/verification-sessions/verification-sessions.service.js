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
exports.VerificationSessionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const verification_session_entity_1 = require("./verification-session.entity");
let VerificationSessionsService = class VerificationSessionsService {
    constructor(verificationSessionsRepository) {
        this.verificationSessionsRepository = verificationSessionsRepository;
    }
    create(data) {
        const session = this.verificationSessionsRepository.create(data);
        return this.verificationSessionsRepository.save(session);
    }
    findAll() {
        return this.verificationSessionsRepository.find();
    }
};
exports.VerificationSessionsService = VerificationSessionsService;
exports.VerificationSessionsService = VerificationSessionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(verification_session_entity_1.VerificationSession)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], VerificationSessionsService);

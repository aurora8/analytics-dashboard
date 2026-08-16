"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationSessionsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const verification_sessions_service_1 = require("./verification-sessions.service");
const verification_sessions_controller_1 = require("./verification-sessions.controller");
const verification_session_entity_1 = require("./verification-session.entity");
let VerificationSessionsModule = class VerificationSessionsModule {
};
exports.VerificationSessionsModule = VerificationSessionsModule;
exports.VerificationSessionsModule = VerificationSessionsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([verification_session_entity_1.VerificationSession])],
        providers: [verification_sessions_service_1.VerificationSessionsService],
        controllers: [verification_sessions_controller_1.VerificationSessionsController],
    })
], VerificationSessionsModule);

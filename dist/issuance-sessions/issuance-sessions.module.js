"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssuanceSessionsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const issuance_sessions_service_1 = require("./issuance-sessions.service");
const issuance_sessions_controller_1 = require("./issuance-sessions.controller");
const issuance_session_entity_1 = require("./issuance-session.entity");
let IssuanceSessionsModule = class IssuanceSessionsModule {
};
exports.IssuanceSessionsModule = IssuanceSessionsModule;
exports.IssuanceSessionsModule = IssuanceSessionsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([issuance_session_entity_1.IssuanceSession])],
        providers: [issuance_sessions_service_1.IssuanceSessionsService],
        controllers: [issuance_sessions_controller_1.IssuanceSessionsController],
    })
], IssuanceSessionsModule);

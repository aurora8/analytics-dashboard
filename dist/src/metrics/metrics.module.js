"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_event_entity_1 = require("../entities/auth-event.entity");
const verification_session_entity_1 = require("../entities/verification-session.entity");
const issuance_session_entity_1 = require("../entities/issuance-session.entity");
const metrics_controller_1 = require("./metrics.controller");
const metrics_service_1 = require("./metrics.service");
let MetricsModule = class MetricsModule {
};
exports.MetricsModule = MetricsModule;
exports.MetricsModule = MetricsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([auth_event_entity_1.AuthEvent, verification_session_entity_1.VerificationSession, issuance_session_entity_1.IssuanceSession])],
        controllers: [metrics_controller_1.MetricsController],
        providers: [metrics_service_1.MetricsService],
    })
], MetricsModule);

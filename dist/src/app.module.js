"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const issuer_entity_1 = require("./entities/issuer.entity");
const verifier_entity_1 = require("./entities/verifier.entity");
const did_entity_1 = require("./entities/did.entity");
const verification_session_entity_1 = require("./entities/verification-session.entity");
const issuance_session_entity_1 = require("./entities/issuance-session.entity");
const auth_event_entity_1 = require("./entities/auth-event.entity");
const logging_module_1 = require("./logging/logging.module");
const metrics_module_1 = require("./metrics/metrics.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                url: process.env.DATABASE_URL,
                // Swap DATABASE_URL for the staging connection string once it's
                // shared with the team — nothing else here needs to change.
                entities: [issuer_entity_1.Issuer, verifier_entity_1.Verifier, did_entity_1.Did, verification_session_entity_1.VerificationSession, issuance_session_entity_1.IssuanceSession, auth_event_entity_1.AuthEvent],
                synchronize: false, // schema is managed by init.sql / migrations, not auto-sync
            }),
            logging_module_1.LoggingModule,
            metrics_module_1.MetricsModule,
        ],
    })
], AppModule);

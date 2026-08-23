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
const title_basics_entity_1 = require("./entities/title-basics.entity");
const title_akas_entity_1 = require("./entities/title-akas.entity");
const title_ratings_entity_1 = require("./entities/title-ratings.entity");
const title_crew_entity_1 = require("./entities/title-crew.entity");
const title_episode_entity_1 = require("./entities/title-episode.entity");
const name_basics_entity_1 = require("./entities/name-basics.entity");
const title_principals_entity_1 = require("./entities/title-principals.entity");
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
                entities: [title_basics_entity_1.TitleBasics, title_akas_entity_1.TitleAkas, title_ratings_entity_1.TitleRatings, title_crew_entity_1.TitleCrew, title_episode_entity_1.TitleEpisode, name_basics_entity_1.NameBasics, title_principals_entity_1.TitlePrincipals],
                synchronize: false,
            }),
            metrics_module_1.MetricsModule,
        ],
    })
], AppModule);

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
exports.TitlePrincipals = void 0;
const typeorm_1 = require("typeorm");
let TitlePrincipals = class TitlePrincipals {
};
exports.TitlePrincipals = TitlePrincipals;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'tconst' }),
    __metadata("design:type", String)
], TitlePrincipals.prototype, "tconst", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'ordering', type: 'int' }),
    __metadata("design:type", Number)
], TitlePrincipals.prototype, "ordering", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nconst', nullable: true }),
    __metadata("design:type", String)
], TitlePrincipals.prototype, "nconst", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category', nullable: true }),
    __metadata("design:type", String)
], TitlePrincipals.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'job', nullable: true }),
    __metadata("design:type", String)
], TitlePrincipals.prototype, "job", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'characters', nullable: true }),
    __metadata("design:type", String)
], TitlePrincipals.prototype, "characters", void 0);
exports.TitlePrincipals = TitlePrincipals = __decorate([
    (0, typeorm_1.Entity)({ name: 'title_principals' })
], TitlePrincipals);

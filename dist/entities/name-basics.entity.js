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
exports.NameBasics = void 0;
const typeorm_1 = require("typeorm");
let NameBasics = class NameBasics {
};
exports.NameBasics = NameBasics;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'nconst' }),
    __metadata("design:type", String)
], NameBasics.prototype, "nconst", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'primaryname', nullable: true }),
    __metadata("design:type", String)
], NameBasics.prototype, "primaryName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'birthyear', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], NameBasics.prototype, "birthYear", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deathyear', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], NameBasics.prototype, "deathYear", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'primaryprofession', nullable: true }),
    __metadata("design:type", String)
], NameBasics.prototype, "primaryProfession", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'knownfortitles', nullable: true }),
    __metadata("design:type", String)
], NameBasics.prototype, "knownForTitles", void 0);
exports.NameBasics = NameBasics = __decorate([
    (0, typeorm_1.Entity)({ name: 'name_basics' })
], NameBasics);

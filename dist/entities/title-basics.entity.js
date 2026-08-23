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
exports.TitleBasics = void 0;
const typeorm_1 = require("typeorm");
let TitleBasics = class TitleBasics {
};
exports.TitleBasics = TitleBasics;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'tconst' }),
    __metadata("design:type", String)
], TitleBasics.prototype, "tconst", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'titletype', nullable: true }),
    __metadata("design:type", String)
], TitleBasics.prototype, "titleType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'primarytitle', nullable: true }),
    __metadata("design:type", String)
], TitleBasics.prototype, "primaryTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'originaltitle', nullable: true }),
    __metadata("design:type", String)
], TitleBasics.prototype, "originalTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'isadult', nullable: true }),
    __metadata("design:type", Boolean)
], TitleBasics.prototype, "isAdult", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'startyear', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], TitleBasics.prototype, "startYear", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'endyear', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], TitleBasics.prototype, "endYear", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'runtimeminutes', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], TitleBasics.prototype, "runtimeMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'genres', nullable: true }),
    __metadata("design:type", String)
], TitleBasics.prototype, "genres", void 0);
exports.TitleBasics = TitleBasics = __decorate([
    (0, typeorm_1.Entity)({ name: 'title_basics' })
], TitleBasics);

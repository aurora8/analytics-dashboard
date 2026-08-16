"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const issuance_sessions_controller_1 = require("./issuance-sessions.controller");
describe('IssuanceSessionsController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [issuance_sessions_controller_1.IssuanceSessionsController],
        }).compile();
        controller = module.get(issuance_sessions_controller_1.IssuanceSessionsController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});

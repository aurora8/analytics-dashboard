"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const verification_sessions_controller_1 = require("./verification-sessions.controller");
describe('VerificationSessionsController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [verification_sessions_controller_1.VerificationSessionsController],
        }).compile();
        controller = module.get(verification_sessions_controller_1.VerificationSessionsController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});

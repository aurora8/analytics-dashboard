"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const verification_sessions_service_1 = require("./verification-sessions.service");
describe('VerificationSessionsService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [verification_sessions_service_1.VerificationSessionsService],
        }).compile();
        service = module.get(verification_sessions_service_1.VerificationSessionsService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

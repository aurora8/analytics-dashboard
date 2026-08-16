"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const issuance_sessions_service_1 = require("./issuance-sessions.service");
describe('IssuanceSessionsService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [issuance_sessions_service_1.IssuanceSessionsService],
        }).compile();
        service = module.get(issuance_sessions_service_1.IssuanceSessionsService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_events_service_1 = require("./auth-events.service");
describe('AuthEventsService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [auth_events_service_1.AuthEventsService],
        }).compile();
        service = module.get(auth_events_service_1.AuthEventsService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

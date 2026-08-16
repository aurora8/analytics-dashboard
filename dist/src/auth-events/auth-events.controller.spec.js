"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_events_controller_1 = require("./auth-events.controller");
describe('AuthEventsController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [auth_events_controller_1.AuthEventsController],
        }).compile();
        controller = module.get(auth_events_controller_1.AuthEventsController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});

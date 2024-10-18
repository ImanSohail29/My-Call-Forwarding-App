"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const callController_1 = require("../controller/callController");
const router = (0, express_1.Router)();
// Define routes
router.post("/call", callController_1.incomingCall);
router.post("/mail", callController_1.handleVoiceMail);
router.post('/twiml', callController_1.twimlResponse); // TwiML endpoint for call forwarding
exports.default = router;

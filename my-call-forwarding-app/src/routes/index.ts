import { Router } from "express";
import { incomingCall, handleVoiceMail,twimlResponse } from '../controller/callController';

const router = Router();

// Define routes
router.post("/call", incomingCall);
router.post("/mail", handleVoiceMail);
router.post('/twiml', twimlResponse); // TwiML endpoint for call forwarding

export default router;

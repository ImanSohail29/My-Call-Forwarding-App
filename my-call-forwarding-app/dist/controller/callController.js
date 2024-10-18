"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleVoiceMail = exports.twimlResponse = exports.incomingCall = void 0;
const twilio_1 = __importDefault(require("twilio"));
const callModel_1 = __importDefault(require("../model/callModel"));
// Initialize Twilio client
const client = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
// Handle incoming calls
const incomingCall = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const twiml = new twilio_1.default.twiml.VoiceResponse();
    const userInput = req.body.Digits; // Get the user input
    const forwardTo = process.env.FORWARD_TO;
    const twilioNumber = process.env.TWILIO_NUMBER;
    if (!forwardTo || !twilioNumber) {
        console.error('Forwarding number or Twilio number is not set.');
        res.status(500).send('Server configuration error');
        return;
    }
    if (userInput === '1') {
        // Forward the call
        client.calls.create({
            url: `https://your-render-url/twiml?to=${encodeURIComponent(forwardTo)}`, // URL to your TwiML endpoint
            to: forwardTo, // Number to forward to
            from: twilioNumber, // Twilio number
        })
            .then((call) => {
            const body = {
                caller_number: call.from,
                dialed_number: call.to,
                call_sid: call.sid,
                status: 'in-progress', // Log status
            };
            const voiceCall = new callModel_1.default(body);
            voiceCall.save()
                .then(() => console.log('Call details saved to MongoDB:', body))
                .catch((error) => console.error('Error saving call details:', error));
        })
            .catch(error => console.error('Error creating call:', error));
        twiml.say('Forwarding your call now.');
    }
    else if (userInput === '2') {
        // Handle voicemail
        twiml.say('Please leave a voicemail after the beep.');
        twiml.record({
            action: '/mail', // Action URL for voicemail
            maxLength: 60,
        });
    }
    else {
        // Invalid input; replay menu
        const gatherNode = twiml.gather({
            numDigits: 1,
            action: '/call',
        });
        gatherNode.say('Welcome to the IVR menu. Press 1 to forward your call or 2 to leave a voicemail.');
    }
    res.type('text/xml');
    res.send(twiml.toString());
});
exports.incomingCall = incomingCall;
// TwiML response for call forwarding
const twimlResponse = (req, res) => {
    const twiml = new twilio_1.default.twiml.VoiceResponse();
    const forwardTo = Array.isArray(req.query.to) ? req.query.to[0] : req.query.to; // Ensure it's a string
    if (forwardTo) {
        twiml.say('Please hold while we connect your call.');
        twiml.dial(forwardTo); // Dial the forwarded number
    }
    else {
        twiml.say('No forwarding number provided. Please try again later.');
    }
    res.type('text/xml');
    res.send(twiml.toString());
};
exports.twimlResponse = twimlResponse;
// Handle voicemail recording
const handleVoiceMail = (req, res) => {
    const voicemail = req.body.RecordingUrl; // Get the recording URL
    const body = {
        voicemail_url: voicemail,
    };
    // Save voicemail details to the database
    const voiceCall = new callModel_1.default(body);
    voiceCall.save()
        .then(() => res.send('<Response><Say>Your voicemail has been recorded. Thank you!</Say></Response>'))
        .catch((error) => console.error('Error saving voicemail:', error));
};
exports.handleVoiceMail = handleVoiceMail;

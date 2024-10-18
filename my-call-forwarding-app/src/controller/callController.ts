import { Request, Response } from 'express';
import twilio from 'twilio';
import Call from '../model/callModel';

// Initialize Twilio client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Handle incoming calls
export const incomingCall = async (req: Request, res: Response) => {
  const twiml = new twilio.twiml.VoiceResponse();
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
      const voiceCall = new Call(body);
      voiceCall.save()
        .then(() => console.log('Call details saved to MongoDB:', body))
        .catch((error:any) => console.error('Error saving call details:', error));
    })
    .catch(error => console.error('Error creating call:', error));

    twiml.say('Forwarding your call now.');
  }else if (userInput === '2') {
    // Handle voicemail
    twiml.say('Please leave a voicemail after the beep.');
    twiml.record({
      action: '/mail', // Action URL for voicemail
      maxLength: 60,
    });
  } else {
    // Invalid input; replay menu
    const gatherNode = twiml.gather({
      numDigits: 1,
      action: '/call',
    });
  
    gatherNode.say('Welcome to the IVR menu. Press 1 to forward your call or 2 to leave a voicemail.');
  }

  res.type('text/xml');
  res.send(twiml.toString());
};
// TwiML response for call forwarding
export const twimlResponse = (req: Request, res: Response) => {
    const twiml = new twilio.twiml.VoiceResponse();
    const forwardTo = Array.isArray(req.query.to) ? req.query.to[0] : req.query.to; // Ensure it's a string
  
    if (forwardTo) {
      twiml.say('Please hold while we connect your call.');
      twiml.dial(forwardTo as string); // Dial the forwarded number
    } else {
      twiml.say('No forwarding number provided. Please try again later.');
    }
  
    res.type('text/xml');
    res.send(twiml.toString());
  };
  
// Handle voicemail recording
export const handleVoiceMail = (req: Request, res: Response) => {
  const voicemail = req.body.RecordingUrl; // Get the recording URL
  const body = {
    voicemail_url: voicemail,
  };
  
  // Save voicemail details to the database
  const voiceCall = new Call(body);
  voiceCall.save()
    .then(() => res.send('<Response><Say>Your voicemail has been recorded. Thank you!</Say></Response>'))
    .catch((error:any) => console.error('Error saving voicemail:', error));
};

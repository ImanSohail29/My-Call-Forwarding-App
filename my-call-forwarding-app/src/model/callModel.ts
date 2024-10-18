import mongoose, { Document, Schema } from 'mongoose';

// Define an interface for the voice call
interface Call extends Document {
  caller_number: string;
  dialed_number: string;
  call_sid: string;
  voicemail_url?: string;
  duration?: number; // Duration of the call
  status?: string; // Status of the call (completed, in-progress, etc.)
}

// Define the schema for voice calls
const callSchema = new Schema<Call>({
  caller_number: { type: String },
  dialed_number: { type: String },
  call_sid: { type: String },
  voicemail_url: { type: String },
  duration: { type: Number },
  status: { type: String },
}, { timestamps: true }); // Automatically add createdAt and updatedAt timestamps

export default mongoose.model<Call>('Call', callSchema);

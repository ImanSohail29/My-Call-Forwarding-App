import mongoose from 'mongoose';

// Connection URL from the .env file
const uri = process.env.MONGODB_URI as string;

// Connect to MongoDB
console.log(uri)
mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000,
  });

// Get the default connection
const db = mongoose.connection;

// Event handlers for successful connection and error
db.on('connected', () => {
  console.log('Connected to MongoDB');
});

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

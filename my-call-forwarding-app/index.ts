// Import required packages

// Load environment variables
import dotenv from 'dotenv';

dotenv.config();
import express from 'express';
import router from './src/routes';
import http from 'http';
import './src/config/db';


const app = express();
const port = process.env.PORT || 3000; // Set port from environment or default to 3000

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up routes
app.use('/', router);

// Create HTTP server
const server = http.createServer(app);

// Start the server
server.listen(port, () => {
  console.log("Server is running on port:", port);
});

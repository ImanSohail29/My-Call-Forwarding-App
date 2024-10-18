"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Connection URL from the .env file
const uri = process.env.MONGODB_URI;
// Connect to MongoDB
console.log(uri);
mongoose_1.default.connect(uri, {
    serverSelectionTimeoutMS: 30000,
});
// Get the default connection
const db = mongoose_1.default.connection;
// Event handlers for successful connection and error
db.on('connected', () => {
    console.log('Connected to MongoDB');
});
db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

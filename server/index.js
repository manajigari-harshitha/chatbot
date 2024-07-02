import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
// Import route modules
import authRoutes from './routes/authRoutes.js';
import botRoutes from './routes/botRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import userRoutes from './routes/userRoutes.js';


dotenv.config(); // Load API key from .env file

const app = express();
const PORT = process.env.PORT || 5000;


const corsOptions = {
  origin: process.env.frontEndURL || 'http://localhost:3000', // Allow requests from frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Route setup
app.use('/api/auth', authRoutes);
app.use('/api/bot', botRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/user', userRoutes);


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
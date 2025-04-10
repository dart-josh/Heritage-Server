import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './config/db';

dotenv.config();

const app = express();

app.listen(5000, () => {
    connectDB();
    console.log('Server started on port 5000')
});
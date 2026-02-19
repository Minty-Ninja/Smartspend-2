import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai'
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json())

//Gemini Env
const gen =  new GoogleGenAI(process.env.GEMINI_API_KEY)


import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import allRoutes from '@/routes/routes';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

app.use(
  cors({
    credentials: true,
    origin: [process.env.ALLOW_CORS_ORIGIN_ONE!, process.env.ALLOW_CORS_ORIGIN_TWO!],
  })
);
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET_KEY));
app.use('/api/v1', allRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

startServer();

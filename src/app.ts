import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createDatabase } from './config/db';
import { createTables } from './config/initTables';
import allRoutes from '@/routes/routes';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    credentials: true,
    origin: [process.env.ALLOW_CORS_ORIGIN_ONE!, process.env.ALLOW_CORS_ORIGIN_TWO!],
  })
);
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET_KEY));
app.use('/api/v1', allRoutes);

(async () => {
  await createDatabase(process.env.DB_NAME!);
  await createTables();
})();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

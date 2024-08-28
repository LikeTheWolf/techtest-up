import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { connectToDatabase } from './database';
import { DataFetch } from './dataFetch';

const app = express();

dotenv.config({ path: '.env.production' });

const SERVER_PORT = process.env.PORT;

app.get('/heartbeat', (req: Request, res: Response) => {
  res.send('OK');
});

app.get('/testFetchData', (req: Request, res: Response) => {
  DataFetch.testFetchData();
  res.send('OK');
});

app.listen(SERVER_PORT, async () => {
  console.log(`Server is running on port:${SERVER_PORT}`);

  await connectToDatabase();
  const TICK_INTERVAL = 60000;
  const fetcher = new DataFetch(TICK_INTERVAL);

  process.on("uncaughtException", (innerErr: Error) => {
    console.error(`UNCAUGHT EXCEPTION AT SYSTEM LEVEL: ${innerErr.message}`);
    console.warn(`Stack Trace: ${innerErr.stack}`);
  });

  process.on("unhandledRejection", (reason: any) => {
    console.warn(`Unhandled Rejection at: Promise, reason: ${reason}`);
  });
});


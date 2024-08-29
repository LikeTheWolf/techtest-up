import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import http from 'http';
import { connectToDatabase } from './database';
import { DataFetch } from './dataFetch';
import SocketConnector from './socketConnector';

// Load environment variables from the correct file
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const app = express();

const SERVER_PORT = process.env.PORT;

app.get('/heartbeat', (req: Request, res: Response) => {
  res.send('OK');
});

const server = http.createServer(app);
const socketConnector = new SocketConnector(server);

server.listen(SERVER_PORT, async () => {
  console.log(`Server is running on port:${SERVER_PORT}`);

  await connectToDatabase();
  const TICK_INTERVAL = 60000;
  const fetcher = new DataFetch(socketConnector, TICK_INTERVAL);

  socketConnector.on('connect', async ()=>{
    //const initialData = await DataFetch.fetchAggregatedData();
  
    //socketConnector.emit('initialData', initialData);
  })

  process.on("uncaughtException", (innerErr: Error) => {
    console.error(`UNCAUGHT EXCEPTION AT SYSTEM LEVEL: ${innerErr.message}`);
    console.warn(`Stack Trace: ${innerErr.stack}`);
  });

  process.on("unhandledRejection", (reason: any) => {
    console.warn(`Unhandled Rejection at: Promise, reason: ${reason}`);
  });
});


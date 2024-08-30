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
// let server = null;

// if(process.env.NODE_ENV === 'production'){
//   // Load SSL certificates from the mounted directory in the container
//   const options = {
//     key: fs.readFileSync('./ssl/cloudflare-origin.key'),  // Use the mounted path
//     cert: fs.readFileSync('./ssl/cloudflare-origin.pem'), // Use the mounted path
//   };
//   // Create an HTTPS server
//   server = https.createServer(options, app);
// } else {
//   server = http.createServer(app);
// }

const server = http.createServer(app);
const SERVER_PORT = process.env.PORT;

app.get('/heartbeat', (req: Request, res: Response) => {
  res.send('OK');
});

const socketConnector = new SocketConnector(server);

server.listen(SERVER_PORT, async () => {
  console.log(`Server is running on port:${SERVER_PORT}`);

  await connectToDatabase();
  const TICK_INTERVAL = 60000;
  const fetcher = new DataFetch(socketConnector, TICK_INTERVAL);

  socketConnector.on('connect', async () => {
    // Start fetching both recent and historic data concurrently
    const recentDataPromise = DataFetch.fetchAggregatedDataRecent();
    const historicDataPromise = DataFetch.fetchAggregatedDataHistoric();
  
    // Handle recent data first when it's ready
    recentDataPromise
      .then(initialDataRecent => {
        socketConnector.emit('initialDataRecent', initialDataRecent);
      })
      .catch(error => {
        console.error('Error fetching recent data:', error);
        // Optionally emit an error or handle it in some way
        socketConnector.emit('error', 'Failed to fetch recent data');
      });
  
    // Handle historic data when it's ready
    historicDataPromise
      .then(initialDataHistoric => {
        socketConnector.emit('initialDataHistoric', initialDataHistoric);
      })
      .catch(error => {
        console.error('Error fetching historic data:', error);
        // Optionally emit an error or handle it in some way
        socketConnector.emit('error', 'Failed to fetch historic data');
      });
  });

  process.on("uncaughtException", (innerErr: Error) => {
    console.error(`UNCAUGHT EXCEPTION AT SYSTEM LEVEL: ${innerErr.message}`);
    console.warn(`Stack Trace: ${innerErr.stack}`);
  });

  process.on("unhandledRejection", (reason: any) => {
    console.warn(`Unhandled Rejection at: Promise, reason: ${reason}`);
  });
});


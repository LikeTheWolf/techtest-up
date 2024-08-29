import { Document, Schema, model } from 'mongoose';

// Interface for each region's status
interface IRegionStatus {
  status: string;
  region: string;
  roles: string[];
  results: IResults;
  strict: boolean;
  server_issue: any;
}

// Define the interface for the worker
interface IWorker {
  wait_time: number;
  workers: number;
  waiting: number;
  idle: number;
  time_to_return: number;
  recently_blocked_keys: [string, number, Date][];
  top_keys: [string, number][];
}

// Define the interface for the server
interface IServer {
  active_connections: number;
  wait_time: number;
  workers: [string, IWorker][];
  cpu_load: number;
  timers: number;
}

// Define the interface for stats
interface IStats {
  servers_count: number;
  online: number;
  session: number;
  server: IServer;
}

// Define the interface for services
interface IServices {
  redis: boolean;
  database: boolean;
}

// Define the interface for results
interface IResults {
  services: IServices;
  stats: IStats;
}

// Define the top-level interface for the document
export interface IStoredStatusModel extends Document {
  timestamp: Date; // field for TTL
  regions: IRegionStatus[]; // array of region statuses
}

// Define the schemas based on the interfaces
const workerSchema = new Schema<IWorker>(
  {
    wait_time: { type: Number, required: true },
    workers: { type: Number, required: true },
    waiting: { type: Number, required: true },
    idle: { type: Number, required: true },
    time_to_return: { type: Number, required: true },
    recently_blocked_keys: [[Schema.Types.Mixed]],
    top_keys: [[Schema.Types.Mixed]],
  },
  { _id: false } // Disable _id on everything but the top-level document
);

const workerTupleSchema = new Schema({
  0: { type: String, required: true }, // The worker type
  1: { type: workerSchema, required: true }, // The worker object
}, { _id: false }); // Disable _id for subdocuments

const serverSchema = new Schema<IServer>(
  {
    active_connections: { type: Number, required: true },
    wait_time: { type: Number, required: true },
    workers: [workerTupleSchema], // Define workers as an array of [string, IWorker] tuples
    cpu_load: { type: Number, required: true },
    timers: { type: Number, required: true },
  },
  { _id: false } // Disable _id on everything but the top-level document
);

const statsSchema = new Schema<IStats>(
  {
    servers_count: { type: Number, required: true },
    online: { type: Number, required: true },
    session: { type: Number, required: true },
    server: { type: serverSchema, required: true },
  },
  { _id: false } // Disable _id on everything but the top-level document
);

const servicesSchema = new Schema<IServices>(
  {
    redis: { type: Boolean, required: true },
    database: { type: Boolean, required: true },
  },
  { _id: false } // Disable _id on everything but the top-level document
);

const resultsSchema = new Schema<IResults>(
  {
    services: { type: servicesSchema, required: true },
    stats: { type: statsSchema, required: true },
  },
  { _id: false } // Disable _id on everything but the top-level document
);

// Schema for each region's status
const regionStatusSchema = new Schema<IRegionStatus>(
  {
    status: { type: String, required: true },
    region: { type: String, required: true },
    roles: [{ type: String, required: true }],
    results: { type: resultsSchema, required: true },
    strict: { type: Boolean, required: true },
    server_issue: { type: Schema.Types.Mixed },
  },
  { _id: false } // Disable _id for the region subdocument
);

// Top-level schema for the document containing all regions
const storedStatusSchema = new Schema<IStoredStatusModel>({
  timestamp: { type: Date, default: Date.now, expires: '7d' }, // TTL field
  regions: { type: [regionStatusSchema], required: true }, // Array of regions
});

const StoredStatusModel = model<IStoredStatusModel>('StoredStatus', storedStatusSchema, 'status_history');

export default StoredStatusModel;
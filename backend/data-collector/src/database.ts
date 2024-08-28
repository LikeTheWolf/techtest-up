import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: '.env.production' });

// Access environment variables
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;

const connectionString = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;

const options: mongoose.ConnectOptions = {
  bufferCommands: true,
  dbName: DB_NAME,
  autoIndex: true,
  autoCreate: true,
};

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(connectionString, options);
    const logSafeUrl = `${DB_HOST}:${DB_PORT}/${DB_NAME}`;
    console.log(`Connected to MongoDB with Mongoose - ${logSafeUrl}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }

  mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB with Mongoose');
  });

  mongoose.connection.on('error', (error: Error) => {
    console.error('Error connecting to MongoDB:', error);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('Mongoose reconnected to MongoDB');
  });
};

export default mongoose;

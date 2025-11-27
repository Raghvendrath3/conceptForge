import mongoose from 'mongoose';
import { env } from './env';

// Currently mocked - CHANGE THIS:
export const connectDB = async () => {
  try {
    // UNCOMMENT THESE LINES:
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // DELETE THE MOCK:
    // console.log('MongoDB Connected (Mocked)');
    // return;
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { createServer } from 'http';
import { initSocket } from './sockets/socketManager';

const server = createServer(app);
const io = initSocket(server);

const start = async () => {
  try {
    await connectDB();
    server.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();

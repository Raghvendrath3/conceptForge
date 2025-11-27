import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';

import authRoutes from './routes/authRoutes';
import nodeRoutes from './routes/nodeRoutes';
import edgeRoutes from './routes/edgeRoutes';
import flashcardRoutes from './routes/flashcardRoutes';
import aiRoutes from './routes/aiRoutes';

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/edges', edgeRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
  res.send('ConceptForge API Running');
});

export default app;

import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/authRoutes.ts';
import { musiciansRouter } from './routes/musiciansRoutes.ts';
import { eventsRouter } from './routes/eventsRoutes.ts';
import { postsRouter } from './routes/postsRoutes.ts';

export const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'BandMate API', timestamp: new Date().toISOString() });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/musicians', musiciansRouter);
app.use('/api/events', eventsRouter);
app.use('/api/posts', postsRouter);

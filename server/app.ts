import express from 'express';
import cors from 'cors';
import { connectDB } from './db.ts';
import { authRouter } from './routes/authRoutes.ts';
import { musiciansRouter } from './routes/musiciansRoutes.ts';
import { eventsRouter } from './routes/eventsRoutes.ts';
import { postsRouter } from './routes/postsRoutes.ts';

export const app = express();

app.use(cors());
app.use(express.json());

// Ensure MongoDB is connected before handling API requests
app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err: any) {
    console.error('MongoDB connection error:', err);
    res.status(500).json({ 
      error: `Errore connessione MongoDB Atlas: ${err.message}. Verifica in MongoDB Atlas -> Network Access che l'IP 0.0.0.0/0 sia autorizzato.` 
    });
  }
});


// Health check
app.get(['/api/health', '/health', '/api', '/'], (_req, res) => {
  res.json({ status: 'ok', service: 'BandMate API (MongoDB)', timestamp: new Date().toISOString() });
});

// Mount Routes for both /api/* and root /* (for Vercel rewrites flexibility)
app.use('/api/auth', authRouter);
app.use('/auth', authRouter);

app.use('/api/musicians', musiciansRouter);
app.use('/musicians', musiciansRouter);

app.use('/api/events', eventsRouter);
app.use('/events', eventsRouter);

app.use('/api/posts', postsRouter);
app.use('/posts', postsRouter);

export default app;

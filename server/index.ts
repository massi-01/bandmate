import { app } from './app.ts';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🎸 BandMate API Server running at http://localhost:${PORT}`);
});

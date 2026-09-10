import { Router } from 'express';
import { db, formatMusicianRow } from '../db.ts';
import { requireAuth, type AuthenticatedRequest } from '../auth.ts';

export const musiciansRouter = Router();

// GET all musicians with optional query filters
musiciansRouter.get('/', (req, res) => {
  const { search, instrument, city, genre } = req.query;

  const rows = db.prepare('SELECT * FROM musicians ORDER BY created_at DESC').all();
  let list = rows.map(formatMusicianRow);

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(m => 
      m.name.toLowerCase().includes(q) ||
      m.bio.toLowerCase().includes(q) ||
      m.instruments.some((i: any) => i.name.toLowerCase().includes(q))
    );
  }

  if (instrument && typeof instrument === 'string' && instrument !== 'all') {
    const target = instrument.toLowerCase();
    list = list.filter(m => 
      m.instruments.some((i: any) => i.name.toLowerCase() === target)
    );
  }

  if (city && typeof city === 'string' && city !== 'all') {
    const target = city.toLowerCase();
    list = list.filter(m => m.city.toLowerCase().includes(target));
  }

  if (genre && typeof genre === 'string' && genre !== 'all') {
    const target = genre.toLowerCase();
    list = list.filter(m => 
      m.genres.some((g: string) => g.toLowerCase() === target)
    );
  }

  res.json({ musicians: list });
});

// GET single musician by ID
musiciansRouter.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM musicians WHERE id = ?').get(req.params.id);
  if (!row) {
    res.status(404).json({ error: 'Musicista non trovato.' });
    return;
  }
  res.json({ musician: formatMusicianRow(row) });
});

// PUT update musician profile (Protected)
musiciansRouter.put('/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const musicianId = req.params.id;
  const existing = db.prepare('SELECT * FROM musicians WHERE id = ?').get(musicianId) as any;

  if (!existing) {
    res.status(404).json({ error: 'Musicista non trovato.' });
    return;
  }

  // Security check: only profile owner can edit
  if (existing.user_id !== req.user!.id) {
    res.status(403).json({ error: 'Non hai i permessi per modificare questo profilo.' });
    return;
  }

  const {
    name,
    age,
    gender,
    city,
    region,
    avatar,
    bio,
    availability,
    experienceYears,
    phoneOrContact,
    instruments,
    genres,
    socialLinks
  } = req.body;

  db.prepare(`
    UPDATE musicians SET
      name = COALESCE(?, name),
      age = COALESCE(?, age),
      gender = COALESCE(?, gender),
      city = COALESCE(?, city),
      region = COALESCE(?, region),
      avatar = COALESCE(?, avatar),
      bio = COALESCE(?, bio),
      availability = COALESCE(?, availability),
      experience_years = COALESCE(?, experience_years),
      phone_or_contact = COALESCE(?, phone_or_contact),
      instruments_json = COALESCE(?, instruments_json),
      genres_json = COALESCE(?, genres_json),
      social_links_json = COALESCE(?, social_links_json)
    WHERE id = ?
  `).run(
    name ? name.trim() : null,
    age ? parseInt(age) : null,
    gender || null,
    city || null,
    region || null,
    avatar || null,
    bio !== undefined ? bio : null,
    availability || null,
    experienceYears ? parseInt(experienceYears) : null,
    phoneOrContact !== undefined ? phoneOrContact : null,
    instruments ? JSON.stringify(instruments) : null,
    genres ? JSON.stringify(genres) : null,
    socialLinks ? JSON.stringify(socialLinks) : null,
    musicianId
  );

  const updatedRow = db.prepare('SELECT * FROM musicians WHERE id = ?').get(musicianId);
  res.json({ musician: formatMusicianRow(updatedRow) });
});

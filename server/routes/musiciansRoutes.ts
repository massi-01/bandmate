import { Router } from 'express';
import { Musician } from '../models/Musician.ts';
import { requireAuth, type AuthenticatedRequest } from '../auth.ts';

export const musiciansRouter = Router();

// GET all musicians with optional query filters
musiciansRouter.get('/', async (req, res) => {
  try {
    const { search, instrument, city, genre } = req.query;

    let musicians = await Musician.find().sort({ createdAt: -1 });

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      musicians = musicians.filter(m => 
        m.name.toLowerCase().includes(q) ||
        (m.bio && m.bio.toLowerCase().includes(q)) ||
        m.instruments.some((i: any) => i.name.toLowerCase().includes(q))
      );
    }

    if (instrument && typeof instrument === 'string' && instrument !== 'all') {
      const target = instrument.toLowerCase();
      musicians = musicians.filter(m => 
        m.instruments.some((i: any) => i.name.toLowerCase() === target)
      );
    }

    if (city && typeof city === 'string' && city !== 'all') {
      const target = city.toLowerCase();
      musicians = musicians.filter(m => m.city.toLowerCase().includes(target));
    }

    if (genre && typeof genre === 'string' && genre !== 'all') {
      const target = genre.toLowerCase();
      musicians = musicians.filter(m => 
        m.genres.some((g: string) => g.toLowerCase() === target)
      );
    }

    res.json({ musicians });
  } catch (err: any) {
    console.error('Error fetching musicians:', err);
    res.status(500).json({ error: 'Errore durante il recupero dei musicisti: ' + err.message });
  }
});

// GET single musician by ID
musiciansRouter.get('/:id', async (req, res) => {
  try {
    const musician = await Musician.findById(req.params.id);
    if (!musician) {
      res.status(404).json({ error: 'Musicista non trovato.' });
      return;
    }
    res.json({ musician });
  } catch (err: any) {
    res.status(500).json({ error: 'Errore durante il recupero del musicista: ' + err.message });
  }
});

// PUT update musician profile (Protected)
musiciansRouter.put('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const musicianId = req.params.id;
    const existing = await Musician.findById(musicianId);

    if (!existing) {
      res.status(404).json({ error: 'Musicista non trovato.' });
      return;
    }

    // Security check: only profile owner can edit
    if (existing.userId !== req.user!.id) {
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

    if (name) existing.name = name.trim();
    if (age) existing.age = parseInt(age);
    if (gender) existing.gender = gender;
    if (city) existing.city = city.trim();
    if (region !== undefined) existing.region = region;
    if (avatar) existing.avatar = avatar;
    if (bio !== undefined) existing.bio = bio;
    if (availability) existing.availability = availability;
    if (experienceYears) existing.experienceYears = parseInt(experienceYears);
    if (phoneOrContact !== undefined) existing.phoneOrContact = phoneOrContact;
    if (instruments) existing.instruments = instruments;
    if (genres) existing.genres = genres;
    if (socialLinks) existing.socialLinks = socialLinks;

    await existing.save();

    res.json({ musician: existing });
  } catch (err: any) {
    console.error('Error updating musician:', err);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento del profilo: ' + err.message });
  }
});

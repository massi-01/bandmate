import { Router } from 'express';
import { Band } from '../models/Band.ts';
import { Musician } from '../models/Musician.ts';
import { requireAuth, type AuthenticatedRequest } from '../auth.ts';

export const bandsRouter = Router();

// GET all bands (with optional search, city, genre, lookingFor filters)
bandsRouter.get('/', async (req, res) => {
  try {
    const { search, city, genre, lookingForOnly } = req.query;

    let bands = await Band.find().sort({ createdAt: -1 });

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      bands = bands.filter(b => 
        b.name.toLowerCase().includes(q) ||
        b.bio.toLowerCase().includes(q) ||
        b.genres.some(g => g.toLowerCase().includes(q)) ||
        b.members.some(m => m.musicianName.toLowerCase().includes(q) || m.role.toLowerCase().includes(q))
      );
    }

    if (city && typeof city === 'string' && city !== 'all') {
      const target = city.toLowerCase();
      bands = bands.filter(b => b.city.toLowerCase().includes(target));
    }

    if (genre && typeof genre === 'string' && genre !== 'all') {
      bands = bands.filter(b => b.genres.some(g => g.toLowerCase() === genre.toLowerCase()));
    }

    if (lookingForOnly === 'true') {
      bands = bands.filter(b => b.lookingFor && b.lookingFor.length > 0);
    }

    res.json({ bands });
  } catch (err: any) {
    console.error('Error fetching bands:', err);
    res.status(500).json({ error: 'Errore durante il recupero delle band: ' + err.message });
  }
});

// GET single band by ID
bandsRouter.get('/:id', async (req, res) => {
  try {
    const band = await Band.findById(req.params.id);
    if (!band) {
      res.status(404).json({ error: 'Band non trovata' });
      return;
    }
    res.json({ band });
  } catch (err: any) {
    console.error('Error fetching band details:', err);
    res.status(500).json({ error: 'Errore nel recupero della band: ' + err.message });
  }
});

// POST create a new band (Protected)
bandsRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      name,
      bio,
      city,
      avatar,
      genres,
      leaderRole,
      lookingFor,
      socialLinks
    } = req.body;

    if (!name || !name.trim() || !city || !city.trim()) {
      res.status(400).json({ error: 'Nome della band e città sono campi obbligatori.' });
      return;
    }

    const currentMusician = req.musician;
    if (!currentMusician) {
      res.status(403).json({ error: 'Devi avere un profilo musicista attivo per creare una band.' });
      return;
    }

    const bandId = 'b_' + Date.now();
    const now = new Date().toISOString();

    const initialLeaderRole = (leaderRole && leaderRole.trim()) 
      || currentMusician.instruments[0]?.name 
      || 'Fondatore';

    // Leader is automatically the first member
    const initialMembers = [
      {
        musicianId: currentMusician.id,
        musicianName: currentMusician.name,
        musicianAvatar: currentMusician.avatar || '',
        role: initialLeaderRole,
        joinedAt: now
      }
    ];

    const newBand = await Band.create({
      _id: bandId,
      name: name.trim(),
      bio: bio ? bio.trim() : '',
      city: city.trim(),
      avatar: avatar && avatar.trim() 
        ? avatar.trim() 
        : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
      genres: Array.isArray(genres) ? genres : [],
      leaderId: currentMusician.id,
      members: initialMembers,
      lookingFor: Array.isArray(lookingFor) ? lookingFor.filter(Boolean) : [],
      socialLinks: socialLinks || {},
      createdAt: now
    });

    res.status(201).json({ band: newBand });
  } catch (err: any) {
    console.error('Error creating band:', err);
    res.status(500).json({ error: 'Errore durante la creazione della band: ' + err.message });
  }
});

// PUT update band info (Protected, only leader)
bandsRouter.put('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const band = await Band.findById(req.params.id);
    if (!band) {
      res.status(404).json({ error: 'Band non trovata' });
      return;
    }

    if (band.leaderId !== req.musician.id) {
      res.status(403).json({ error: 'Solo il leader della band può modificare queste informazioni.' });
      return;
    }

    const { name, bio, city, avatar, genres, lookingFor, socialLinks } = req.body;

    if (name) band.name = name.trim();
    if (bio !== undefined) band.bio = bio.trim();
    if (city) band.city = city.trim();
    if (avatar) band.avatar = avatar.trim();
    if (Array.isArray(genres)) band.genres = genres;
    if (Array.isArray(lookingFor)) band.lookingFor = lookingFor;
    if (socialLinks) band.socialLinks = socialLinks;

    await band.save();
    res.json({ band });
  } catch (err: any) {
    console.error('Error updating band:', err);
    res.status(500).json({ error: 'Errore durante la modifica della band: ' + err.message });
  }
});

// POST add member to band (Protected, only leader)
bandsRouter.post('/:id/members', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { musicianId, role } = req.body;

    if (!musicianId || !role || !role.trim()) {
      res.status(400).json({ error: 'Specifica il musicista da aggiungere e il suo ruolo nella band.' });
      return;
    }

    const band = await Band.findById(req.params.id);
    if (!band) {
      res.status(404).json({ error: 'Band non trovata' });
      return;
    }

    if (band.leaderId !== req.musician.id) {
      res.status(403).json({ error: 'Solo il leader della band può aggiungere nuovi membri.' });
      return;
    }

    // Check if musician is already a member
    if (band.members.some(m => m.musicianId === musicianId)) {
      res.status(400).json({ error: 'Questo musicista fa già parte della band.' });
      return;
    }

    // Fetch musician info
    const musicianToAdd = await Musician.findById(musicianId);
    if (!musicianToAdd) {
      res.status(404).json({ error: 'Profilo musicista non trovato.' });
      return;
    }

    const newMember = {
      musicianId: musicianToAdd.id,
      musicianName: musicianToAdd.name,
      musicianAvatar: musicianToAdd.avatar || '',
      role: role.trim(),
      joinedAt: new Date().toISOString()
    };

    band.members.push(newMember);

    // If band was looking for this role, we can clean up exact matches if desired
    await band.save();

    res.status(200).json({ band, addedMember: newMember });
  } catch (err: any) {
    console.error('Error adding band member:', err);
    res.status(500).json({ error: 'Errore nell\'aggiunta del membro: ' + err.message });
  }
});

// DELETE remove member from band (Protected: leader or the member themselves)
bandsRouter.delete('/:id/members/:memberId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const band = await Band.findById(req.params.id);
    if (!band) {
      res.status(404).json({ error: 'Band non trovata' });
      return;
    }

    const targetMusicianId = req.params.memberId;
    const currentMusicianId = req.musician.id;

    // Must be either leader or the member themselves
    const isLeader = band.leaderId === currentMusicianId;
    const isSelf = targetMusicianId === currentMusicianId;

    if (!isLeader && !isSelf) {
      res.status(403).json({ error: 'Non hai i permessi per rimuovere questo membro.' });
      return;
    }

    // If leader leaves and there are other members, assign leadership to the next member
    if (isLeader && isSelf && band.members.length > 1) {
      const remainingMembers = band.members.filter(m => m.musicianId !== targetMusicianId);
      band.leaderId = remainingMembers[0].musicianId;
    }

    band.members = band.members.filter(m => m.musicianId !== targetMusicianId);
    await band.save();

    res.json({ band, message: 'Membro rimosso con successo dalla band.' });
  } catch (err: any) {
    console.error('Error removing band member:', err);
    res.status(500).json({ error: 'Errore durante la rimozione del membro: ' + err.message });
  }
});

// DELETE band (Protected, only leader)
bandsRouter.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const band = await Band.findById(req.params.id);
    if (!band) {
      res.status(404).json({ error: 'Band non trovata' });
      return;
    }

    if (band.leaderId !== req.musician.id) {
      res.status(403).json({ error: 'Solo il leader fondatore può eliminare la band.' });
      return;
    }

    await Band.findByIdAndDelete(req.params.id);
    res.json({ message: 'Band eliminata con successo.' });
  } catch (err: any) {
    console.error('Error deleting band:', err);
    res.status(500).json({ error: 'Errore durante l\'eliminazione della band: ' + err.message });
  }
});

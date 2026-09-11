import { Router } from 'express';
import { Event } from '../models/Event.ts';
import { Band } from '../models/Band.ts';
import { Musician } from '../models/Musician.ts';
import { requireAuth, type AuthenticatedRequest } from '../auth.ts';

export const eventsRouter = Router();

// GET all events
eventsRouter.get('/', async (req, res) => {
  try {
    const { city, type } = req.query;

    let events = await Event.find().sort({ date: 1, time: 1 });

    if (city && typeof city === 'string' && city !== 'all') {
      const target = city.toLowerCase();
      events = events.filter(e => e.city.toLowerCase().includes(target));
    }

    if (type && typeof type === 'string' && type !== 'all') {
      events = events.filter(e => e.type === type);
    }

    res.json({ events });
  } catch (err: any) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Errore durante il recupero degli eventi: ' + err.message });
  }
});

// POST create a new event (Protected)
eventsRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      title,
      description,
      type,
      date,
      time,
      locationName,
      address,
      city,
      genres,
      slots,
      setlist,
      equipmentNotes
    } = req.body;

    if (!title || !date || !time || !locationName || !city) {
      res.status(400).json({ error: 'Compila tutti i campi obbligatori dell\'evento.' });
      return;
    }

    if (!slots || !Array.isArray(slots) || slots.length === 0) {
      res.status(400).json({ error: 'Specifica almeno uno strumento ricercato per la jam.' });
      return;
    }

    const eventId = 'e_' + Date.now();
    const now = new Date().toISOString();

    const formattedSlots = slots.map((s: any, idx: number) => ({
      id: `slot_${Date.now()}_${idx}`,
      instrument: s.instrument,
      maxCount: parseInt(s.maxCount) || 1,
      assignedMusicians: []
    }));

    const formattedSetlist = Array.isArray(setlist)
      ? setlist
          .filter((s: any) => s && s.title && s.title.trim())
          .map((s: any, idx: number) => ({
            id: `song_${Date.now()}_${idx}`,
            title: s.title.trim(),
            artist: s.artist ? s.artist.trim() : 'Brano',
            bpm: s.bpm || '',
            key: s.key || '',
            tutorialUrl: s.tutorialUrl || '',
            notes: s.notes || ''
          }))
      : [];

    const newEvent = await Event.create({
      _id: eventId,
      organizerId: req.musician.id,
      title: title.trim(),
      description: description || '',
      type: type || 'Jam Session',
      date,
      time,
      locationName: locationName.trim(),
      address: address || '',
      city: city.trim(),
      genres: genres || ['Rock'],
      slots: formattedSlots,
      appliedBands: [],
      setlist: formattedSetlist,
      comments: [],
      equipmentNotes: equipmentNotes || '',
      createdAt: now
    });

    res.status(201).json({ event: newEvent });
  } catch (err: any) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: 'Errore durante la creazione dell\'evento: ' + err.message });
  }
});

// POST join a specific instrument slot in an event (Protected)
eventsRouter.post('/:id/join', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = req.params.id;
    const { slotId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ error: 'Evento non trovato.' });
      return;
    }

    const currentMusicianId = req.musician.id;

    // Check if user is already registered in any slot for this event
    const alreadyInEvent = event.slots.some((s: any) =>
      s.assignedMusicians.some((m: any) => m.musicianId === currentMusicianId)
    );

    if (alreadyInEvent) {
      res.status(400).json({ error: 'Sei già registrato a questa jam in uno slot.' });
      return;
    }

    let slotFound = false;
    for (const slot of event.slots) {
      if (slot.id === slotId) {
        slotFound = true;
        if (slot.assignedMusicians.length < slot.maxCount) {
          slot.assignedMusicians.push({
            musicianId: currentMusicianId,
            musicianName: req.musician.name,
            musicianAvatar: req.musician.avatar || '',
            joinedAt: new Date().toISOString().split('T')[0]
          });
        }
        break;
      }
    }

    if (!slotFound) {
      res.status(404).json({ error: 'Slot strumento non trovato.' });
      return;
    }

    await event.save();
    res.json({ event });
  } catch (err: any) {
    console.error('Error joining event slot:', err);
    res.status(500).json({ error: 'Errore durante l\'iscrizione allo slot: ' + err.message });
  }
});

// POST leave an instrument slot (Protected)
eventsRouter.post('/:id/leave', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = req.params.id;
    const { slotId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ error: 'Evento non trovato.' });
      return;
    }

    const currentMusicianId = req.musician.id;

    for (const slot of event.slots) {
      if (slot.id === slotId) {
        slot.assignedMusicians = slot.assignedMusicians.filter(
          (m: any) => m.musicianId !== currentMusicianId
        );
      }
    }

    await event.save();
    res.json({ event });
  } catch (err: any) {
    console.error('Error leaving event slot:', err);
    res.status(500).json({ error: 'Errore durante la disiscrizione dallo slot: ' + err.message });
  }
});

// POST apply band to an event (Protected)
eventsRouter.post('/:id/apply-band', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = req.params.id;
    const { bandId, message } = req.body;

    if (!bandId) {
      res.status(400).json({ error: 'Specifica la band da candidare.' });
      return;
    }

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ error: 'Evento non trovato.' });
      return;
    }

    const band = await Band.findById(bandId);
    if (!band) {
      res.status(404).json({ error: 'Band non trovata.' });
      return;
    }

    // Check if user is leader or member of this band
    const isMemberOrLeader =
      band.leaderId === req.musician.id ||
      band.members.some((m: any) => m.musicianId === req.musician.id);

    if (!isMemberOrLeader) {
      res.status(403).json({ error: 'Devi essere leader o membro di questa band per candidarla.' });
      return;
    }

    if (!event.appliedBands) {
      event.appliedBands = [];
    }

    const alreadyApplied = event.appliedBands.some((b: any) => b.bandId === bandId);
    if (alreadyApplied) {
      res.status(400).json({ error: 'Questa band è già candidata all\'evento.' });
      return;
    }

    const newApplication = {
      id: 'ab_' + Date.now(),
      bandId: band.id,
      bandName: band.name,
      bandAvatar: band.avatar || '',
      city: band.city || '',
      genres: band.genres || [],
      leaderId: band.leaderId,
      membersCount: band.members.length,
      message: message ? message.trim() : '',
      appliedAt: new Date().toISOString().split('T')[0]
    };

    event.appliedBands.push(newApplication);
    await event.save();

    res.json({ event });
  } catch (err: any) {
    console.error('Error applying band to event:', err);
    res.status(500).json({ error: 'Errore durante la candidatura della band: ' + err.message });
  }
});

// POST withdraw band from an event (Protected)
eventsRouter.post('/:id/withdraw-band', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = req.params.id;
    const { bandId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ error: 'Evento non trovato.' });
      return;
    }

    const band = await Band.findById(bandId);
    if (band) {
      const isAuthorized =
        band.leaderId === req.musician.id ||
        band.members.some((m: any) => m.musicianId === req.musician.id) ||
        event.organizerId === req.musician.id;

      if (!isAuthorized) {
        res.status(403).json({ error: 'Non hai i permessi per ritirare questa candidatura.' });
        return;
      }
    }

    if (event.appliedBands) {
      event.appliedBands = event.appliedBands.filter((b: any) => b.bandId !== bandId);
      await event.save();
    }

    res.json({ event });
  } catch (err: any) {
    console.error('Error withdrawing band from event:', err);
    res.status(500).json({ error: 'Errore durante il ritiro della candidatura: ' + err.message });
  }
});

// POST comment on an event (Protected)
eventsRouter.post('/:id/comments', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = req.params.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ error: 'Il testo della domanda o commento non può essere vuoto.' });
      return;
    }

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ error: 'Evento non trovato.' });
      return;
    }

    const musician = await Musician.findById(req.musician.id);
    const primaryInst = musician?.instruments.find((i: any) => i.isPrimary) || musician?.instruments[0];

    if (!event.comments) {
      event.comments = [];
    }

    const newComment = {
      id: 'ec_' + Date.now(),
      authorId: req.musician.id,
      authorName: req.musician.name,
      authorAvatar: req.musician.avatar || '',
      authorInstrument: primaryInst ? primaryInst.name : 'Musicista',
      content: content.trim(),
      createdAt: new Date().toISOString()
    };

    event.comments.push(newComment);
    await event.save();

    res.status(201).json({ event });
  } catch (err: any) {
    console.error('Error adding comment to event:', err);
    res.status(500).json({ error: 'Errore durante l\'invio del commento: ' + err.message });
  }
});


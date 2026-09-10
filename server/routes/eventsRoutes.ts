import { Router } from 'express';
import { Event } from '../models/Event.ts';
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

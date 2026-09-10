import { Router } from 'express';
import { db, formatEventRow } from '../db.ts';
import { requireAuth, type AuthenticatedRequest } from '../auth.ts';

export const eventsRouter = Router();

// GET all events
eventsRouter.get('/', (req, res) => {
  const { city, type } = req.query;

  const rows = db.prepare('SELECT * FROM events ORDER BY date ASC, time ASC').all();
  let list = rows.map(formatEventRow);

  if (city && typeof city === 'string' && city !== 'all') {
    const target = city.toLowerCase();
    list = list.filter(e => e.city.toLowerCase().includes(target));
  }

  if (type && typeof type === 'string' && type !== 'all') {
    list = list.filter(e => e.type === type);
  }

  res.json({ events: list });
});

// POST create a new event (Protected)
eventsRouter.post('/', requireAuth, (req: AuthenticatedRequest, res) => {
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

  // Format slots with unique IDs and empty assignedMusicians
  const formattedSlots = slots.map((s: any, idx: number) => ({
    id: `slot_${Date.now()}_${idx}`,
    instrument: s.instrument,
    maxCount: parseInt(s.maxCount) || 1,
    assignedMusicians: []
  }));

  db.prepare(`
    INSERT INTO events (
      id, organizer_id, title, description, type, date, time,
      location_name, address, city, genres_json, slots_json, equipment_notes, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    eventId,
    req.musician.id,
    title.trim(),
    description || '',
    type || 'Jam Session',
    date,
    time,
    locationName.trim(),
    address || '',
    city,
    JSON.stringify(genres || ['Rock']),
    JSON.stringify(formattedSlots),
    equipmentNotes || '',
    now
  );

  const newRow = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
  res.status(201).json({ event: formatEventRow(newRow) });
});

// POST join a specific instrument slot in an event (Protected)
eventsRouter.post('/:id/join', requireAuth, (req: AuthenticatedRequest, res) => {
  const eventId = req.params.id;
  const { slotId } = req.body;

  const eventRow = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
  if (!eventRow) {
    res.status(404).json({ error: 'Evento non trovato.' });
    return;
  }

  const event = formatEventRow(eventRow);
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
  const updatedSlots = event.slots.map((s: any) => {
    if (s.id !== slotId) return s;
    slotFound = true;

    if (s.assignedMusicians.length >= s.maxCount) {
      return s;
    }

    return {
      ...s,
      assignedMusicians: [
        ...s.assignedMusicians,
        {
          musicianId: currentMusicianId,
          musicianName: req.musician.name,
          musicianAvatar: req.musician.avatar,
          joinedAt: new Date().toISOString().split('T')[0]
        }
      ]
    };
  });

  if (!slotFound) {
    res.status(404).json({ error: 'Slot strumento non trovato.' });
    return;
  }

  db.prepare('UPDATE events SET slots_json = ? WHERE id = ?').run(
    JSON.stringify(updatedSlots),
    eventId
  );

  const updatedRow = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
  res.json({ event: formatEventRow(updatedRow) });
});

// POST leave an instrument slot (Protected)
eventsRouter.post('/:id/leave', requireAuth, (req: AuthenticatedRequest, res) => {
  const eventId = req.params.id;
  const { slotId } = req.body;

  const eventRow = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
  if (!eventRow) {
    res.status(404).json({ error: 'Evento non trovato.' });
    return;
  }

  const event = formatEventRow(eventRow);
  const currentMusicianId = req.musician.id;

  const updatedSlots = event.slots.map((s: any) => {
    if (s.id !== slotId) return s;
    return {
      ...s,
      assignedMusicians: s.assignedMusicians.filter(
        (m: any) => m.musicianId !== currentMusicianId
      )
    };
  });

  db.prepare('UPDATE events SET slots_json = ? WHERE id = ?').run(
    JSON.stringify(updatedSlots),
    eventId
  );

  const updatedRow = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
  res.json({ event: formatEventRow(updatedRow) });
});

import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { hashPassword } from './auth.ts';

// Ensure data folder exists (use /tmp on Vercel/serverless environments)
const isVercel = process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const dataDir = isVercel ? '/tmp' : path.resolve(process.cwd(), 'data');

if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
}

const dbPath = path.join(dataDir, 'bandmate.db');
let databaseInstance: DatabaseSync;
try {
  databaseInstance = new DatabaseSync(dbPath);
} catch (err) {
  console.warn('Falling back to in-memory SQLite database:', err);
  databaseInstance = new DatabaseSync(':memory:');
}

export const db = databaseInstance;

// Initialize Tables
export function initDatabase() {
  // Foreign keys
  db.exec('PRAGMA foreign_keys = ON;');

  // Users
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Sessions
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Musicians Profiles
  db.exec(`
    CREATE TABLE IF NOT EXISTS musicians (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      city TEXT NOT NULL,
      region TEXT,
      avatar TEXT,
      bio TEXT,
      availability TEXT NOT NULL,
      experience_years INTEGER NOT NULL,
      phone_or_contact TEXT,
      instruments_json TEXT NOT NULL,
      genres_json TEXT NOT NULL,
      social_links_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Events & Jam Sessions
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      organizer_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      location_name TEXT NOT NULL,
      address TEXT,
      city TEXT NOT NULL,
      genres_json TEXT NOT NULL,
      slots_json TEXT NOT NULL,
      equipment_notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (organizer_id) REFERENCES musicians(id) ON DELETE CASCADE
    );
  `);

  // Bulletin Board Posts
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      city TEXT NOT NULL,
      target_instruments_json TEXT NOT NULL,
      genres_json TEXT NOT NULL,
      likes_json TEXT NOT NULL,
      comments_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (author_id) REFERENCES musicians(id) ON DELETE CASCADE
    );
  `);

  // Check if seeding is needed
  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users;').get() as any).count;
  if (userCount === 0) {
    seedInitialData();
  }
}

function seedInitialData() {
  console.log('🌱 Seeding initial BandMate database with demo musicians and events...');

  const defaultPassword = 'password123';
  const { hash, salt } = hashPassword(defaultPassword);

  const demoMusicians = [
    {
      id: 'm1',
      email: 'davide@bandmate.it',
      name: 'Davide De Luca',
      username: 'davidedeluca',
      age: 26,
      gender: 'Uomo',
      city: 'Milano (MI)',
      region: 'Lombardia',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: 'Chitarrista e polistrumentista. Suono da oltre 10 anni tra rock alternativo, indie e blues. Amo le jam improvvisate e cerco sempre gente motivata per progetti seri o birre e sala prove!',
      instruments: [
        { name: 'Chitarra Elettrica', level: 'Avanzato', isPrimary: true },
        { name: 'Chitarra Acustica', level: 'Avanzato' },
        { name: 'Voce', level: 'Intermedio' }
      ],
      genres: ['Indie Rock', 'Blues', 'Alternative', 'Post-Punk'],
      availability: 'Disponibile per Jam',
      experienceYears: 10,
      phoneOrContact: 'davide.deluca@musicmail.it',
      socialLinks: {
        instagram: '@davide_guitar_lab',
        spotify: 'Davide DL Solo'
      }
    },
    {
      id: 'm2',
      email: 'giulia@bandmate.it',
      name: 'Giulia Moretti',
      username: 'giuliabass',
      age: 24,
      gender: 'Donna',
      city: 'Bologna (BO)',
      region: 'Emilia-Romagna',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      bio: 'Bassista con un debole per i bassline funk e neo-soul. Precisione sul tempo e tanto groove. Ho strumentazione professionale e auto propria per spostamenti.',
      instruments: [
        { name: 'Basso Elettrico', level: 'Professionista', isPrimary: true },
        { name: 'Contrabbasso', level: 'Intermedio' }
      ],
      genres: ['Funk', 'Neo-Soul', 'Jazz Fusion', 'R&B'],
      availability: 'Cerco Band fissa',
      experienceYears: 8,
      phoneOrContact: 'giulia.bassgroove@gmail.com',
      socialLinks: {
        instagram: '@giuliabass_groove'
      }
    },
    {
      id: 'm3',
      email: 'marco@bandmate.it',
      name: 'Marco Bianchi',
      username: 'marcodrums',
      age: 29,
      gender: 'Uomo',
      city: 'Milano (MI)',
      region: 'Lombardia',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      bio: 'Batterista energico e con esperienza live su palchi di festival e club. Cerco progetti rock/hard rock o sessioni studio. Batteria acustica Yamaha e trigger se necessari.',
      instruments: [
        { name: 'Batteria', level: 'Professionista', isPrimary: true },
        { name: 'Percussioni', level: 'Avanzato' }
      ],
      genres: ['Hard Rock', 'Classic Rock', 'Grunge', 'Progressive'],
      availability: 'Disponibile per serate/live',
      experienceYears: 14,
      phoneOrContact: 'marco.bianchi.drums@gmail.com',
      socialLinks: {
        instagram: '@marcobianchi_drums'
      }
    },
    {
      id: 'm4',
      email: 'chiara@bandmate.it',
      name: 'Chiara Romano',
      username: 'chiaravoice',
      age: 23,
      gender: 'Donna',
      city: 'Roma (RM)',
      region: 'Lazio',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      bio: 'Cantante e cantautrice soul/pop. Studio canto al conservatorio. Mi piace comporre melodie ed armonizzare. Cerco musicisti per completare un repertorio inedito e cover acustiche.',
      instruments: [
        { name: 'Voce', level: 'Professionista', isPrimary: true },
        { name: 'Tastiere/Pianoforte', level: 'Intermedio' }
      ],
      genres: ['Soul', 'Pop', 'Acoustic', 'Jazz'],
      availability: 'Cerco Band fissa',
      experienceYears: 7,
      phoneOrContact: 'chiara.romano.singer@outlook.com',
      socialLinks: {
        instagram: '@chiara_romano_vocal'
      }
    },
    {
      id: 'm5',
      email: 'samuele@bandmate.it',
      name: 'Samuele Ferraro',
      username: 'samukeys',
      age: 28,
      gender: 'Uomo',
      city: 'Torino (TO)',
      region: 'Piemonte',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      bio: 'Pianista jazz e tastierista synth-wave / fusion. Uso Nord Stage e synth analogici. Sempre pronto per scambiare due accordi di nona e sperimentare sonorità ambientali.',
      instruments: [
        { name: 'Tastiere/Pianoforte', level: 'Avanzato', isPrimary: true },
        { name: 'Sintetizzatori', level: 'Avanzato' }
      ],
      genres: ['Jazz', 'Synthwave', 'Funk', 'Elettronica'],
      availability: 'Disponibile per Jam',
      experienceYears: 12,
      phoneOrContact: 'samuele.keys@live.it',
      socialLinks: {
        instagram: '@samu_keys_station'
      }
    }
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, salt, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertMusician = db.prepare(`
    INSERT INTO musicians (
      id, user_id, name, username, age, gender, city, region,
      avatar, bio, availability, experience_years, phone_or_contact,
      instruments_json, genres_json, social_links_json, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();

  for (const m of demoMusicians) {
    const userId = 'u_' + m.id;
    insertUser.run(userId, m.email, hash, salt, now);
    insertMusician.run(
      m.id,
      userId,
      m.name,
      m.username,
      m.age,
      m.gender,
      m.city,
      m.region,
      m.avatar,
      m.bio,
      m.availability,
      m.experienceYears,
      m.phoneOrContact,
      JSON.stringify(m.instruments),
      JSON.stringify(m.genres),
      JSON.stringify(m.socialLinks),
      now
    );
  }

  // Seed Events
  const insertEvent = db.prepare(`
    INSERT INTO events (
      id, organizer_id, title, description, type, date, time,
      location_name, address, city, genres_json, slots_json, equipment_notes, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const demoEvents = [
    {
      id: 'e1',
      organizer_id: 'm3',
      title: 'Milano Funk & Soul Open Jam Session',
      description: 'Serata jam a ruota libera basata su standard funk, soul e groove anni 70. Suoniamo su turni di 3-4 brani concordati sul momento. Amplificatori chitarra/basso e batteria completa già in sala!',
      type: 'Jam Session',
      date: '2026-09-22',
      time: '21:00',
      location_name: 'SoundLab Rehearsal Studios - Sala A',
      address: 'Via Tortona 32',
      city: 'Milano (MI)',
      genres: ['Funk', 'Soul', 'Groove', 'R&B'],
      slots: [
        {
          id: 's1',
          instrument: 'Batteria',
          maxCount: 1,
          assignedMusicians: [
            {
              musicianId: 'm3',
              musicianName: 'Marco Bianchi',
              musicianAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
              joinedAt: '2026-09-10'
            }
          ]
        },
        { id: 's2', instrument: 'Basso Elettrico', maxCount: 1, assignedMusicians: [] },
        {
          id: 's3',
          instrument: 'Chitarra Elettrica',
          maxCount: 2,
          assignedMusicians: [
            {
              musicianId: 'm1',
              musicianName: 'Davide De Luca',
              musicianAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
              joinedAt: '2026-09-10'
            }
          ]
        },
        { id: 's4', instrument: 'Tastiere/Pianoforte', maxCount: 1, assignedMusicians: [] },
        { id: 's5', instrument: 'Voce', maxCount: 1, assignedMusicians: [] }
      ],
      equipment_notes: 'Batteria Yamaha, ampli Fender Twin Reverb e Markbass presenti sul posto. Portare solo jack e bacchette.'
    },
    {
      id: 'e2',
      organizer_id: 'm4',
      title: 'Rock 70s & 90s Jam & Prove Aperte',
      description: 'Ci vediamo per suonare grandi classici (Led Zeppelin, Pink Floyd, Nirvana, Foo Fighters, Pearl Jam). L’obiettivo è divertirsi insieme ed eventualmente formare un gruppo per serate live invernali.',
      type: 'Prove di Gruppo',
      date: '2026-09-25',
      time: '20:30',
      location_name: 'Circolo Rock Garage Roma',
      address: 'Via Casilina 114',
      city: 'Roma (RM)',
      genres: ['Hard Rock', 'Grunge', 'Classic Rock'],
      slots: [
        {
          id: 's7',
          instrument: 'Voce',
          maxCount: 1,
          assignedMusicians: [
            {
              musicianId: 'm4',
              musicianName: 'Chiara Romano',
              musicianAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
              joinedAt: '2026-09-09'
            }
          ]
        },
        { id: 's8', instrument: 'Chitarra Elettrica', maxCount: 2, assignedMusicians: [] },
        { id: 's9', instrument: 'Basso Elettrico', maxCount: 1, assignedMusicians: [] },
        { id: 's10', instrument: 'Batteria', maxCount: 1, assignedMusicians: [] }
      ],
      equipment_notes: 'Impianto voce e microfoni Shure SM58 inclusi. Sala climatizzata.'
    }
  ];

  for (const ev of demoEvents) {
    insertEvent.run(
      ev.id,
      ev.organizer_id,
      ev.title,
      ev.description,
      ev.type,
      ev.date,
      ev.time,
      ev.location_name,
      ev.address,
      ev.city,
      JSON.stringify(ev.genres),
      JSON.stringify(ev.slots),
      ev.equipment_notes,
      now
    );
  }

  // Seed Posts
  const insertPost = db.prepare(`
    INSERT INTO posts (
      id, author_id, category, title, content, city,
      target_instruments_json, genres_json, likes_json, comments_json, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const demoPosts = [
    {
      id: 'p1',
      author_id: 'm2',
      category: 'cercasi-band',
      title: 'Bassista funk/soul cerca gruppo a Bologna per serate live',
      content: 'Ciao a tutti! Suono il basso elettrico da 8 anni con esperienza sia in studio che sul palco. Cerco un progetto avviato o musicisti con cui fondare una band stile Vulfpeck, Bruno Mars, Stevie Wonder o sonorità Neo-Soul. Massima serietà e sala prove settimanale!',
      city: 'Bologna (BO)',
      target_instruments: ['Batteria', 'Chitarra Elettrica', 'Tastiere/Pianoforte', 'Voce'],
      genres: ['Funk', 'Soul', 'R&B'],
      likes: ['m1', 'm3', 'm5'],
      comments: [
        {
          id: 'c1',
          authorId: 'm5',
          authorName: 'Samuele Ferraro',
          authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
          authorInstrument: 'Tastiere/Pianoforte',
          content: 'Ciao Giulia! Io sono a Torino ma vengo spesso a Bologna per lavoro. Adoro Vulfpeck! Se organizzi una jam fammi sapere!',
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      id: 'p2',
      author_id: 'm3',
      category: 'cercasi-musicista',
      title: 'Cercasi chitarrista solista e cantante rock a Milano',
      content: 'Band già formata da batterista e bassista con sala prove fissa zona Lambrate cerca cantante rock carismatico e chitarrista solista. Repertorio rock alternativo anni 90/2000 (Soundgarden, Foo Fighters, Muse, Queens of the Stone Age) più qualche pezzo inedito.',
      city: 'Milano (MI)',
      target_instruments: ['Chitarra Elettrica', 'Voce'],
      genres: ['Alternative Rock', 'Hard Rock', 'Grunge'],
      likes: ['m1'],
      comments: [
        {
          id: 'c2',
          authorId: 'm1',
          authorName: 'Davide De Luca',
          authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          authorInstrument: 'Chitarra Elettrica',
          content: 'Ciao Marco! Mi candido volentieri come chitarra solista. Conosco benissimo il repertorio dei Muse e QOTSA!',
          createdAt: new Date().toISOString()
        }
      ]
    }
  ];

  for (const p of demoPosts) {
    insertPost.run(
      p.id,
      p.author_id,
      p.category,
      p.title,
      p.content,
      p.city,
      JSON.stringify(p.target_instruments),
      JSON.stringify(p.genres),
      JSON.stringify(p.likes),
      JSON.stringify(p.comments),
      now
    );
  }

  console.log('✅ BandMate database initialized and seeded successfully.');
}

// Helpers to format rows to domain objects
export function formatMusicianRow(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    username: row.username,
    age: row.age,
    gender: row.gender,
    city: row.city,
    region: row.region,
    avatar: row.avatar,
    bio: row.bio,
    availability: row.availability,
    experienceYears: row.experience_years,
    phoneOrContact: row.phone_or_contact,
    instruments: JSON.parse(row.instruments_json || '[]'),
    genres: JSON.parse(row.genres_json || '[]'),
    socialLinks: JSON.parse(row.social_links_json || '{}'),
    createdAt: row.created_at
  };
}

export function formatEventRow(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    organizerId: row.organizer_id,
    title: row.title,
    description: row.description,
    type: row.type,
    date: row.date,
    time: row.time,
    locationName: row.location_name,
    address: row.address,
    city: row.city,
    genres: JSON.parse(row.genres_json || '[]'),
    slots: JSON.parse(row.slots_json || '[]'),
    equipmentNotes: row.equipment_notes,
    createdAt: row.created_at
  };
}

export function formatPostRow(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    authorId: row.author_id,
    category: row.category,
    title: row.title,
    content: row.content,
    city: row.city,
    targetInstruments: JSON.parse(row.target_instruments_json || '[]'),
    genres: JSON.parse(row.genres_json || '[]'),
    likes: JSON.parse(row.likes_json || '[]'),
    comments: JSON.parse(row.comments_json || '[]'),
    createdAt: row.created_at
  };
}

// Call init on module load
initDatabase();

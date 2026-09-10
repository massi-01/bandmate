import fs from 'node:fs';
import path from 'node:path';
import { hashPassword } from './auth.ts';

// In-Memory Database Fallback for serverless runtimes without native node:sqlite
class InMemoryDatabase {
  users = new Map<string, any>();
  sessions = new Map<string, any>();
  musicians = new Map<string, any>();
  events = new Map<string, any>();
  posts = new Map<string, any>();

  exec(_sql: string) {
    // Schema creation no-op
  }

  prepare(sql: string) {
    const clean = sql.trim().replace(/\s+/g, ' ');

    if (clean.includes('COUNT(*) as count FROM users')) {
      return { get: () => ({ count: this.users.size }) };
    }

    if (clean.startsWith('INSERT INTO users')) {
      return {
        run: (id: string, email: string, password_hash: string, salt: string, created_at: string) => {
          this.users.set(id, { id, email, password_hash, salt, created_at });
        }
      };
    }

    if (clean.startsWith('SELECT id FROM users WHERE email = ?')) {
      return {
        get: (email: string) => {
          const u = Array.from(this.users.values()).find(x => x.email.toLowerCase() === email.toLowerCase());
          return u ? { id: u.id } : undefined;
        }
      };
    }

    if (clean.startsWith('SELECT * FROM users WHERE email = ?')) {
      return {
        get: (email: string) => {
          return Array.from(this.users.values()).find(x => x.email.toLowerCase() === email.toLowerCase());
        }
      };
    }

    if (clean.startsWith('INSERT INTO sessions')) {
      return {
        run: (token: string, user_id: string, created_at: string) => {
          this.sessions.set(token, { token, user_id, created_at });
        }
      };
    }

    if (clean.includes('FROM sessions s') && clean.includes('WHERE s.token = ?')) {
      return {
        get: (token: string) => {
          const sess = this.sessions.get(token);
          if (!sess) return undefined;
          const user = this.users.get(sess.user_id);
          if (!user) return undefined;
          const musician = Array.from(this.musicians.values()).find(m => m.user_id === user.id);
          return {
            token: sess.token,
            user_id: user.id,
            email: user.email,
            musician_id: musician ? musician.id : null,
            musician_name: musician ? musician.name : null,
            musician_avatar: musician ? musician.avatar : null
          };
        }
      };
    }

    if (clean.startsWith('DELETE FROM sessions WHERE token = ?')) {
      return {
        run: (token: string) => {
          this.sessions.delete(token);
        }
      };
    }

    if (clean.startsWith('INSERT INTO musicians')) {
      return {
        run: (...params: any[]) => {
          this.musicians.set(params[0], {
            id: params[0],
            user_id: params[1],
            name: params[2],
            username: params[3],
            age: params[4],
            gender: params[5],
            city: params[6],
            region: params[7],
            avatar: params[8],
            bio: params[9],
            availability: params[10],
            experience_years: params[11],
            phone_or_contact: params[12],
            instruments_json: params[13],
            genres_json: params[14],
            social_links_json: params[15],
            created_at: params[16]
          });
        }
      };
    }

    if (clean.startsWith('SELECT * FROM musicians ORDER BY created_at DESC')) {
      return {
        all: () => Array.from(this.musicians.values()).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
      };
    }

    if (clean.startsWith('SELECT * FROM musicians WHERE id = ?')) {
      return {
        get: (id: string) => this.musicians.get(id)
      };
    }

    if (clean.startsWith('SELECT * FROM musicians WHERE user_id = ?')) {
      return {
        get: (userId: string) => Array.from(this.musicians.values()).find(m => m.user_id === userId)
      };
    }

    if (clean.startsWith('SELECT instruments_json FROM musicians WHERE id = ?')) {
      return {
        get: (id: string) => {
          const m = this.musicians.get(id);
          return m ? { instruments_json: m.instruments_json } : undefined;
        }
      };
    }

    if (clean.startsWith('UPDATE musicians SET')) {
      return {
        run: (...params: any[]) => {
          const id = params[params.length - 1];
          const m = this.musicians.get(id);
          if (m) {
            m.name = params[0];
            m.age = params[1];
            m.gender = params[2];
            m.city = params[3];
            m.region = params[4];
            m.avatar = params[5];
            m.bio = params[6];
            m.availability = params[7];
            m.experience_years = params[8];
            m.phone_or_contact = params[9];
            m.instruments_json = params[10];
            m.genres_json = params[11];
            m.social_links_json = params[12];
          }
        }
      };
    }

    if (clean.startsWith('INSERT INTO events')) {
      return {
        run: (...params: any[]) => {
          this.events.set(params[0], {
            id: params[0],
            organizer_id: params[1],
            title: params[2],
            description: params[3],
            type: params[4],
            date: params[5],
            time: params[6],
            location_name: params[7],
            address: params[8],
            city: params[9],
            genres_json: params[10],
            slots_json: params[11],
            equipment_notes: params[12],
            created_at: params[13]
          });
        }
      };
    }

    if (clean.startsWith('SELECT * FROM events ORDER BY date ASC, time ASC')) {
      return {
        all: () => Array.from(this.events.values()).sort((a, b) => ((a.date || '') + (a.time || '')).localeCompare((b.date || '') + (b.time || '')))
      };
    }

    if (clean.startsWith('SELECT * FROM events WHERE id = ?')) {
      return {
        get: (id: string) => this.events.get(id)
      };
    }

    if (clean.startsWith('UPDATE events SET slots_json = ? WHERE id = ?')) {
      return {
        run: (slots_json: string, id: string) => {
          const ev = this.events.get(id);
          if (ev) ev.slots_json = slots_json;
        }
      };
    }

    if (clean.startsWith('INSERT INTO posts')) {
      return {
        run: (...params: any[]) => {
          this.posts.set(params[0], {
            id: params[0],
            author_id: params[1],
            category: params[2],
            title: params[3],
            content: params[4],
            city: params[5],
            target_instruments_json: params[6],
            genres_json: params[7],
            likes_json: params[8],
            comments_json: params[9],
            created_at: params[10]
          });
        }
      };
    }

    if (clean.startsWith('SELECT * FROM posts ORDER BY created_at DESC')) {
      return {
        all: () => Array.from(this.posts.values()).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
      };
    }

    if (clean.startsWith('SELECT * FROM posts WHERE id = ?')) {
      return {
        get: (id: string) => this.posts.get(id)
      };
    }

    if (clean.startsWith('UPDATE posts SET likes_json = ? WHERE id = ?')) {
      return {
        run: (likes_json: string, id: string) => {
          const p = this.posts.get(id);
          if (p) p.likes_json = likes_json;
        }
      };
    }

    if (clean.startsWith('UPDATE posts SET comments_json = ? WHERE id = ?')) {
      return {
        run: (comments_json: string, id: string) => {
          const p = this.posts.get(id);
          if (p) p.comments_json = comments_json;
        }
      };
    }

    console.warn('Unhandled SQL in InMemoryDatabase:', clean);
    return {
      run: () => {},
      get: () => undefined,
      all: () => []
    };
  }
}

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

let DatabaseSyncClass: any = null;
try {
  const sqliteModule = await import('node:sqlite');
  DatabaseSyncClass = sqliteModule.DatabaseSync;
} catch {
  // node:sqlite not supported on older runtimes
}

let databaseInstance: any = null;
if (DatabaseSyncClass) {
  try {
    databaseInstance = new DatabaseSyncClass(dbPath);
  } catch (err) {
    console.warn('Falling back to in-memory SQLite database:', err);
    try {
      databaseInstance = new DatabaseSyncClass(':memory:');
    } catch {
      databaseInstance = null;
    }
  }
}

if (!databaseInstance) {
  databaseInstance = new InMemoryDatabase();
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

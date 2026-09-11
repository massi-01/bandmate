import mongoose from 'mongoose';
import { User } from './models/User.ts';
import { Musician } from './models/Musician.ts';
import { Event } from './models/Event.ts';
import { Post } from './models/Post.ts';
import { Band } from './models/Band.ts';
import { hashPassword } from './auth.ts';

// MongoDB Atlas connection string (environment variable or Atlas URI)
const DEFAULT_MONGODB_URI = 'mongodb+srv://massigatta_db_user:UauV3ZVvGQu9ycMn@bandmate.gtkawg6.mongodb.net/bandmate?retryWrites=true&w=majority&appName=bandmate';
export const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    }).then((m) => {
      console.log('✅ Connected to MongoDB Atlas database (bandmate)');
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
    await seedInitialDataIfNeeded();
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

let hasCheckedSeed = false;
async function seedInitialDataIfNeeded() {
  if (hasCheckedSeed) return;
  hasCheckedSeed = true;

  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Seeding MongoDB with demo musicians, events, and posts...');
    const defaultPassword = 'password123';
    const { hash, salt } = hashPassword(defaultPassword);
    const now = new Date().toISOString();

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

    for (const m of demoMusicians) {
      const userId = 'u_' + m.id;
      await User.create({
        _id: userId,
        email: m.email,
        passwordHash: hash,
        salt,
        createdAt: now
      });

      await Musician.create({
        _id: m.id,
        userId,
        name: m.name,
        username: m.username,
        age: m.age,
        gender: m.gender,
        city: m.city,
        region: m.region,
        avatar: m.avatar,
        bio: m.bio,
        availability: m.availability,
        experienceYears: m.experienceYears,
        phoneOrContact: m.phoneOrContact,
        instruments: m.instruments,
        genres: m.genres,
        socialLinks: m.socialLinks,
        createdAt: now
      });
    }

    const demoEvents = [
      {
        _id: 'e1',
        organizerId: 'm3',
        title: 'Milano Funk & Soul Open Jam Session',
        description: 'Serata jam a ruota libera basata su standard funk, soul e groove anni 70. Suoniamo su turni di 3-4 brani concordati sul momento. Amplificatori chitarra/basso e batteria completa già in sala!',
        type: 'Jam Session',
        date: '2026-09-22',
        time: '21:00',
        locationName: 'SoundLab Rehearsal Studios - Sala A',
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
        equipmentNotes: 'Batteria Yamaha, ampli Fender Twin Reverb e Markbass presenti sul posto. Portare solo jack e bacchette.',
        appliedBands: [
          {
            id: 'ab1',
            bandId: 'b1',
            bandName: 'The Velvet Groove',
            bandAvatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
            city: 'Bologna (BO)',
            genres: ['Funk', 'Soul', 'Acid Jazz'],
            leaderId: 'm2',
            membersCount: 2,
            message: 'Ci candidiamo per aprire la jam con un set funky di 3 brani!',
            appliedAt: '2026-09-10'
          }
        ],
        setlist: [
          {
            id: 'song_1',
            title: 'Superstition',
            artist: 'Stevie Wonder',
            bpm: 100,
            key: 'Mib minore (Ebm)',
            tutorialUrl: 'https://www.youtube.com/watch?v=ftdZ363R9kQ',
            notes: 'Riff di clavinet suonato con chitarre/tastiere, stacco unisono sul ritornello.'
          },
          {
            id: 'song_2',
            title: 'Cissy Strut',
            artist: 'The Meters',
            bpm: 88,
            key: 'Do (C)',
            tutorialUrl: 'https://www.youtube.com/watch?v=4_iC0MyIykM',
            notes: 'Groove funky di basso e batteria super compatto, giri di assoli aperti per tutti.'
          },
          {
            id: 'song_3',
            title: 'Pick Up the Pieces',
            artist: 'Average White Band',
            bpm: 108,
            key: 'Fa minore (Fm)',
            tutorialUrl: 'https://www.youtube.com/watch?v=FnH_weyGucc',
            notes: 'Intro incalzante, assoli di chitarra funky e sax/synth.'
          }
        ],
        comments: [
          {
            id: 'ec1',
            authorId: 'm2',
            authorName: 'Giulia Moretti',
            authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
            authorInstrument: 'Basso Elettrico',
            content: 'Ciao Marco! Per il basso c\'è già un amplificatore Markbass o conviene portare la testata propria?',
            createdAt: '2026-09-10T14:30:00.000Z'
          },
          {
            id: 'ec2',
            authorId: 'm3',
            authorName: 'Marco Bianchi',
            authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
            authorInstrument: 'Batteria',
            content: 'Ciao Giulia! C\'è sia la cassa 4x10 che la testata Little Mark III sul posto, porta solo il basso e i cavi jack!',
            createdAt: '2026-09-10T14:45:00.000Z'
          }
        ],
        createdAt: now
      },
      {
        _id: 'e2',
        organizerId: 'm4',
        title: 'Rock 70s & 90s Jam & Prove Aperte',
        description: 'Ci vediamo per suonare grandi classici (Led Zeppelin, Pink Floyd, Nirvana, Foo Fighters, Pearl Jam). L’obiettivo è divertirsi insieme ed eventualmente formare un gruppo per serate live invernali.',
        type: 'Prove di Gruppo',
        date: '2026-09-25',
        time: '20:30',
        locationName: 'Circolo Rock Garage Roma',
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
        equipmentNotes: 'Impianto voce e microfoni Shure SM58 inclusi. Sala climatizzata.',
        appliedBands: [],
        setlist: [
          {
            id: 'song_4',
            title: 'Comfortably Numb',
            artist: 'Pink Floyd',
            bpm: 64,
            key: 'Si minore (Bm)',
            tutorialUrl: 'https://www.youtube.com/watch?v=_FrOQC-zEog',
            notes: 'Versione con entrambi gli assoli di chitarra estesi.'
          },
          {
            id: 'song_5',
            title: 'Everlong',
            artist: 'Foo Fighters',
            bpm: 158,
            key: 'Re Drop-D (D)',
            tutorialUrl: 'https://www.youtube.com/watch?v=eBG7P-K-r1Y',
            notes: 'Accordo Drop-D per la chitarra ritmica, batteria carica sul chorus.'
          }
        ],
        comments: [
          {
            id: 'ec3',
            authorId: 'm1',
            authorName: 'Davide De Luca',
            authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            authorInstrument: 'Chitarra Elettrica',
            content: 'Gran bella scaletta! A che ora conviene arrivare per accordare e fare il soundcheck rapido?',
            createdAt: '2026-09-10T16:00:00.000Z'
          }
        ],
        createdAt: now
      }
    ];

    for (const ev of demoEvents) {
      await Event.create(ev);
    }

    const demoPosts = [
      {
        _id: 'p1',
        authorId: 'm2',
        category: 'cercasi-band',
        title: 'Bassista funk/soul cerca gruppo a Bologna per serate live',
        content: 'Ciao a tutti! Suono il basso elettrico da 8 anni con esperienza sia in studio che sul palco. Cerco un progetto avviato o musicisti con cui fondare una band stile Vulfpeck, Bruno Mars, Stevie Wonder o sonorità Neo-Soul. Massima serietà e sala prove settimanale!',
        city: 'Bologna (BO)',
        targetInstruments: ['Batteria', 'Chitarra Elettrica', 'Tastiere/Pianoforte', 'Voce'],
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
            createdAt: now
          }
        ],
        createdAt: now
      },
      {
        _id: 'p2',
        authorId: 'm3',
        category: 'cercasi-musicista',
        title: 'Cercasi chitarrista solista e cantante rock a Milano',
        content: 'Band già formata da batterista e bassista con sala prove fissa zona Lambrate cerca cantante rock carismatico e chitarrista solista. Repertorio rock alternativo anni 90/2000 (Soundgarden, Foo Fighters, Muse, Queens of the Stone Age) più qualche pezzo inedito.',
        city: 'Milano (MI)',
        targetInstruments: ['Chitarra Elettrica', 'Voce'],
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
            createdAt: now
          }
        ],
        createdAt: now
      }
    ];

    for (const p of demoPosts) {
      await Post.create(p);
    }

    console.log('✅ MongoDB database seeded successfully!');
    }

    // Check and seed demo bands if none exist
    await seedDemoBandsIfNeeded();
  } catch (err) {
    console.error('Seed check error:', err);
  }
}

async function seedDemoBandsIfNeeded() {
  try {
    const bandCount = await Band.countDocuments();
    if (bandCount > 0) return;

    console.log('🌱 Seeding demo bands in MongoDB...');
    const now = new Date().toISOString();

    const demoBands = [
      {
        _id: 'b1',
        name: 'The Velvet Groove',
        bio: 'Progetto neo-soul e funk nato a Milano nel 2024. Suoniamo cover riarrangiate e pezzi inediti carichi di groove e buone vibrazioni. Prove settimanali e date live nei club.',
        city: 'Milano (MI)',
        avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
        genres: ['Funk', 'Soul', 'Indie Pop'],
        leaderId: 'm1',
        members: [
          {
            musicianId: 'm1',
            musicianName: 'Davide De Luca',
            musicianAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            role: 'Chitarra & Voce',
            joinedAt: now
          },
          {
            musicianId: 'm2',
            musicianName: 'Giulia Moretti',
            musicianAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
            role: 'Basso Elettrico',
            joinedAt: now
          },
          {
            musicianId: 'm3',
            musicianName: 'Marco Bellini',
            musicianAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
            role: 'Batteria',
            joinedAt: now
          }
        ],
        lookingFor: ['Tastiere/Pianoforte', 'Sax'],
        socialLinks: {
          instagram: '@thevelvetgroove_mi',
          spotify: 'The Velvet Groove'
        },
        createdAt: now
      },
      {
        _id: 'b2',
        name: 'Lunar Echoes',
        bio: 'Quartetto alternative rock ispirato a Interpol, The National e Arctic Monkeys. All\'attivo un EP registrato e date live a Roma e nel centro Italia.',
        city: 'Roma (RM)',
        avatar: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80',
        genres: ['Alternative Rock', 'Post-Punk', 'Indie Rock'],
        leaderId: 'm4',
        members: [
          {
            musicianId: 'm4',
            musicianName: 'Elena Russo',
            musicianAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
            role: 'Voce & Testi',
            joinedAt: now
          },
          {
            musicianId: 'm6',
            musicianName: 'Samuele Ferraro',
            musicianAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
            role: 'Tastiere & Synth',
            joinedAt: now
          }
        ],
        lookingFor: ['Chitarra Solista', 'Basso Elettrico'],
        socialLinks: {
          instagram: '@lunarechoes_band'
        },
        createdAt: now
      }
    ];

    for (const b of demoBands) {
      await Band.create(b);
    }
    console.log('✅ Demo bands seeded successfully!');
  } catch (err) {
    console.error('Error seeding demo bands:', err);
  }
}

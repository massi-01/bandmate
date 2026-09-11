export type Gender = 'Uomo' | 'Donna' | 'Non binario' | 'Preferisco non specificare';

export type SkillLevel = 'Principiante' | 'Intermedio' | 'Avanzato' | 'Professionista';

export interface InstrumentItem {
  name: string;
  level: SkillLevel;
  isPrimary?: boolean;
}

export type AvailabilityStatus = 
  | 'Disponibile per Jam'
  | 'Cerco Band fissa'
  | 'Disponibile per serate/live'
  | 'Solo per divertimento'
  | 'Progetti studio/registrazione';

export interface MusicianProfile {
  id: string;
  name: string;
  username: string;
  age: number;
  gender: Gender;
  instruments: InstrumentItem[];
  city: string; // Provenienza
  region: string;
  genres: string[];
  bio: string;
  avatar: string;
  availability: AvailabilityStatus;
  experienceYears: number;
  phoneOrContact?: string; // Per contatti pubblici visto che non ci sono DM
  socialLinks?: {
    instagram?: string;
    spotify?: string;
    youtube?: string;
    soundcloud?: string;
  };
  createdAt: string;
}

export interface InstrumentSlot {
  id: string;
  instrument: string;
  maxCount: number;
  assignedMusicians: {
    musicianId: string;
    musicianName: string;
    musicianAvatar: string;
    joinedAt: string;
  }[];
}

export type EventType = 'Jam Session' | 'Prove di Gruppo' | 'Live / Concerto' | 'Aperitivo Musicale' | 'Workshop';

export interface EventAppliedBand {
  id: string;
  bandId: string;
  bandName: string;
  bandAvatar: string;
  city: string;
  genres: string[];
  leaderId: string;
  membersCount: number;
  message?: string;
  appliedAt: string;
}

export interface EventSong {
  id: string;
  title: string;
  artist: string;
  bpm?: number | string;
  key?: string;
  tutorialUrl?: string;
  notes?: string;
}

export interface EventComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorInstrument?: string;
  content: string;
  createdAt: string;
}

export interface JamEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  date: string;
  time: string;
  locationName: string;
  address: string;
  city: string;
  genres: string[];
  organizerId: string;
  slots: InstrumentSlot[];
  appliedBands?: EventAppliedBand[];
  setlist?: EventSong[];
  comments?: EventComment[];
  equipmentNotes?: string;
  createdAt: string;
}

export type PostCategory = 'cercasi-musicista' | 'cercasi-band' | 'proposta-jam' | 'generale';

export interface PostComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorInstrument: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  category: PostCategory;
  title: string;
  content: string;
  targetInstruments: string[];
  genres: string[];
  city: string;
  likes: string[]; // array di musician IDs
  comments: PostComment[];
  createdAt: string;
}

export interface BandMember {
  musicianId: string;
  musicianName: string;
  musicianAvatar: string;
  role: string;
  joinedAt: string;
}

export interface BandSocialLinks {
  instagram?: string;
  spotify?: string;
  youtube?: string;
  website?: string;
}

export interface Band {
  id: string;
  name: string;
  bio: string;
  city: string;
  avatar: string;
  genres: string[];
  leaderId: string;
  members: BandMember[];
  lookingFor: string[];
  socialLinks?: BandSocialLinks;
  createdAt: string;
}

export type ActiveTab = 'musicians' | 'bands' | 'events' | 'feed';

import { Router } from 'express';
import { db, formatMusicianRow } from '../db.ts';
import { 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  requireAuth, 
  type AuthenticatedRequest 
} from '../auth.ts';

export const authRouter = Router();

// Demo accounts for quick 1-click test login
authRouter.get('/demo-accounts', (_req, res) => {
  const demoUsers = [
    { name: 'Davide De Luca', role: 'Chitarrista (Milano)', email: 'davide@bandmate.it', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
    { name: 'Giulia Moretti', role: 'Bassista (Bologna)', email: 'giulia@bandmate.it', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
    { name: 'Marco Bianchi', role: 'Batterista (Milano)', email: 'marco@bandmate.it', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
    { name: 'Chiara Romano', role: 'Cantante (Roma)', email: 'chiara@bandmate.it', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80' },
    { name: 'Samuele Ferraro', role: 'Pianista/Synth (Torino)', email: 'samuele@bandmate.it', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' }
  ];
  res.json({ demoAccounts: demoUsers, defaultPassword: 'password123' });
});

// Register
authRouter.post('/register', (req, res) => {
  const { 
    email, 
    password, 
    name, 
    age, 
    gender, 
    city, 
    region, 
    instruments, 
    genres, 
    bio, 
    availability, 
    experienceYears, 
    phoneOrContact, 
    avatar 
  } = req.body;

  if (!email || !password || !name || !age || !gender || !city) {
    res.status(400).json({ error: 'Compila tutti i campi obbligatori (Email, Password, Nome, Età, Sesso, Città).' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'La password deve contenere almeno 6 caratteri.' });
    return;
  }

  // Check existing email
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existingUser) {
    res.status(400).json({ error: 'Esiste già un account registrato con questa email.' });
    return;
  }

  const userId = 'u_' + Date.now();
  const musicianId = 'm_' + Date.now();
  const username = (name.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Math.floor(Math.random() * 1000)).slice(0, 20);
  const { hash, salt } = hashPassword(password);
  const now = new Date().toISOString();

  // Insert user
  db.prepare(`
    INSERT INTO users (id, email, password_hash, salt, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, email.toLowerCase().trim(), hash, salt, now);

  // Default avatar if none provided
  const chosenAvatar = avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

  // Insert musician
  db.prepare(`
    INSERT INTO musicians (
      id, user_id, name, username, age, gender, city, region,
      avatar, bio, availability, experience_years, phone_or_contact,
      instruments_json, genres_json, social_links_json, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    musicianId,
    userId,
    name.trim(),
    username,
    parseInt(age) || 20,
    gender,
    city,
    region || '',
    chosenAvatar,
    bio || '',
    availability || 'Disponibile per Jam',
    parseInt(experienceYears) || 3,
    phoneOrContact || email,
    JSON.stringify(instruments || [{ name: 'Chitarra Elettrica', level: 'Intermedio', isPrimary: true }]),
    JSON.stringify(genres || ['Rock']),
    JSON.stringify({}),
    now
  );

  // Generate session token
  const token = generateToken();
  db.prepare(`
    INSERT INTO sessions (token, user_id, created_at)
    VALUES (?, ?, ?)
  `).run(token, userId, now);

  const musicianRow = db.prepare('SELECT * FROM musicians WHERE id = ?').get(musicianId);

  res.status(201).json({
    token,
    user: { id: userId, email: email.toLowerCase().trim() },
    musician: formatMusicianRow(musicianRow)
  });
});

// Login
authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Inserisci email e password.' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;
  if (!user) {
    res.status(401).json({ error: 'Credenziali non valide o utente non trovato.' });
    return;
  }

  const isValid = verifyPassword(password, user.password_hash, user.salt);
  if (!isValid) {
    res.status(401).json({ error: 'Password non corretta.' });
    return;
  }

  // Generate session token
  const token = generateToken();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO sessions (token, user_id, created_at)
    VALUES (?, ?, ?)
  `).run(token, user.id, now);

  const musicianRow = db.prepare('SELECT * FROM musicians WHERE user_id = ?').get(user.id);

  res.json({
    token,
    user: { id: user.id, email: user.email },
    musician: formatMusicianRow(musicianRow)
  });
});

// Get current user (me)
authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const musicianRow = db.prepare('SELECT * FROM musicians WHERE user_id = ?').get(req.user!.id);
  res.json({
    user: req.user,
    musician: formatMusicianRow(musicianRow)
  });
});

// Logout
authRouter.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }
  res.json({ success: true });
});

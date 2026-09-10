import { Router } from 'express';
import { User } from '../models/User.ts';
import { Musician } from '../models/Musician.ts';
import { Session } from '../models/Session.ts';
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
authRouter.post('/register', async (req, res) => {
  try {
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

    const normalizedEmail = email.toLowerCase().trim();

    // Check existing email
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(400).json({ error: 'Esiste già un account registrato con questa email.' });
      return;
    }

    const userId = 'u_' + Date.now();
    const musicianId = 'm_' + Date.now();
    const username = (name.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Math.floor(Math.random() * 1000)).slice(0, 20);
    const { hash, salt } = hashPassword(password);
    const now = new Date().toISOString();

    // Create user
    await User.create({
      _id: userId,
      email: normalizedEmail,
      passwordHash: hash,
      salt,
      createdAt: now
    });

    const chosenAvatar = avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

    // Create musician
    const musician = await Musician.create({
      _id: musicianId,
      userId,
      name: name.trim(),
      username,
      age: parseInt(age) || 20,
      gender,
      city: city.trim(),
      region: region || '',
      avatar: chosenAvatar,
      bio: bio || '',
      availability: availability || 'Disponibile per Jam',
      experienceYears: parseInt(experienceYears) || 3,
      phoneOrContact: phoneOrContact || email,
      instruments: instruments || [{ name: 'Chitarra Elettrica', level: 'Intermedio', isPrimary: true }],
      genres: genres || ['Rock'],
      socialLinks: {},
      createdAt: now
    });

    // Create session token
    const token = generateToken();
    await Session.create({
      token,
      userId,
      createdAt: now
    });

    res.status(201).json({
      token,
      user: { id: userId, email: normalizedEmail },
      musician
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Errore durante la registrazione: ' + err.message });
  }
});

// Login
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Inserisci email e password.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      res.status(401).json({ error: 'Credenziali non valide o utente non trovato.' });
      return;
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      res.status(401).json({ error: 'Password non corretta.' });
      return;
    }

    // Generate session token
    const token = generateToken();
    const now = new Date().toISOString();
    await Session.create({
      token,
      userId: user._id,
      createdAt: now
    });

    const musician = await Musician.findOne({ userId: user._id });

    res.json({
      token,
      user: { id: user._id, email: user.email },
      musician
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Errore durante il login: ' + err.message });
  }
});

// Get current user (me)
authRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const musician = await Musician.findOne({ userId: req.user!.id });
    res.json({
      user: req.user,
      musician
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Errore durante il recupero del profilo: ' + err.message });
  }
});

// Logout
authRouter.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await Session.deleteOne({ token });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Errore durante il logout: ' + err.message });
  }
});

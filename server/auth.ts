import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { Session } from './models/Session.ts';
import { User } from './models/User.ts';
import { Musician } from './models/Musician.ts';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
  musician?: any;
}

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const passwordHash = scryptSync(password, salt, 64).toString('hex');
  const bufferA = Buffer.from(hash, 'hex');
  const bufferB = Buffer.from(passwordHash, 'hex');
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export async function getSessionUser(token: string) {
  if (!token) return null;
  const session = await Session.findOne({ token });
  if (!session) return null;

  const user = await User.findById(session.userId);
  if (!user) return null;

  const musician = await Musician.findOne({ userId: user._id });

  return {
    token: session.token,
    user_id: user._id,
    email: user.email,
    musician_id: musician ? musician._id : null,
    musician_name: musician ? musician.name : null,
    musician_avatar: musician ? musician.avatar : null
  };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Accesso negato: token mancante o non valido.' });
    return;
  }

  const token = authHeader.substring(7);
  try {
    const sessionUser = await getSessionUser(token);

    if (!sessionUser) {
      res.status(401).json({ error: 'Sessione scaduta o non valida. Effettua nuovamente il login.' });
      return;
    }

    req.user = {
      id: sessionUser.user_id,
      email: sessionUser.email
    };

    if (sessionUser.musician_id) {
      req.musician = {
        id: sessionUser.musician_id,
        name: sessionUser.musician_name,
        avatar: sessionUser.musician_avatar
      };
    }

    next();
  } catch (err: any) {
    res.status(500).json({ error: 'Errore durante la verifica dell\'autenticazione: ' + err.message });
  }
}

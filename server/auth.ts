import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { db } from './db.ts';

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

export function getSessionUser(token: string) {
  if (!token) return null;
  const session = db.prepare(`
    SELECT s.token, u.id as user_id, u.email, m.id as musician_id, m.name as musician_name, m.avatar as musician_avatar
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN musicians m ON m.user_id = u.id
    WHERE s.token = ?
  `).get(token) as any;

  return session || null;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Accesso negato: token mancante o non valido.' });
    return;
  }

  const token = authHeader.substring(7);
  const sessionUser = getSessionUser(token);

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
}

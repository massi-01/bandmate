import { Router } from 'express';
import { db, formatPostRow } from '../db.ts';
import { requireAuth, type AuthenticatedRequest } from '../auth.ts';

export const postsRouter = Router();

// GET all posts
postsRouter.get('/', (req, res) => {
  const { category } = req.query;

  const rows = db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all();
  let list = rows.map(formatPostRow);

  if (category && typeof category === 'string' && category !== 'all') {
    list = list.filter(p => p.category === category);
  }

  res.json({ posts: list });
});

// POST create a new post (Protected)
postsRouter.post('/', requireAuth, (req: AuthenticatedRequest, res) => {
  const { category, title, content, city, targetInstruments, genres } = req.body;

  if (!title || !content || !city) {
    res.status(400).json({ error: 'Titolo, testo e città sono obbligatori per l\'annuncio.' });
    return;
  }

  const postId = 'p_' + Date.now();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO posts (
      id, author_id, category, title, content, city,
      target_instruments_json, genres_json, likes_json, comments_json, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    postId,
    req.musician.id,
    category || 'cercasi-musicista',
    title.trim(),
    content.trim(),
    city,
    JSON.stringify(targetInstruments || []),
    JSON.stringify(genres || []),
    JSON.stringify([]),
    JSON.stringify([]),
    now
  );

  const newRow = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
  res.status(201).json({ post: formatPostRow(newRow) });
});

// POST toggle like / applause on a post (Protected)
postsRouter.post('/:id/like', requireAuth, (req: AuthenticatedRequest, res) => {
  const postId = req.params.id;
  const postRow = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);

  if (!postRow) {
    res.status(404).json({ error: 'Annuncio non trovato.' });
    return;
  }

  const post = formatPostRow(postRow);
  const currentMusicianId = req.musician.id;
  const hasLiked = post.likes.includes(currentMusicianId);

  const updatedLikes = hasLiked
    ? post.likes.filter((id: string) => id !== currentMusicianId)
    : [...post.likes, currentMusicianId];

  db.prepare('UPDATE posts SET likes_json = ? WHERE id = ?').run(
    JSON.stringify(updatedLikes),
    postId
  );

  const updatedRow = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
  res.json({ post: formatPostRow(updatedRow) });
});

// POST add public comment to a post (Protected)
postsRouter.post('/:id/comments', requireAuth, (req: AuthenticatedRequest, res) => {
  const postId = req.params.id;
  const { content } = req.body;

  if (!content || !content.trim()) {
    res.status(400).json({ error: 'Il testo della risposta non può essere vuoto.' });
    return;
  }

  const postRow = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
  if (!postRow) {
    res.status(404).json({ error: 'Annuncio non trovato.' });
    return;
  }

  const post = formatPostRow(postRow);

  // Retrieve musician's primary instrument
  const musicianRow = db.prepare('SELECT instruments_json FROM musicians WHERE id = ?').get(req.musician.id) as any;
  const instruments = JSON.parse(musicianRow?.instruments_json || '[]');
  const primaryInst = instruments.find((i: any) => i.isPrimary) || instruments[0];

  const newComment = {
    id: 'c_' + Date.now(),
    authorId: req.musician.id,
    authorName: req.musician.name,
    authorAvatar: req.musician.avatar,
    authorInstrument: primaryInst ? primaryInst.name : 'Musicista',
    content: content.trim(),
    createdAt: new Date().toISOString()
  };

  const updatedComments = [...post.comments, newComment];

  db.prepare('UPDATE posts SET comments_json = ? WHERE id = ?').run(
    JSON.stringify(updatedComments),
    postId
  );

  const updatedRow = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
  res.status(201).json({ post: formatPostRow(updatedRow) });
});

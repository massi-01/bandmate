import { Router } from 'express';
import { Post } from '../models/Post.ts';
import { Musician } from '../models/Musician.ts';
import { requireAuth, type AuthenticatedRequest } from '../auth.ts';

export const postsRouter = Router();

// GET all posts
postsRouter.get('/', async (req, res) => {
  try {
    const { category } = req.query;

    let posts = await Post.find().sort({ createdAt: -1 });

    if (category && typeof category === 'string' && category !== 'all') {
      posts = posts.filter(p => p.category === category);
    }

    res.json({ posts });
  } catch (err: any) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Errore durante il recupero degli annunci: ' + err.message });
  }
});

// POST create a new post (Protected)
postsRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { category, title, content, city, targetInstruments, genres } = req.body;

    if (!title || !content || !city) {
      res.status(400).json({ error: 'Titolo, testo e città sono obbligatori per l\'annuncio.' });
      return;
    }

    const postId = 'p_' + Date.now();
    const now = new Date().toISOString();

    const post = await Post.create({
      _id: postId,
      authorId: req.musician.id,
      category: category || 'cercasi-musicista',
      title: title.trim(),
      content: content.trim(),
      city: city.trim(),
      targetInstruments: targetInstruments || [],
      genres: genres || [],
      likes: [],
      comments: [],
      createdAt: now
    });

    res.status(201).json({ post });
  } catch (err: any) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Errore durante la pubblicazione dell\'annuncio: ' + err.message });
  }
});

// POST toggle like / applause on a post (Protected)
postsRouter.post('/:id/like', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);

    if (!post) {
      res.status(404).json({ error: 'Annuncio non trovato.' });
      return;
    }

    const currentMusicianId = req.musician.id;
    const hasLiked = post.likes.includes(currentMusicianId);

    if (hasLiked) {
      post.likes = post.likes.filter((id: string) => id !== currentMusicianId);
    } else {
      post.likes.push(currentMusicianId);
    }

    await post.save();
    res.json({ post });
  } catch (err: any) {
    console.error('Error liking post:', err);
    res.status(500).json({ error: 'Errore durante l\'aggiunta del like: ' + err.message });
  }
});

// POST add public comment to a post (Protected)
postsRouter.post('/:id/comments', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ error: 'Il testo della risposta non può essere vuoto.' });
      return;
    }

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ error: 'Annuncio non trovato.' });
      return;
    }

    const musician = await Musician.findById(req.musician.id);
    const primaryInst = musician?.instruments.find((i: any) => i.isPrimary) || musician?.instruments[0];

    const newComment = {
      id: 'c_' + Date.now(),
      authorId: req.musician.id,
      authorName: req.musician.name,
      authorAvatar: req.musician.avatar || '',
      authorInstrument: primaryInst ? primaryInst.name : 'Musicista',
      content: content.trim(),
      createdAt: new Date().toISOString()
    };

    post.comments.push(newComment);
    await post.save();

    res.status(201).json({ post });
  } catch (err: any) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Errore durante l\'invio del commento: ' + err.message });
  }
});

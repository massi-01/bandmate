import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Flame, 
  X,
  Radio
} from 'lucide-react';
import type { PostCategory } from '../types';
import { INSTRUMENT_OPTIONS, GENRE_OPTIONS, CITY_OPTIONS } from '../data/mockData';

export const FeedView: React.FC = () => {
  const { 
    posts, 
    musicians, 
    currentMusician, 
    togglePostLike, 
    addPostComment, 
    createPost,
    setSelectedMusicianForModal,
    isCreatePostOpen,
    setIsCreatePostOpen,
    setIsAuthModalOpen
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});

  // New Post Form State
  const [postCategory, setPostCategory] = useState<PostCategory>('cercasi-musicista');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCity, setPostCity] = useState(CITY_OPTIONS[0]);
  const [postInstruments, setPostInstruments] = useState<string[]>(['Chitarra Elettrica']);
  const [postGenres, setPostGenres] = useState<string[]>(['Rock']);

  const handleToggleInstrumentTag = (inst: string) => {
    if (postInstruments.includes(inst)) {
      setPostInstruments(postInstruments.filter(i => i !== inst));
    } else {
      setPostInstruments([...postInstruments, inst]);
    }
  };

  const handleToggleGenreTag = (genre: string) => {
    if (postGenres.includes(genre)) {
      setPostGenres(postGenres.filter(g => g !== genre));
    } else {
      setPostGenres([...postGenres, genre]);
    }
  };

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      alert('Inserisci titolo e testo del tuo annuncio!');
      return;
    }

    createPost({
      category: postCategory,
      title: postTitle.trim(),
      content: postContent.trim(),
      city: postCity,
      targetInstruments: postInstruments,
      genres: postGenres
    });

    setIsCreatePostOpen(false);
    setPostTitle('');
    setPostContent('');
  };

  const handleCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    addPostComment(postId, text);
    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  // Filter posts
  const filteredPosts = posts.filter(p => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  return (
    <div className="feed-container">
      {/* Banner */}
      <div className="section-hero">
        <div>
          <h1 className="section-hero-title">Bacheca Annunci & Community</h1>
          <p className="section-hero-desc">
            Pubblica annunci pubblici per completare la tua band, offrire la tua disponibilità 
            o proporre jam. Rispondi pubblicamente per accordarvi e iniziare a suonare.
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            if (!currentMusician) {
              setIsAuthModalOpen(true);
            } else {
              setIsCreatePostOpen(true);
            }
          }}
          style={{ whiteSpace: 'nowrap', zIndex: 2 }}
        >
          <Plus size={18} />
          <span>Pubblica Annuncio</span>
        </button>
      </div>

      {/* Filter tabs */}
      <div className="filter-bar" style={{ justifyContent: 'center' }}>
        <button
          className={`nav-tab-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          Tutti gli Annunci
        </button>
        <button
          className={`nav-tab-btn ${selectedCategory === 'cercasi-musicista' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('cercasi-musicista')}
        >
          🎸 Cercasi Musicista
        </button>
        <button
          className={`nav-tab-btn ${selectedCategory === 'cercasi-band' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('cercasi-band')}
        >
          🥁 Cercasi Band
        </button>
        <button
          className={`nav-tab-btn ${selectedCategory === 'proposta-jam' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('proposta-jam')}
        >
          ⚡ Proposta Jam
        </button>
      </div>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', padding: '48px 24px', textAlign: 'center', borderRadius: '16px', border: '1px dashed var(--border-subtle)' }}>
          <Radio size={42} color="var(--accent-purple-light)" style={{ marginBottom: '12px', opacity: 0.7 }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '6px', color: '#fff' }}>Nessun annuncio in questa categoria</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
            Pubblica tu il primo annuncio per trovare componenti o proporre progetti musicali!
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => setIsCreatePostOpen(true)}>
            <Plus size={16} />
            <span>Nuovo Annuncio</span>
          </button>
        </div>
      ) : (
        filteredPosts.map(post => {
          const author = musicians.find(m => m.id === post.authorId) || {
            id: post.authorId,
            name: 'Musicista BandMate',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            city: post.city,
            age: 25,
            instruments: [{ name: 'Musicista', level: 'Intermedio' }]
          };

          const authorPrimaryInst = author.instruments[0]?.name || 'Musicista';
          const hasLiked = currentMusician ? post.likes.includes(currentMusician.id) : false;

          return (
            <article key={post.id} className="post-card">
              {/* Header */}
              <div className="post-header">
                <div 
                  className="post-author-wrap"
                  onClick={() => {
                    const found = musicians.find(m => m.id === author.id);
                    if (found) setSelectedMusicianForModal(found);
                  }}
                >
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="post-author-avatar"
                  />
                  <div>
                    <div className="post-author-name">{author.name}</div>
                    <div className="post-author-details">
                      <span>{authorPrimaryInst}</span> • <span style={{ color: 'var(--accent-cyan)' }}>📍 {post.city}</span>
                    </div>
                  </div>
                </div>

                <span className={`post-category-tag ${post.category}`}>
                  {post.category === 'cercasi-band' && 'Cercasi Band'}
                  {post.category === 'cercasi-musicista' && 'Cercasi Musicista'}
                  {post.category === 'proposta-jam' && 'Proposta Jam'}
                  {post.category === 'generale' && 'Generale'}
                </span>
              </div>

              {/* Title & Body */}
              <h2 className="post-title">{post.title}</h2>
              <p className="post-content">{post.content}</p>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {post.targetInstruments.map(inst => (
                  <span key={inst} className="instrument-badge primary" style={{ fontSize: '0.74rem' }}>
                    🔍 {inst}
                  </span>
                ))}
                {post.genres.map(g => (
                  <span key={g} className="genre-tag" style={{ fontSize: '0.74rem' }}>
                    {g}
                  </span>
                ))}
              </div>

              {/* Action Bar */}
              <div className="post-actions-bar">
                <button
                  className={`action-btn ${hasLiked ? 'liked' : ''}`}
                  onClick={() => togglePostLike(post.id)}
                  title={hasLiked ? 'Hai applaudito questo annuncio' : 'Applaudi / Metti like'}
                >
                  <Flame size={18} fill={hasLiked ? 'currentColor' : 'none'} />
                  <span>{post.likes.length} Applausi</span>
                </button>

                <button
                  className="action-btn"
                  onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                >
                  <MessageSquare size={18} />
                  <span>{post.comments.length} Risposte</span>
                </button>

                <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Pubblicato {new Date(post.createdAt).toLocaleDateString('it-IT')}
                </div>
              </div>

              {/* Public Comments Section */}
              <div className="comments-container">
                {post.comments.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {post.comments.map(c => (
                      <div key={c.id} className="comment-card">
                        <img 
                          src={c.authorAvatar} 
                          alt={c.authorName} 
                          className="comment-avatar"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            const found = musicians.find(m => m.id === c.authorId);
                            if (found) setSelectedMusicianForModal(found);
                          }}
                        />
                        <div className="comment-content-wrap">
                          <div className="comment-author-name">
                            <span>{c.authorName}</span>
                            <span className="comment-instrument">• {c.authorInstrument}</span>
                          </div>
                          <div className="comment-text">{c.content}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input to write public answer */}
                {currentMusician ? (
                  <form 
                    onSubmit={e => handleCommentSubmit(post.id, e)}
                    className="comment-input-form"
                  >
                    <img
                      src={currentMusician.avatar}
                      alt={currentMusician.name}
                      style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <input
                      type="text"
                      className="comment-input"
                      placeholder={`Rispondi pubblicamente come ${currentMusician.name}...`}
                      value={commentInputs[post.id] || ''}
                      onChange={e => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                    />
                    <button type="submit" className="btn btn-primary btn-sm">
                      <Send size={15} />
                      <span>Invia</span>
                    </button>
                  </form>
                ) : (
                  <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed var(--border-subtle)', textAlign: 'center' }}>
                    <button 
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setIsAuthModalOpen(true)}
                    >
                      Accedi o registrati per rispondere pubblicamente
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })
      )}

      {/* Modal Nuovo Post */}
      {isCreatePostOpen && (
        <div className="modal-overlay" onClick={() => setIsCreatePostOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div className="modal-title">Pubblica un Annuncio in Bacheca</div>
              <button className="modal-close-btn" onClick={() => setIsCreatePostOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePostSubmit}>
              <div className="modal-body">
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Tipo di Annuncio *</label>
                    <select
                      className="form-select"
                      value={postCategory}
                      onChange={e => setPostCategory(e.target.value as PostCategory)}
                    >
                      <option value="cercasi-musicista">Cercasi Musicista</option>
                      <option value="cercasi-band">Cercasi Band</option>
                      <option value="proposta-jam">Proposta Jam</option>
                      <option value="generale">Generale</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Città di Riferimento *</label>
                    <select
                      className="form-select"
                      value={postCity}
                      onChange={e => setPostCity(e.target.value)}
                    >
                      {CITY_OPTIONS.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Titolo Annuncio *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="Es. Band rock cerca chitarrista solista a Bologna"
                    value={postTitle}
                    onChange={e => setPostTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Descrizione Dettagliata *</label>
                  <textarea
                    rows={4}
                    className="form-textarea"
                    required
                    placeholder="Descrivi chi sei, che genere suoni, repertorio, frequenza prove e contatti..."
                    value={postContent}
                    onChange={e => setPostContent(e.target.value)}
                  />
                </div>

                {/* Strumenti ricercati / coinvolti */}
                <div className="form-group">
                  <label className="form-label">Strumenti Ricercati / Interessati</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {INSTRUMENT_OPTIONS.map(inst => {
                      const isSelected = postInstruments.includes(inst);
                      return (
                        <button
                          key={inst}
                          type="button"
                          onClick={() => handleToggleInstrumentTag(inst)}
                          style={{
                            background: isSelected ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                            color: isSelected ? '#c4b5fd' : 'var(--text-secondary)',
                            border: isSelected ? '1px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                          }}
                        >
                          {inst}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Generi */}
                <div className="form-group">
                  <label className="form-label">Generi Musicali</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {GENRE_OPTIONS.slice(0, 10).map(genre => {
                      const isSelected = postGenres.includes(genre);
                      return (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => handleToggleGenreTag(genre)}
                          style={{
                            background: isSelected ? 'rgba(249, 115, 22, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                            color: isSelected ? '#fdba74' : 'var(--text-secondary)',
                            border: isSelected ? '1px solid #f97316' : '1px solid var(--border-subtle)',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                          }}
                        >
                          {genre}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreatePostOpen(false)}>
                  Annulla
                </button>
                <button type="submit" className="btn btn-primary">
                  Pubblica Annuncio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Sparkles, 
  Check, 
  Radio, 
  Plus
} from 'lucide-react';
import { CITY_OPTIONS, GENRE_OPTIONS, INSTRUMENT_OPTIONS } from '../data/mockData';

const PRESET_BAND_AVATARS = [
  { label: 'Rock / Indie', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80' },
  { label: 'Live Concert', url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80' },
  { label: 'Studio Vibes', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80' },
  { label: 'Acoustic / Folk', url: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?auto=format&fit=crop&w=600&q=80' },
  { label: 'Jazz Club', url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=600&q=80' }
];

export const CreateBandModal: React.FC = () => {
  const { 
    isCreateBandOpen, 
    setIsCreateBandOpen, 
    createBand, 
    currentMusician 
  } = useApp();

  const [name, setName] = useState('');
  const [city, setCity] = useState(currentMusician?.city || CITY_OPTIONS[0]);
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(PRESET_BAND_AVATARS[0].url);
  const [leaderRole, setLeaderRole] = useState(
    currentMusician?.instruments?.find(i => i.isPrimary)?.name || 
    currentMusician?.instruments?.[0]?.name || 
    'Chitarra & Voce'
  );
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Rock', 'Alternative']);
  const [lookingFor, setLookingFor] = useState<string[]>(['Batteria']);
  const [lookingForInput, setLookingForInput] = useState(INSTRUMENT_OPTIONS[0]);

  // Socials
  const [instagram, setInstagram] = useState('');
  const [spotify, setSpotify] = useState('');
  const [youtube, setYoutube] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isCreateBandOpen) return null;

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      if (selectedGenres.length === 1) return; // Keep at least one
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleAddLookingFor = () => {
    if (!lookingForInput || lookingFor.includes(lookingForInput)) return;
    setLookingFor([...lookingFor, lookingForInput]);
  };

  const handleRemoveLookingFor = (inst: string) => {
    setLookingFor(lookingFor.filter(i => i !== inst));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Inserisci il nome della band');
      return;
    }
    if (!leaderRole.trim()) {
      setError('Specifica il tuo ruolo all\'interno della band');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await createBand({
      name: name.trim(),
      city: city.trim(),
      bio: bio.trim(),
      avatar: avatar.trim(),
      genres: selectedGenres,
      leaderRole: leaderRole.trim(),
      lookingFor,
      socialLinks: {
        instagram: instagram.trim(),
        spotify: spotify.trim(),
        youtube: youtube.trim()
      }
    });

    setLoading(false);

    if (result) {
      setIsCreateBandOpen(false);
      setName('');
      setBio('');
      setInstagram('');
      setSpotify('');
      setYoutube('');
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIsCreateBandOpen(false)}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="brand-icon" style={{ width: '38px', height: '38px' }}>
              <Radio size={20} />
            </div>
            <div>
              <h2 className="modal-title">Fonda una Nuova Band</h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Crea il tuo gruppo musicale e recluta altri talenti
              </div>
            </div>
          </div>
          <button 
            className="modal-close-btn"
            onClick={() => setIsCreateBandOpen(false)}
            aria-label="Chiudi"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid var(--accent-red)',
              borderRadius: '10px',
              padding: '10px 14px',
              color: '#fca5a5',
              fontSize: '0.85rem',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          {/* Nome e Città */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Nome della Band *</label>
              <input
                type="text"
                className="form-input"
                placeholder="es. The Velvet Groove, Neon Waves..."
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Città di Riferimento *</label>
              <select
                className="form-select"
                value={city}
                onChange={e => setCity(e.target.value)}
              >
                {CITY_OPTIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Il tuo ruolo */}
          <div className="form-group">
            <label className="form-label">Il Tuo Ruolo nella Band *</label>
            <input
              type="text"
              className="form-input"
              placeholder="es. Voce & Chitarra Solista, Basso, Batteria..."
              value={leaderRole}
              onChange={e => setLeaderRole(e.target.value)}
              required
            />
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Sarai registrato automaticamente come fondatore e primo componente della band.
            </div>
          </div>

          {/* Bio / Presentazione */}
          <div className="form-group">
            <label className="form-label">Presentazione del Progetto / Bio</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Descrivi il sound della band, influenze musicali, obiettivi (live, registrazione brani inediti, cover band, frequenza prove)..."
              value={bio}
              onChange={e => setBio(e.target.value)}
            />
          </div>

          {/* Immagine / Avatar con Preset */}
          <div className="form-group">
            <label className="form-label">Immagine del Gruppo (Copertina / Logo)</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {PRESET_BAND_AVATARS.map((preset, idx) => {
                const isSelected = avatar === preset.url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(preset.url)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                      color: isSelected ? '#fff' : 'var(--text-secondary)',
                      fontSize: '0.76rem',
                      cursor: 'pointer'
                    }}
                  >
                    <img 
                      src={preset.url} 
                      alt={preset.label} 
                      style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'cover' }} 
                    />
                    <span>{preset.label}</span>
                    {isSelected && <Check size={12} color="var(--accent-purple-light)" />}
                  </button>
                );
              })}
            </div>
            <input
              type="url"
              className="form-input"
              placeholder="Oppure inserisci URL immagine personalizzata (https://...)"
              value={avatar}
              onChange={e => setAvatar(e.target.value)}
            />
          </div>

          {/* Generi Musicali */}
          <div className="form-group">
            <label className="form-label">Generi Musicali</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '110px', overflowY: 'auto', padding: '4px 0' }}>
              {GENRE_OPTIONS.map(genre => {
                const isSelected = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    className={`tag-selectable ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Posizioni aperte cercate */}
          <div className="form-group" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Sparkles size={16} color="#fbbf24" />
              <span>Strumenti Cercati / Posizioni Aperte (Reclutamento)</span>
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <select
                className="form-select"
                style={{ flex: 1 }}
                value={lookingForInput}
                onChange={e => setLookingForInput(e.target.value)}
              >
                {INSTRUMENT_OPTIONS.map(inst => (
                  <option key={inst} value={inst}>{inst}</option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-outline-accent btn-sm"
                onClick={handleAddLookingFor}
              >
                <Plus size={15} />
                <span>Aggiungi Ruolo</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {lookingFor.length === 0 ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Nessuna posizione aperta. La band è al completo!
                </span>
              ) : (
                lookingFor.map(role => (
                  <span 
                    key={role}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      color: '#fbbf24',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    🔍 Cerchiamo: {role}
                    <button
                      type="button"
                      onClick={() => handleRemoveLookingFor(role)}
                      style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="form-group">
            <label className="form-label">Canali Social & Streaming (Opzionale)</label>
            <div className="form-row-3">
              <input
                type="text"
                className="form-input"
                placeholder="Instagram (@band)"
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Spotify Artist Link"
                value={spotify}
                onChange={e => setSpotify(e.target.value)}
              />
              <input
                type="text"
                className="form-input"
                placeholder="YouTube Channel"
                value={youtube}
                onChange={e => setYoutube(e.target.value)}
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="modal-footer" style={{ marginTop: '16px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCreateBandOpen(false)}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <Radio size={16} />
              <span>{loading ? 'Creazione in corso...' : 'Fonda Band'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

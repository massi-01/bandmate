import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import type { MusicianProfile, Gender, SkillLevel, AvailabilityStatus } from '../types';
import { 
  X, 
  MapPin, 
  Mail, 
  Music, 
  Plus, 
  Trash2,
  Sparkles,
  ArrowLeft,
  Upload,
  Check,
  RotateCcw
} from 'lucide-react';
import { INSTRUMENT_OPTIONS, GENRE_OPTIONS, CITY_OPTIONS } from '../data/mockData';

export const ProfileModal: React.FC = () => {
  const { 
    selectedMusicianForModal, 
    setSelectedMusicianForModal, 
    selectedBandForModal,
    isEditProfileOpen, 
    setIsEditProfileOpen, 
    currentMusician, 
    updateCurrentProfile,
    setIsAuthModalOpen,
    events
  } = useApp();

  // Edit form state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const [formData, setFormData] = useState<Partial<MusicianProfile>>(() => ({
    name: currentMusician?.name || '',
    age: currentMusician?.age || 20,
    gender: currentMusician?.gender || 'Preferisco non specificare',
    city: currentMusician?.city || CITY_OPTIONS[0],
    bio: currentMusician?.bio || '',
    avatar: currentMusician?.avatar || '',
    availability: currentMusician?.availability || 'Disponibile per Jam',
    experienceYears: currentMusician?.experienceYears || 3,
    phoneOrContact: currentMusician?.phoneOrContact || '',
    instruments: currentMusician ? [...currentMusician.instruments] : [],
    genres: currentMusician ? [...currentMusician.genres] : []
  }));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Seleziona un formato immagine valido (JPEG, PNG, WebP).');
      return;
    }

    setUploadError(null);
    setIsProcessingImage(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Center-crop and scale to max 500x500 square
        const canvas = document.createElement('canvas');
        const MAX_DIM = 500;
        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;
        const targetDim = Math.min(minDim, MAX_DIM);

        canvas.width = targetDim;
        canvas.height = targetDim;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, targetDim, targetDim);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setFormData(prev => ({ ...prev, avatar: compressedDataUrl }));
        }
        setIsProcessingImage(false);
      };
      img.onerror = () => {
        setUploadError('Impossibile elaborare l\'immagine caricata.');
        setIsProcessingImage(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setUploadError('Errore durante la lettura del file dal disco.');
      setIsProcessingImage(false);
    };
    reader.readAsDataURL(file);
  };

  // Helper to sync form data when modal opens
  React.useEffect(() => {
    if (isEditProfileOpen) {
      if (!currentMusician) {
        setIsEditProfileOpen(false);
        setIsAuthModalOpen(true);
        return;
      }
      setFormData({
        name: currentMusician.name,
        age: currentMusician.age,
        gender: currentMusician.gender,
        city: currentMusician.city,
        bio: currentMusician.bio,
        avatar: currentMusician.avatar,
        availability: currentMusician.availability,
        experienceYears: currentMusician.experienceYears,
        phoneOrContact: currentMusician.phoneOrContact || '',
        instruments: [...currentMusician.instruments],
        genres: [...currentMusician.genres]
      });
    }
  }, [isEditProfileOpen, currentMusician, setIsEditProfileOpen, setIsAuthModalOpen]);

  // Handle instrument addition in form
  const [newInstrumentName, setNewInstrumentName] = useState(INSTRUMENT_OPTIONS[0]);
  const [newInstrumentLevel, setNewInstrumentLevel] = useState<SkillLevel>('Intermedio');

  const addInstrument = () => {
    if (!formData.instruments) return;
    if (formData.instruments.some(i => i.name === newInstrumentName)) return;
    
    setFormData({
      ...formData,
      instruments: [
        ...formData.instruments,
        {
          name: newInstrumentName,
          level: newInstrumentLevel,
          isPrimary: formData.instruments.length === 0
        }
      ]
    });
  };

  const removeInstrument = (name: string) => {
    if (!formData.instruments) return;
    const remaining = formData.instruments.filter(i => i.name !== name);
    if (remaining.length > 0 && !remaining.some(i => i.isPrimary)) {
      remaining[0].isPrimary = true;
    }
    setFormData({ ...formData, instruments: remaining });
  };

  const setPrimaryInstrument = (name: string) => {
    if (!formData.instruments) return;
    setFormData({
      ...formData,
      instruments: formData.instruments.map(i => ({
        ...i,
        isPrimary: i.name === name
      }))
    });
  };

  const toggleGenre = (genre: string) => {
    if (!formData.genres) return;
    if (formData.genres.includes(genre)) {
      setFormData({ ...formData, genres: formData.genres.filter(g => g !== genre) });
    } else {
      setFormData({ ...formData, genres: [...formData.genres, genre] });
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;
    if (!formData.instruments || formData.instruments.length === 0) {
      alert('Inserisci almeno uno strumento suonato!');
      return;
    }
    updateCurrentProfile(formData);
    setIsEditProfileOpen(false);
  };

  // Avatar presets
  const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80'
  ];

  // 1. Render Edit Profile Modal
  if (isEditProfileOpen) {
    return (
      <div className="modal-overlay modal-overlay-stacked" onClick={() => setIsEditProfileOpen(false)}>
        <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
          <div className="modal-header">
            <div className="modal-title">Modifica il tuo Profilo Musicista</div>
            <button className="modal-close-btn" onClick={() => setIsEditProfileOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div className="modal-body">
              {/* Profile Photo Selector with File Upload */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Foto Profilo Musicista</span>
                  {isProcessingImage && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>Ottimizzazione immagine in corso...</span>
                  )}
                </label>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative' }}>
                    <img
                      src={formData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                      alt="Preview"
                      style={{ 
                        width: '74px', 
                        height: '74px', 
                        borderRadius: '50%', 
                        objectFit: 'cover', 
                        border: '3px solid var(--accent-purple)',
                        boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)'
                      }}
                    />
                    {formData.avatar?.startsWith('data:') && (
                      <span 
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          background: 'var(--accent-emerald)',
                          borderRadius: '50%',
                          width: '22px',
                          height: '22px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          border: '2px solid #111726'
                        }}
                        title="Foto personalizzata caricata"
                      >
                        <Check size={13} />
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '220px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                      />
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
                      >
                        <Upload size={14} />
                        <span>Carica Foto dal Dispositivo</span>
                      </button>

                      {formData.avatar?.startsWith('data:') && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setFormData({ ...formData, avatar: currentMusician?.avatar || AVATAR_PRESETS[0] })}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem' }}
                          title="Ripristina foto originale"
                        >
                          <RotateCcw size={13} />
                          <span>Ripristina</span>
                        </button>
                      )}
                    </div>

                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Supporta JPG, PNG, WebP da PC o fotocamera smartphone. Ritagliata e ottimizzata automaticamente.
                    </span>

                    {uploadError && (
                      <span style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 600 }}>
                        ⚠️ {uploadError}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Oppure scegli un preset rapido:
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {AVATAR_PRESETS.map((p, idx) => (
                      <img
                        key={idx}
                        src={p}
                        alt="preset"
                        onClick={() => setFormData({ ...formData, avatar: p })}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          cursor: 'pointer',
                          border: formData.avatar === p ? '2px solid var(--accent-pink)' : '1px solid var(--border-subtle)',
                          opacity: formData.avatar === p ? 1 : 0.6,
                          transition: 'all 0.15s ease'
                        }}
                        title={`Scegli preset ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <input
                  type="url"
                  className="form-input"
                  placeholder="Oppure incolla un URL immagine diretto..."
                  value={formData.avatar || ''}
                  onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                  style={{ fontSize: '0.8rem' }}
                />
              </div>

              {/* Informazioni Personali Base: Nome, Età, Sesso */}
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Nome Completo *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Età *</label>
                  <input
                    type="number"
                    min="14"
                    max="99"
                    className="form-input"
                    required
                    value={formData.age || 20}
                    onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) || 18 })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sesso *</label>
                  <select
                    className="form-select"
                    value={formData.gender || 'Preferisco non specificare'}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })}
                  >
                    <option value="Uomo">Uomo</option>
                    <option value="Donna">Donna</option>
                    <option value="Non binario">Non binario</option>
                    <option value="Preferisco non specificare">Preferisco non specificare</option>
                  </select>
                </div>
              </div>

              {/* Provenienza e Disponibilità */}
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Provenienza (Città) *</label>
                  <select
                    className="form-select"
                    value={formData.city || CITY_OPTIONS[0]}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                  >
                    {CITY_OPTIONS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Stato di Disponibilità</label>
                  <select
                    className="form-select"
                    value={formData.availability || 'Disponibile per Jam'}
                    onChange={e => setFormData({ ...formData, availability: e.target.value as AvailabilityStatus })}
                  >
                    <option value="Disponibile per Jam">Disponibile per Jam</option>
                    <option value="Cerco Band fissa">Cerco Band fissa</option>
                    <option value="Disponibile per serate/live">Disponibile per serate/live</option>
                    <option value="Solo per divertimento">Solo per divertimento</option>
                    <option value="Progetti studio/registrazione">Progetti studio/registrazione</option>
                  </select>
                </div>
              </div>

              {/* Strumenti Suonati (Gestione dinamica con livello e strumento principale) */}
              <div className="form-group">
                <label className="form-label">Strumenti Suonati & Livello *</label>
                
                {/* Current instruments list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                  {formData.instruments && formData.instruments.map(inst => (
                    <div
                      key={inst.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: inst.isPrimary ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: inst.isPrimary ? '1px solid var(--accent-purple)' : '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{inst.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({inst.level})</span>
                        {inst.isPrimary && (
                          <span style={{ fontSize: '0.7rem', background: 'var(--accent-purple)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            Principale
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {!inst.isPrimary && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                            onClick={() => setPrimaryInstrument(inst.name)}
                          >
                            Imposta Principale
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeInstrument(inst.name)}
                          style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: '4px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new instrument row */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    className="form-select"
                    style={{ flex: 2 }}
                    value={newInstrumentName}
                    onChange={e => setNewInstrumentName(e.target.value)}
                  >
                    {INSTRUMENT_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <select
                    className="form-select"
                    style={{ flex: 1.5 }}
                    value={newInstrumentLevel}
                    onChange={e => setNewInstrumentLevel(e.target.value as SkillLevel)}
                  >
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzato">Avanzato</option>
                    <option value="Professionista">Professionista</option>
                  </select>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={addInstrument}
                    style={{ flex: 'none' }}
                  >
                    <Plus size={18} />
                    <span>Aggiungi</span>
                  </button>
                </div>
              </div>

              {/* Generi preferiti */}
              <div className="form-group">
                <label className="form-label">Generi Musicali Preferiti</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {GENRE_OPTIONS.map(genre => {
                    const isSelected = formData.genres?.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleGenre(genre)}
                        style={{
                          background: isSelected ? 'rgba(249, 115, 22, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                          color: isSelected ? '#fdba74' : 'var(--text-secondary)',
                          border: isSelected ? '1px solid #f97316' : '1px solid var(--border-subtle)',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bio & Contatto Pubblico */}
              <div className="form-group">
                <label className="form-label">Bio & Esperienza Musicale</label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  placeholder="Racconta di te, della tua esperienza, influenze musicali e cosa stai cercando..."
                  value={formData.bio || ''}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contatto Pubblico (Email o Telefono per farsi ricontattare)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Es. nome@email.it oppure @tuo_instagram"
                  value={formData.phoneOrContact || ''}
                  onChange={e => setFormData({ ...formData, phoneOrContact: e.target.value })}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                  Non essendoci ancora la chat privata interna, questo contatto sarà visibile nella tua scheda per organizzare jam e concerti.
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditProfileOpen(false)}>
                Annulla
              </button>
              <button type="submit" className="btn btn-primary">
                Salva Profilo
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 2. Render View Musician Details Modal
  if (selectedMusicianForModal) {
    const m = selectedMusicianForModal;
    const isSelf = currentMusician ? m.id === currentMusician.id : false;
    const userEvents = events.filter(e => 
      e.organizerId === m.id || e.slots.some(s => s.assignedMusicians.some(mus => mus.musicianId === m.id))
    );

    return (
      <div className="modal-overlay modal-overlay-stacked" onClick={() => setSelectedMusicianForModal(null)}>
        <div className="modal-card" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {selectedBandForModal && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                  onClick={() => setSelectedMusicianForModal(null)}
                  title={`Torna a ${selectedBandForModal.name}`}
                >
                  <ArrowLeft size={14} />
                  <span>Torna alla Band</span>
                </button>
              )}
              <div className="modal-title">Scheda Musicista</div>
            </div>
            <button className="modal-close-btn" onClick={() => setSelectedMusicianForModal(null)} aria-label="Chiudi">
              <X size={20} />
            </button>
          </div>

          <div className="modal-body">
            {/* Header with Photo, Name, Personal Details */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <img
                src={m.avatar}
                alt={m.name}
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '20px',
                  objectFit: 'cover',
                  border: '3px solid var(--accent-purple)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.5)'
                }}
              />
              <div>
                <h3 style={{ fontSize: '1.45rem', color: '#fff' }}>{m.name}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginTop: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <span>{m.age} anni</span>
                  <span className="info-bullet">•</span>
                  <span>{m.gender}</span>
                  <span className="info-bullet">•</span>
                  <span style={{ color: 'var(--accent-cyan)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} /> {m.city}
                  </span>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <span className={`availability-pill ${m.availability.includes('Jam') || m.availability.includes('live') ? 'active' : 'seeking'}`}>
                    <Sparkles size={13} /> {m.availability}
                  </span>
                </div>
              </div>
            </div>

            {/* Strumenti Suonati */}
            <div>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Strumenti Suonati
              </h4>
              <div className="badge-container">
                {m.instruments.map(inst => (
                  <span key={inst.name} className={`instrument-badge ${inst.isPrimary ? 'primary' : 'secondary'}`}>
                    <Music size={13} />
                    <span>{inst.name}</span>
                    <span className="level-tag">({inst.level})</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Generi Musicali */}
            <div>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Generi Musicali
              </h4>
              <div className="genre-tags">
                {m.genres.map(g => (
                  <span key={g} className="genre-tag">{g}</span>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Biografia & Percorso
              </h4>
              <p style={{ fontSize: '0.92rem', color: '#e2e8f0', lineHeight: 1.6, background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                {m.bio}
              </p>
            </div>

            {/* Contatto Pubblico */}
            {m.phoneOrContact && (
              <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={20} color="var(--accent-cyan)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>Contatto diretto musicista:</div>
                  <div style={{ fontSize: '0.92rem', color: '#fff', fontWeight: 700 }}>{m.phoneOrContact}</div>
                </div>
              </div>
            )}

            {/* Eventi / Jam a cui partecipa */}
            {userEvents.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Jam ed Eventi Correlati ({userEvents.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {userEvents.map(ev => (
                    <div key={ev.id} style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>{ev.title}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>📍 {ev.city} • 📅 {ev.date}</div>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-purple-light)', background: 'rgba(139, 92, 246, 0.15)', padding: '3px 8px', borderRadius: '4px' }}>
                        {ev.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            {selectedBandForModal ? (
              <button 
                type="button"
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setSelectedMusicianForModal(null)}
              >
                <ArrowLeft size={16} />
                <span>Torna a {selectedBandForModal.name}</span>
              </button>
            ) : <div />}

            <div>
              {isSelf ? (
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedMusicianForModal(null);
                    setIsEditProfileOpen(true);
                  }}
                >
                  Modifica le tue informazioni
                </button>
              ) : (
                <button 
                  className="btn btn-secondary"
                  onClick={() => setSelectedMusicianForModal(null)}
                >
                  Chiudi Scheda
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

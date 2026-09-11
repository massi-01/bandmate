import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  MapPin, 
  Plus, 
  Music, 
  CheckCircle2, 
  X,
  ExternalLink,
  Radio,
  MessageSquare,
  Send,
  Trash2,
  ChevronDown,
  ChevronUp,
  Disc3
} from 'lucide-react';
import type { EventType } from '../types';
import { INSTRUMENT_OPTIONS, GENRE_OPTIONS, CITY_OPTIONS } from '../data/mockData';

export const EventsView: React.FC = () => {
  const { 
    events, 
    currentMusician, 
    joinEventSlot, 
    leaveEventSlot, 
    createEvent,
    applyBandToEvent,
    withdrawBandFromEvent,
    addEventComment,
    bands,
    setSelectedMusicianForModal,
    setSelectedBandForModal,
    musicians,
    isCreateEventOpen,
    setIsCreateEventOpen,
    setIsAuthModalOpen
  } = useApp();

  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // New Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<EventType>('Jam Session');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('21:00');
  const [newLocationName, setNewLocationName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState(CITY_OPTIONS[0]);
  const [newGenres, setNewGenres] = useState<string[]>(['Funk', 'Rock']);
  const [newNotes, setNewNotes] = useState('');

  // Default slots for event creation
  const [customSlots, setCustomSlots] = useState<{ instrument: string; maxCount: number }[]>([
    { instrument: 'Batteria', maxCount: 1 },
    { instrument: 'Basso Elettrico', maxCount: 1 },
    { instrument: 'Chitarra Elettrica', maxCount: 2 },
    { instrument: 'Voce', maxCount: 1 }
  ]);
  const [slotToAdd, setSlotToAdd] = useState(INSTRUMENT_OPTIONS[0]);

  // Scaletta / Setlist form state for new event
  const [newSetlist, setNewSetlist] = useState<{
    title: string;
    artist: string;
    bpm: string;
    key: string;
    tutorialUrl: string;
    notes: string;
  }[]>([]);
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [songBpm, setSongBpm] = useState('');
  const [songKey, setSongKey] = useState('');
  const [songTutorialUrl, setSongTutorialUrl] = useState('');
  const [songNotes, setSongNotes] = useState('');

  // Band candidature dialog state
  const [applyingBandEventId, setApplyingBandEventId] = useState<string | null>(null);
  const [selectedBandToApply, setSelectedBandToApply] = useState<string>('');
  const [bandApplyMessage, setBandApplyMessage] = useState<string>('');

  // Interactive accordions and comment inputs per event
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [expandedSetlists, setExpandedSetlists] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [isSubmittingComment, setIsSubmittingComment] = useState<Record<string, boolean>>({});

  const userBands = bands.filter(b => 
    currentMusician && (b.leaderId === currentMusician.id || b.members.some(m => m.musicianId === currentMusician.id))
  );

  const handleAddSongToSetlist = () => {
    if (!songTitle.trim()) return;
    setNewSetlist(prev => [
      ...prev,
      {
        title: songTitle.trim(),
        artist: songArtist.trim() || 'Brano',
        bpm: songBpm.trim(),
        key: songKey.trim(),
        tutorialUrl: songTutorialUrl.trim(),
        notes: songNotes.trim()
      }
    ]);
    setSongTitle('');
    setSongArtist('');
    setSongBpm('');
    setSongKey('');
    setSongTutorialUrl('');
    setSongNotes('');
  };

  const handleRemoveSongFromSetlist = (index: number) => {
    setNewSetlist(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAddCustomSlot = () => {
    if (customSlots.some(s => s.instrument === slotToAdd)) return;
    setCustomSlots([...customSlots, { instrument: slotToAdd, maxCount: 1 }]);
  };

  const handleRemoveCustomSlot = (inst: string) => {
    setCustomSlots(customSlots.filter(s => s.instrument !== inst));
  };

  const handleUpdateSlotCount = (inst: string, count: number) => {
    if (count < 1) return;
    setCustomSlots(customSlots.map(s => s.instrument === inst ? { ...s, maxCount: count } : s));
  };

  const toggleGenreSelection = (genre: string) => {
    if (newGenres.includes(genre)) {
      setNewGenres(newGenres.filter(g => g !== genre));
    } else {
      setNewGenres([...newGenres, genre]);
    }
  };

  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate || !newLocationName.trim()) {
      alert('Compila tutti i campi obbligatori per l\'evento!');
      return;
    }
    if (customSlots.length === 0) {
      alert('Aggiungi almeno uno strumento necessario alla jam!');
      return;
    }

    createEvent({
      title: newTitle.trim(),
      description: newDesc.trim(),
      type: newType,
      date: newDate,
      time: newTime,
      locationName: newLocationName.trim(),
      address: newAddress.trim(),
      city: newCity,
      genres: newGenres,
      slots: customSlots,
      setlist: newSetlist,
      equipmentNotes: newNotes.trim()
    });

    // Reset and close
    setIsCreateEventOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewDate('');
    setNewLocationName('');
    setNewSetlist([]);
  };

  // Filter events
  const filteredEvents = events.filter(e => {
    const matchesCity = selectedCity === 'all' || e.city.toLowerCase().includes(selectedCity.toLowerCase());
    const matchesType = selectedType === 'all' || e.type === selectedType;
    return matchesCity && matchesType;
  });

  return (
    <div>
      {/* Hero Banner */}
      <div className="section-hero">
        <div>
          <h1 className="section-hero-title">Organizza e Partecipa a Jam Session</h1>
          <p className="section-hero-desc">
            Trova jam aperte, prove di gruppo ed eventi dal vivo nella tua città. 
            Controlla gli strumenti mancanti e prenota il tuo slot per suonare insieme!
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            if (!currentMusician) {
              setIsAuthModalOpen(true);
            } else {
              setIsCreateEventOpen(true);
            }
          }}
          style={{ whiteSpace: 'nowrap', zIndex: 2 }}
        >
          <Plus size={18} />
          <span>Crea Nuova Jam</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <select
          className="filter-select"
          value={selectedCity}
          onChange={e => setSelectedCity(e.target.value)}
        >
          <option value="all">Tutte le Città</option>
          {CITY_OPTIONS.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
        >
          <option value="all">Tutti i Tipi di Evento</option>
          <option value="Jam Session">Jam Session</option>
          <option value="Prove di Gruppo">Prove di Gruppo</option>
          <option value="Live / Concerto">Live / Concerto</option>
          <option value="Aperitivo Musicale">Aperitivo Musicale</option>
          <option value="Workshop">Workshop</option>
        </select>

        {(selectedCity !== 'all' || selectedType !== 'all') && (
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => { setSelectedCity('all'); setSelectedType('all'); }}
          >
            Azzera Filtri
          </button>
        )}
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', padding: '48px 24px', textAlign: 'center', borderRadius: '16px', border: '1px dashed var(--border-subtle)' }}>
          <Calendar size={42} color="var(--accent-purple-light)" style={{ marginBottom: '12px', opacity: 0.7 }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '6px', color: '#fff' }}>Nessun evento in programma con questi filtri</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
            Sii tu il primo a proporre una jam o delle prove nella tua zona!
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => setIsCreateEventOpen(true)}>
            <Plus size={16} />
            <span>Crea un Evento</span>
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredEvents.map(event => {
            const organizer = musicians.find(m => m.id === event.organizerId) || {
              id: event.organizerId,
              name: 'Organizzatore BandMate',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
            };

            const isOrganizer = currentMusician ? currentMusician.id === event.organizerId : false;
            const totalRequired = event.slots.reduce((acc, s) => acc + s.maxCount, 0);
            const totalAssigned = event.slots.reduce((acc, s) => acc + s.assignedMusicians.length, 0);

            return (
              <div key={event.id} className="glass-card event-card">
                {/* Event Type & City badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="event-type-badge">{event.type}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} />
                    {event.city}
                  </span>
                </div>

                {/* Title */}
                <h2 className="event-title">{event.title}</h2>

                {/* Date, Time & Venue */}
                <div className="event-datetime-location">
                  <div className="event-detail-row">
                    <Calendar size={15} />
                    <span>{event.date} • Ore {event.time}</span>
                  </div>
                  <div className="event-detail-row">
                    <MapPin size={15} />
                    <span>{event.locationName} {event.address ? `(${event.address})` : ''}</span>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
                  {event.description}
                </p>

                {/* Genres */}
                <div className="genre-tags" style={{ marginBottom: '10px' }}>
                  {event.genres.map(g => (
                    <span key={g} className="genre-tag">{g}</span>
                  ))}
                </div>

                {/* Slots Section */}
                <div className="event-slots-section">
                  <div className="event-slots-title">
                    <span>Strumenti & Musicisti ({totalAssigned}/{totalRequired})</span>
                    <span style={{ fontSize: '0.72rem', color: totalAssigned === totalRequired ? 'var(--accent-emerald)' : '#fdba74' }}>
                      {totalAssigned === totalRequired ? 'Formazione al completo' : `${totalRequired - totalAssigned} posti liberi`}
                    </span>
                  </div>

                  <div className="slots-list">
                    {event.slots.map(slot => {
                      const isFull = slot.assignedMusicians.length >= slot.maxCount;
                      const userInThisSlot = currentMusician ? slot.assignedMusicians.some(m => m.musicianId === currentMusician.id) : false;

                      return (
                        <div key={slot.id} className={`slot-item ${isFull ? 'full' : ''}`}>
                          <div className="slot-instrument">
                            <Music size={14} color="var(--accent-purple-light)" />
                            <span>{slot.instrument}</span>
                            <span className={`slot-count-badge ${isFull ? 'full' : 'free'}`}>
                              {slot.assignedMusicians.length}/{slot.maxCount}
                            </span>
                          </div>

                          {/* Action button for this specific slot */}
                          <div className="slot-status-box">
                            {userInThisSlot ? (
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ borderColor: 'var(--accent-emerald)', color: '#34d399', fontSize: '0.74rem', padding: '3px 8px' }}
                                onClick={() => leaveEventSlot(event.id, slot.id)}
                                title="Clicca per rinunciare al tuo posto"
                              >
                                <CheckCircle2 size={13} />
                                <span>Iscritto (Esci)</span>
                              </button>
                            ) : !isFull ? (
                              <button
                                className="btn btn-outline-accent btn-sm"
                                style={{ fontSize: '0.74rem', padding: '3px 8px' }}
                                onClick={() => joinEventSlot(event.id, slot.id)}
                              >
                                <Plus size={13} />
                                <span>Unisciti</span>
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Completo</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Confirmed Musicians avatars */}
                  {totalAssigned > 0 && (
                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Partecipanti:</span>
                      {event.slots.flatMap(s => s.assignedMusicians).map((mus, idx) => (
                        <div
                          key={idx}
                          title={`${mus.musicianName}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            const found = musicians.find(m => m.id === mus.musicianId);
                            if (found) setSelectedMusicianForModal(found);
                          }}
                        >
                          <img
                            src={mus.musicianAvatar}
                            alt={mus.musicianName}
                            style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--accent-purple)' }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Equipment notes if any */}
                {event.equipmentNotes && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px', background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '6px' }}>
                    ℹ️ <em>{event.equipmentNotes}</em>
                  </div>
                )}

                {/* Scaletta & Brani Accordion */}
                {event.setlist && event.setlist.length > 0 && (
                  <div style={{ marginBottom: '14px', background: 'rgba(21, 29, 48, 0.6)', border: '1px solid var(--border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
                    <button
                      type="button"
                      onClick={() => setExpandedSetlists(prev => ({ ...prev, [event.id]: !prev[event.id] }))}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'transparent',
                        border: 'none',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        color: '#fff'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.88rem' }}>
                        <Disc3 size={16} color="var(--accent-purple-light)" />
                        <span>Scaletta Brani della Jam ({event.setlist.length})</span>
                      </div>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>
                        {expandedSetlists[event.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    </button>

                    {expandedSetlists[event.id] && (
                      <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {event.setlist.map((song, idx) => (
                          <div
                            key={song.id || idx}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid var(--border-subtle)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '8px'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ color: 'var(--accent-purple-light)', fontWeight: 700, fontSize: '0.85rem' }}>#{idx + 1}</span>
                                <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.92rem' }}>{song.title}</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>• {song.artist}</span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                                {song.bpm && (
                                  <span style={{ fontSize: '0.72rem', background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                                    🥁 {song.bpm} BPM
                                  </span>
                                )}
                                {song.key && (
                                  <span style={{ fontSize: '0.72rem', background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                                    🎼 {song.key}
                                  </span>
                                )}
                                {song.notes && (
                                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                    💬 {song.notes}
                                  </span>
                                )}
                              </div>
                            </div>

                            {song.tutorialUrl && (
                              <a
                                href={song.tutorialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline-accent btn-sm"
                                style={{ padding: '3px 8px', fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                title="Apri video tutorial o accordi"
                              >
                                <span>Tutorial</span>
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Band Candidate / Partecipanti */}
                <div style={{ marginBottom: '14px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: (event.appliedBands && event.appliedBands.length > 0) ? '10px' : '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Radio size={16} color="#fbbf24" />
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fef08a' }}>
                        Band Partecipanti / Candidate ({event.appliedBands?.length || 0})
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline-accent btn-sm"
                      style={{ padding: '4px 10px', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      onClick={() => {
                        if (!currentMusician) {
                          setIsAuthModalOpen(true);
                          return;
                        }
                        if (userBands.length === 0) {
                          alert('Non fai ancora parte di nessuna band. Crea prima la tua band nella scheda "Band" per poterla candidare!');
                          return;
                        }
                        setApplyingBandEventId(event.id);
                        setSelectedBandToApply(userBands[0].id);
                        setBandApplyMessage('');
                      }}
                    >
                      <Plus size={13} />
                      <span>Candida Band</span>
                    </button>
                  </div>

                  {event.appliedBands && event.appliedBands.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {event.appliedBands.map(applied => {
                        const isUserInThisBand = userBands.some(b => b.id === applied.bandId);
                        return (
                          <div
                            key={applied.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: 'rgba(21, 29, 48, 0.7)',
                              border: isUserInThisBand ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-subtle)',
                              padding: '8px 12px',
                              borderRadius: '8px'
                            }}
                          >
                            <div 
                              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1, minWidth: 0 }}
                              onClick={() => {
                                const found = bands.find(b => b.id === applied.bandId);
                                if (found) setSelectedBandForModal(found);
                              }}
                              title="Vedi scheda della band"
                            >
                              <img
                                src={applied.bandAvatar || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80'}
                                alt={applied.bandName}
                                style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', border: '1.5px solid #fbbf24' }}
                              />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>{applied.bandName}</span>
                                  {isUserInThisBand && (
                                    <span style={{ fontSize: '0.65rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fef08a', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                      La tua Band
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                  📍 {applied.city} • 👥 {applied.membersCount} membri
                                  {applied.message && <span> • <em>"{applied.message}"</em></span>}
                                </div>
                              </div>
                            </div>

                            {isUserInThisBand && (
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '3px 8px', fontSize: '0.72rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                                onClick={() => withdrawBandFromEvent(event.id, applied.bandId)}
                                title="Ritira candidatura della tua band"
                              >
                                Ritira
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Domande & Commenti Accordion */}
                <div style={{ marginBottom: '14px', background: 'rgba(21, 29, 48, 0.4)', border: '1px solid var(--border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setExpandedComments(prev => ({ ...prev, [event.id]: !prev[event.id] }))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'transparent',
                      border: 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      color: '#fff'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.86rem' }}>
                      <MessageSquare size={15} color="var(--accent-cyan)" />
                      <span>Domande & Commenti sull'Evento ({event.comments?.length || 0})</span>
                    </div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>
                      {expandedComments[event.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>

                  {expandedComments[event.id] && (
                    <div style={{ padding: '0 14px 14px' }}>
                      {event.comments && event.comments.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                          {event.comments.map(c => (
                            <div
                              key={c.id}
                              style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '8px',
                                padding: '8px 12px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <div 
                                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                  onClick={() => {
                                    const found = musicians.find(m => m.id === c.authorId);
                                    if (found) setSelectedMusicianForModal(found);
                                  }}
                                >
                                  <img
                                    src={c.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                                    alt={c.authorName}
                                    style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                                  />
                                  <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#fff' }}>{c.authorName}</span>
                                  {c.authorInstrument && (
                                    <span style={{ fontSize: '0.68rem', color: 'var(--accent-purple-light)', background: 'rgba(139, 92, 246, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                                      {c.authorInstrument}
                                    </span>
                                  )}
                                </div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                  {new Date(c.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p style={{ fontSize: '0.84rem', color: '#e2e8f0', margin: 0, lineHeight: 1.4 }}>
                                {c.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                          Nessuna domanda ancora. Hai dubbi sulla scaletta, strumentazione o orari? Scrivi qui sotto!
                        </p>
                      )}

                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const text = (commentInputs[event.id] || '').trim();
                          if (!text) return;
                          setIsSubmittingComment(prev => ({ ...prev, [event.id]: true }));
                          const success = await addEventComment(event.id, text);
                          if (success) {
                            setCommentInputs(prev => ({ ...prev, [event.id]: '' }));
                          }
                          setIsSubmittingComment(prev => ({ ...prev, [event.id]: false }));
                        }}
                        style={{ display: 'flex', gap: '8px' }}
                      >
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Fai una domanda all'organizzatore..."
                          value={commentInputs[event.id] || ''}
                          onChange={e => setCommentInputs({ ...commentInputs, [event.id]: e.target.value })}
                          style={{ fontSize: '0.82rem', padding: '6px 12px' }}
                        />
                        <button
                          type="submit"
                          className="btn btn-primary btn-sm"
                          disabled={isSubmittingComment[event.id] || !commentInputs[event.id]?.trim()}
                          style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Send size={13} />
                          <span>Invia</span>
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {/* Organizer Info & Footer */}
                <div className="card-footer">
                  <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                    onClick={() => {
                      const found = musicians.find(m => m.id === organizer.id);
                      if (found) setSelectedMusicianForModal(found);
                    }}
                  >
                    <img 
                      src={organizer.avatar} 
                      alt={organizer.name} 
                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} 
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Org. da <strong style={{ color: '#fff' }}>{organizer.name}</strong>
                    </span>
                  </div>

                  {isOrganizer && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-purple-light)', background: 'rgba(139, 92, 246, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                      Tuo Evento
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Creazione Evento */}
      {isCreateEventOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateEventOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div className="modal-title">Organizza una Jam o Evento</div>
              <button className="modal-close-btn" onClick={() => setIsCreateEventOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateEventSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Titolo dell'Evento *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="Es. Jam Funk & Groove del Venerdì Sera"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Tipo di Incontro *</label>
                    <select
                      className="form-select"
                      value={newType}
                      onChange={e => setNewType(e.target.value as EventType)}
                    >
                      <option value="Jam Session">Jam Session</option>
                      <option value="Prove di Gruppo">Prove di Gruppo</option>
                      <option value="Live / Concerto">Live / Concerto</option>
                      <option value="Aperitivo Musicale">Aperitivo Musicale</option>
                      <option value="Workshop">Workshop</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Città *</label>
                    <select
                      className="form-select"
                      value={newCity}
                      onChange={e => setNewCity(e.target.value)}
                    >
                      {CITY_OPTIONS.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Data *</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={newDate}
                      onChange={e => setNewDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Orario *</label>
                    <input
                      type="time"
                      className="form-input"
                      required
                      value={newTime}
                      onChange={e => setNewTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Nome Luogo / Sala Prove *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="Es. Rock Lab Studio - Sala 2"
                      value={newLocationName}
                      onChange={e => setNewLocationName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Indirizzo</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Es. Via Dante 15"
                      value={newAddress}
                      onChange={e => setNewAddress(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Descrizione dell'Incontro</label>
                  <textarea
                    rows={2}
                    className="form-textarea"
                    placeholder="Spiega il programma della serata, livello richiesto o cosa si suonerà..."
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                  />
                </div>

                {/* Generi dell'evento */}
                <div className="form-group">
                  <label className="form-label">Generi Musicali</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {GENRE_OPTIONS.slice(0, 10).map(genre => {
                      const isSelected = newGenres.includes(genre);
                      return (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => toggleGenreSelection(genre)}
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

                {/* Slot Strumenti cercati */}
                <div className="form-group">
                  <label className="form-label">Strumenti Ricercati & Posti Disponibili</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                    {customSlots.map(s => (
                      <div key={s.instrument} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize: '0.86rem', color: '#fff', fontWeight: 600 }}>{s.instrument}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Posti:</span>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={s.maxCount}
                            onChange={e => handleUpdateSlotCount(s.instrument, parseInt(e.target.value) || 1)}
                            style={{ width: '50px', padding: '2px 6px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: '#fff', borderRadius: '4px', textAlign: 'center' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomSlot(s.instrument)}
                            style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      className="form-select"
                      value={slotToAdd}
                      onChange={e => setSlotToAdd(e.target.value)}
                      style={{ flex: 1 }}
                    >
                      {INSTRUMENT_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleAddCustomSlot}
                    >
                      <Plus size={16} />
                      <span>Aggiungi Strumento</span>
                    </button>
                  </div>
                </div>

                {/* Scaletta Brani Form */}
                <div className="form-group" style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent-purple-light)', fontWeight: 700 }}>
                    <Disc3 size={18} />
                    <span>Scaletta Brani / Setlist della Jam (Opzionale)</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Aggiungi i brani che si suoneranno durante la jam, specificando tonalità, BPM e link tutorial se disponibili.
                  </p>

                  {newSetlist.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                      {newSetlist.map((song, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                          <div>
                            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>
                              {idx + 1}. {song.title} <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>- {song.artist}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', flexWrap: 'wrap' }}>
                              {song.key && <span style={{ color: 'var(--accent-cyan)' }}>🎼 {song.key}</span>}
                              {song.bpm && <span style={{ color: 'var(--accent-pink)' }}>🥁 {song.bpm} BPM</span>}
                              {song.tutorialUrl && <span style={{ color: 'var(--accent-purple-light)' }}>🎬 Tutorial</span>}
                              {song.notes && <span>💬 {song.notes}</span>}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSongFromSetlist(idx)}
                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                            title="Rimuovi brano"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Titolo Brano *"
                      value={songTitle}
                      onChange={e => setSongTitle(e.target.value)}
                      style={{ fontSize: '0.8rem' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Artista originale"
                      value={songArtist}
                      onChange={e => setSongArtist(e.target.value)}
                      style={{ fontSize: '0.8rem' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Tonalità (es. Lam, G)"
                      value={songKey}
                      onChange={e => setSongKey(e.target.value)}
                      style={{ fontSize: '0.8rem' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="BPM (es. 120)"
                      value={songBpm}
                      onChange={e => setSongBpm(e.target.value)}
                      style={{ fontSize: '0.8rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="Link video tutorial / YouTube (URL)"
                      value={songTutorialUrl}
                      onChange={e => setSongTutorialUrl(e.target.value)}
                      style={{ fontSize: '0.8rem' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Note di esecuzione..."
                      value={songNotes}
                      onChange={e => setSongNotes(e.target.value)}
                      style={{ fontSize: '0.8rem' }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-accent btn-sm"
                      onClick={handleAddSongToSetlist}
                      style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}
                    >
                      <Plus size={14} />
                      <span>Aggiungi</span>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Note su Strumentazione Presente</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Es. Batteria completa e ampli presenti, portare solo jack e piatti."
                    value={newNotes}
                    onChange={e => setNewNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateEventOpen(false)}>
                  Annulla
                </button>
                <button type="submit" className="btn btn-primary">
                  Pubblica Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Candidatura Band */}
      {applyingBandEventId && (
        <div className="modal-overlay modal-overlay-stacked" onClick={() => setApplyingBandEventId(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={18} color="var(--accent-purple-light)" />
                <div className="modal-title">Candida la tua Band</div>
              </div>
              <button className="modal-close-btn" onClick={() => setApplyingBandEventId(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!selectedBandToApply) return;
              const ok = await applyBandToEvent(applyingBandEventId, selectedBandToApply, bandApplyMessage);
              if (ok) {
                setApplyingBandEventId(null);
              }
            }}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Scegli quale delle tue band candidare *</label>
                  <select
                    className="form-select"
                    value={selectedBandToApply}
                    onChange={e => setSelectedBandToApply(e.target.value)}
                    required
                  >
                    {userBands.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city} • {b.members.length} componenti)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Messaggio / Proposta per l'organizzatore (Opzionale)</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Es. Siamo pronti con un set di 30 min inediti/cover rock, strumentazione nostra completa..."
                    value={bandApplyMessage}
                    onChange={e => setBandApplyMessage(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setApplyingBandEventId(null)}>
                  Annulla
                </button>
                <button type="submit" className="btn btn-primary">
                  Conferma Candidatura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

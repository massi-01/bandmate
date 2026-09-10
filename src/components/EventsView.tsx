import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  MapPin, 
  Plus, 
  Music, 
  CheckCircle2, 
  X
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
    setSelectedMusicianForModal,
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
      equipmentNotes: newNotes.trim()
    });

    // Reset and close
    setIsCreateEventOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewDate('');
    setNewLocationName('');
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
    </div>
  );
};

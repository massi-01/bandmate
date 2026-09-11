import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  MapPin, 
  Calendar, 
  Music, 
  Plus, 
  CheckCircle2, 
  ExternalLink, 
  Radio, 
  MessageSquare, 
  Send, 
  Disc3, 
  AlertTriangle
} from 'lucide-react';

export const EventDetailsModal: React.FC = () => {
  const { 
    events,
    selectedEventForModal, 
    setSelectedEventForModal, 
    currentMusician, 
    musicians, 
    bands,
    joinEventSlot, 
    leaveEventSlot, 
    applyBandToEvent, 
    withdrawBandFromEvent, 
    addEventComment,
    setSelectedMusicianForModal,
    setSelectedBandForModal,
    setIsAuthModalOpen
  } = useApp();

  // Dialog for instrument mismatch warning
  const [instrumentWarningSlot, setInstrumentWarningSlot] = useState<{ slotId: string; instrument: string } | null>(null);

  // Dialog for band application
  const [isApplyingBandOpen, setIsApplyingBandOpen] = useState(false);
  const [selectedBandToApply, setSelectedBandToApply] = useState<string>('');
  const [bandApplyMessage, setBandApplyMessage] = useState<string>('');

  // Comment input
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  if (!selectedEventForModal) return null;

  // Always sync with the latest event object from state if updated
  const event = events.find(e => e.id === selectedEventForModal.id) || selectedEventForModal;

  const organizer = musicians.find(m => m.id === event.organizerId) || {
    id: event.organizerId,
    name: 'Organizzatore BandMate',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  };

  const isOrganizer = currentMusician ? currentMusician.id === event.organizerId : false;
  const totalRequired = event.slots.reduce((acc, s) => acc + s.maxCount, 0);
  const totalAssigned = event.slots.reduce((acc, s) => acc + s.assignedMusicians.length, 0);

  const userBands = bands.filter(b => 
    currentMusician && (b.leaderId === currentMusician.id || b.members.some(m => m.musicianId === currentMusician.id))
  );

  const handleJoinClick = (slotId: string, instrument: string) => {
    if (!currentMusician) {
      setIsAuthModalOpen(true);
      return;
    }

    // Check if user has this instrument in profile
    const instClean = instrument.toLowerCase().trim();
    const hasInstrument = currentMusician.instruments.some(inst => {
      const nameClean = inst.name.toLowerCase().trim();
      return nameClean === instClean || instClean.includes(nameClean) || nameClean.includes(instClean);
    });

    if (!hasInstrument) {
      setInstrumentWarningSlot({ slotId, instrument });
      return;
    }

    joinEventSlot(event.id, slotId);
  };

  const handleConfirmWarningJoin = () => {
    if (instrumentWarningSlot) {
      joinEventSlot(event.id, instrumentWarningSlot.slotId);
      setInstrumentWarningSlot(null);
    }
  };

  const handleApplyBandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBandToApply) return;
    const ok = await applyBandToEvent(event.id, selectedBandToApply, bandApplyMessage);
    if (ok) {
      setIsApplyingBandOpen(false);
      setBandApplyMessage('');
    }
  };

  const handleAddCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    const ok = await addEventComment(event.id, commentText.trim());
    if (ok) {
      setCommentText('');
    }
    setIsSubmittingComment(false);
  };

  return (
    <div className="modal-overlay modal-overlay-stacked" onClick={() => setSelectedEventForModal(null)}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        
        {/* Header with gradient and close button */}
        <div style={{
          position: 'relative',
          padding: '24px 24px 20px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(6, 182, 212, 0.15) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          borderRadius: '16px 16px 0 0'
        }}>
          <button 
            className="modal-close-btn"
            onClick={() => setSelectedEventForModal(null)}
            style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}
            aria-label="Chiudi"
          >
            <X size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="event-type-badge">
              {event.type}
            </span>
            <span style={{ fontSize: '0.84rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} />
              {event.city}
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: '0 0 10px 0' }}>
            {event.title}
          </h1>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
              <Calendar size={15} color="var(--accent-purple-light)" />
              {event.date} • Ore {event.time}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
              <MapPin size={15} color="var(--accent-cyan)" />
              {event.locationName} {event.address ? `(${event.address})` : ''}
            </span>
          </div>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Organizer card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '12px 16px'
          }}>
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
              onClick={() => {
                const found = musicians.find(m => m.id === organizer.id);
                if (found) setSelectedMusicianForModal(found);
              }}
              title="Vedi profilo organizzatore"
            >
              <img
                src={organizer.avatar}
                alt={organizer.name}
                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-purple)' }}
              />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Evento organizzato da:</div>
                <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#fff' }}>{organizer.name}</div>
              </div>
            </div>

            {isOrganizer && (
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple-light)', background: 'rgba(139, 92, 246, 0.15)', padding: '3px 10px', borderRadius: '6px', fontWeight: 600 }}>
                Tuo Evento
              </span>
            )}
          </div>

          {/* Description & Genres */}
          <div>
            <h3 style={{ fontSize: '0.92rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Descrizione dell'Evento
            </h3>
            <p style={{ fontSize: '0.94rem', color: '#e2e8f0', lineHeight: 1.6, background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              {event.description}
            </p>

            {event.genres && event.genres.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                {event.genres.map(g => (
                  <span key={g} className="genre-tag">{g}</span>
                ))}
              </div>
            )}
          </div>

          {/* Equipment Notes */}
          {event.equipmentNotes && (
            <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)', padding: '12px 16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '2px' }}>
                ℹ️ Strumentazione & Note sulla Sala:
              </div>
              <div style={{ fontSize: '0.88rem', color: '#e2e8f0' }}>
                {event.equipmentNotes}
              </div>
            </div>
          )}

          {/* Instrument Slots Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Music size={18} color="var(--accent-purple-light)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                  Strumenti & Musicisti ({totalAssigned}/{totalRequired})
                </h3>
              </div>
              <span style={{ fontSize: '0.78rem', color: totalAssigned === totalRequired ? 'var(--accent-emerald)' : '#fdba74', fontWeight: 600 }}>
                {totalAssigned === totalRequired ? '✨ Formazione al completo' : `${totalRequired - totalAssigned} posti liberi`}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {event.slots.map(slot => {
                const isFull = slot.assignedMusicians.length >= slot.maxCount;
                const userInThisSlot = currentMusician ? slot.assignedMusicians.some(m => m.musicianId === currentMusician.id) : false;

                return (
                  <div key={slot.id} className={`slot-item ${isFull ? 'full' : ''}`} style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Music size={16} color="var(--accent-purple-light)" />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>{slot.instrument}</span>
                          <span className={`slot-count-badge ${isFull ? 'full' : 'free'}`}>
                            {slot.assignedMusicians.length}/{slot.maxCount}
                          </span>
                        </div>
                        {slot.assignedMusicians.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                            {slot.assignedMusicians.map(mus => (
                              <span 
                                key={mus.musicianId} 
                                onClick={() => {
                                  const found = musicians.find(m => m.id === mus.musicianId);
                                  if (found) setSelectedMusicianForModal(found);
                                }}
                                style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.1)', padding: '2px 8px', borderRadius: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                title="Vedi scheda musicista"
                              >
                                <img src={mus.musicianAvatar} alt={mus.musicianName} style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }} />
                                {mus.musicianName}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="slot-status-box">
                      {userInThisSlot ? (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ borderColor: 'var(--accent-emerald)', color: '#34d399', fontSize: '0.78rem', padding: '4px 10px' }}
                          onClick={() => leaveEventSlot(event.id, slot.id)}
                          title="Rinuncia al posto"
                        >
                          <CheckCircle2 size={14} />
                          <span>Iscritto (Esci)</span>
                        </button>
                      ) : !isFull ? (
                        <button
                          className="btn btn-outline-accent btn-sm"
                          style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                          onClick={() => handleJoinClick(slot.id, slot.instrument)}
                        >
                          <Plus size={14} />
                          <span>Unisciti</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completo</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scaletta & Brani della Jam */}
          {event.setlist && event.setlist.length > 0 && (
            <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Disc3 size={18} color="var(--accent-purple-light)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                  Scaletta & Brani della Jam ({event.setlist.length})
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {event.setlist.map((song, idx) => (
                  <div
                    key={song.id || idx}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(21, 29, 48, 0.7)',
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
                        <span style={{ color: 'var(--accent-purple-light)', fontWeight: 700, fontSize: '0.9rem' }}>#{idx + 1}</span>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.96rem' }}>{song.title}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}>• {song.artist}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                        {song.bpm && (
                          <span style={{ fontSize: '0.74rem', background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                            🥁 {song.bpm} BPM
                          </span>
                        )}
                        {song.key && (
                          <span style={{ fontSize: '0.74rem', background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                            🎼 {song.key}
                          </span>
                        )}
                        {song.notes && (
                          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
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
                        style={{ padding: '4px 10px', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        title="Apri tutorial brano"
                      >
                        <span>Tutorial</span>
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Band Candidate / Partecipanti */}
          <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={18} color="#fbbf24" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fef08a', margin: 0 }}>
                  Band Partecipanti / Candidate ({event.appliedBands?.length || 0})
                </h3>
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
                  setSelectedBandToApply(userBands[0].id);
                  setBandApplyMessage('');
                  setIsApplyingBandOpen(true);
                }}
              >
                <Plus size={13} />
                <span>Candida Band</span>
              </button>
            </div>

            {event.appliedBands && event.appliedBands.length > 0 ? (
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
                        padding: '10px 14px',
                        borderRadius: '8px'
                      }}
                    >
                      <div 
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1, minWidth: 0 }}
                        onClick={() => {
                          const found = bands.find(b => b.id === applied.bandId);
                          if (found) setSelectedBandForModal(found);
                        }}
                        title="Vedi scheda della band"
                      >
                        <img
                          src={applied.bandAvatar || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80'}
                          alt={applied.bandName}
                          style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1.5px solid #fbbf24' }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>{applied.bandName}</span>
                            {isUserInThisBand && (
                              <span style={{ fontSize: '0.65rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fef08a', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                La tua Band
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            📍 {applied.city} • 👥 {applied.membersCount} membri
                            {applied.message && <span> • <em>"{applied.message}"</em></span>}
                          </div>
                        </div>
                      </div>

                      {isUserInThisBand && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 10px', fontSize: '0.74rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
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
            ) : (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                Nessuna band ancora candidata per questa jam. Suoni in una band? Clicca su "Candida Band" per salire sul palco!
              </p>
            )}
          </div>

          {/* Domande & Commenti Section */}
          <div style={{ background: 'rgba(21, 29, 48, 0.4)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <MessageSquare size={18} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                Domande & Commenti sull'Evento ({event.comments?.length || 0})
              </h3>
            </div>

            {event.comments && event.comments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {event.comments.map(c => (
                  <div
                    key={c.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '10px 14px'
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
                          style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#fff' }}>{c.authorName}</span>
                        {c.authorInstrument && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--accent-purple-light)', background: 'rgba(139, 92, 246, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                            {c.authorInstrument}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {new Date(c.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: '#e2e8f0', margin: 0, lineHeight: 1.4 }}>
                      {c.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Nessuna domanda ancora. Hai dubbi sulla scaletta, strumentazione o orari? Scrivi qui sotto!
              </p>
            )}

            {/* Comment Form */}
            <form onSubmit={handleAddCommentSubmit} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Fai una domanda all'organizzatore..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                style={{ fontSize: '0.84rem' }}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={isSubmittingComment || !commentText.trim()}
                style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <Send size={14} />
                <span>Invia</span>
              </button>
            </form>
          </div>

        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setSelectedEventForModal(null)}>
            Chiudi Dettagli
          </button>
        </div>
      </div>

      {/* Sub-modal: Instrument mismatch warning */}
      {instrumentWarningSlot && (
        <div 
          className="modal-overlay" 
          style={{ zIndex: 1250, background: 'rgba(0, 0, 0, 0.85)' }}
          onClick={() => setInstrumentWarningSlot(null)}
        >
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header" style={{ borderBottomColor: 'rgba(245, 158, 11, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24' }}>
                <AlertTriangle size={20} />
                <div className="modal-title" style={{ color: '#fbbf24' }}>Avviso Strumento Profilo</div>
              </div>
              <button className="modal-close-btn" onClick={() => setInstrumentWarningSlot(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.94rem', color: '#e2e8f0', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                Attenzione: sul tuo profilo non è specificato che suoni <strong>{instrumentWarningSlot.instrument}</strong>.
              </p>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '14px' }}>
                I tuoi strumenti registrati: <br />
                {currentMusician?.instruments && currentMusician.instruments.length > 0 ? (
                  <strong style={{ color: 'var(--accent-purple-light)' }}>
                    {currentMusician.instruments.map(i => i.name).join(', ')}
                  </strong>
                ) : (
                  <em style={{ color: '#f87171' }}>Nessuno strumento registrato nel profilo</em>
                )}
              </div>

              <p style={{ fontSize: '0.88rem', color: '#cbd5e1', margin: 0 }}>
                Vuoi candidarti comunque per questo slot della jam?
              </p>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setInstrumentWarningSlot(null)}
              >
                Annulla
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleConfirmWarningJoin}
              >
                Sì, candidati comunque
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-modal: Apply Band */}
      {isApplyingBandOpen && (
        <div 
          className="modal-overlay" 
          style={{ zIndex: 1250, background: 'rgba(0, 0, 0, 0.85)' }}
          onClick={() => setIsApplyingBandOpen(false)}
        >
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={18} color="var(--accent-purple-light)" />
                <div className="modal-title">Candida la tua Band</div>
              </div>
              <button className="modal-close-btn" onClick={() => setIsApplyingBandOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApplyBandSubmit}>
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
                <button type="button" className="btn btn-secondary" onClick={() => setIsApplyingBandOpen(false)}>
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

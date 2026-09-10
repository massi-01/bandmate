import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  MapPin, 
  Users, 
  UserPlus, 
  Trash2, 
  Sparkles, 
  Plus, 
  LogOut,
  Crown,
  ChevronRight
} from 'lucide-react';
import { INSTRUMENT_OPTIONS } from '../data/mockData';

export const BandDetailsModal: React.FC = () => {
  const { 
    selectedBandForModal, 
    setSelectedBandForModal, 
    currentMusician, 
    musicians,
    setSelectedMusicianForModal,
    addBandMember,
    removeBandMember,
    deleteBand,
    updateBand,
    showNotification
  } = useApp();

  // Add Member State
  const [selectedMusicianId, setSelectedMusicianId] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Manage Looking For State
  const [newLookingForRole, setNewLookingForRole] = useState(INSTRUMENT_OPTIONS[0]);

  if (!selectedBandForModal) return null;

  const band = selectedBandForModal;
  const isLeader = currentMusician ? band.leaderId === currentMusician.id : false;

  // Available musicians to add (excluding those who are already members)
  const existingMemberIds = new Set(band.members.map(m => m.musicianId));
  const availableMusicians = musicians.filter(m => !existingMemberIds.has(m.id));

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMusicianId) {
      showNotification('Seleziona un musicista dalla lista', 'error');
      return;
    }
    if (!memberRole.trim()) {
      showNotification('Specifica il ruolo o strumento del componente', 'error');
      return;
    }

    const success = await addBandMember(band.id, selectedMusicianId, memberRole.trim());
    if (success) {
      setSelectedMusicianId('');
      setMemberRole('');
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (musicianId: string, musicianName: string) => {
    const isSelf = currentMusician?.id === musicianId;
    const confirmMsg = isSelf 
      ? 'Sei sicuro di voler lasciare questa band?' 
      : `Sei sicuro di voler rimuovere ${musicianName} dalla band?`;
    
    if (window.confirm(confirmMsg)) {
      await removeBandMember(band.id, musicianId);
    }
  };

  const handleDeleteBand = async () => {
    if (window.confirm(`Sei sicuro di voler eliminare definitivamente la band "${band.name}"?`)) {
      await deleteBand(band.id);
    }
  };

  const handleAddLookingFor = async () => {
    if (!newLookingForRole || band.lookingFor.includes(newLookingForRole)) return;
    const updated = [...band.lookingFor, newLookingForRole];
    await updateBand(band.id, { lookingFor: updated });
  };

  const handleRemoveLookingFor = async (role: string) => {
    const updated = band.lookingFor.filter(r => r !== role);
    await updateBand(band.id, { lookingFor: updated });
  };

  const handleViewMusician = (musicianId: string) => {
    const found = musicians.find(m => m.id === musicianId);
    if (found) {
      setSelectedMusicianForModal(found);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setSelectedBandForModal(null)}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        {/* Cover / Header */}
        <div style={{ position: 'relative' }}>
          <div style={{
            height: '180px',
            width: '100%',
            overflow: 'hidden',
            borderRadius: '16px 16px 0 0',
            position: 'relative'
          }}>
            <img 
              src={band.avatar} 
              alt={band.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.3) 60%, rgba(0,0,0,0.6) 100%)'
            }} />
          </div>

          {/* Close button */}
          <button 
            className="modal-close-btn"
            onClick={() => setSelectedBandForModal(null)}
            style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}
            aria-label="Chiudi"
          >
            <X size={20} />
          </button>

          {/* Band Title & City Header Info */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '24px',
            right: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="event-type-badge" style={{ background: 'rgba(139, 92, 246, 0.3)', borderColor: 'var(--accent-purple)' }}>
                  Band Musicale
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={13} />
                  {band.city}
                </span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                {band.name}
              </h1>
            </div>

            {/* Social Links */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {band.socialLinks?.instagram && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '8px' }}>
                  📸 {band.socialLinks.instagram}
                </span>
              )}
              {band.socialLinks?.spotify && (
                <span style={{ fontSize: '0.8rem', color: '#1db954', background: 'rgba(29, 185, 84, 0.1)', padding: '4px 10px', borderRadius: '8px' }}>
                  🎵 Spotify
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '24px' }}>
          {/* Genres */}
          <div className="genre-tags" style={{ marginBottom: '18px' }}>
            {band.genres.map(g => (
              <span key={g} className="genre-tag">{g}</span>
            ))}
          </div>

          {/* Bio */}
          {band.bio && (
            <div style={{ marginBottom: '22px' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
                Presentazione & Sound
              </div>
              <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {band.bio}
              </p>
            </div>
          )}

          {/* Posizioni Aperte / Recruiting */}
          <div style={{ 
            background: 'rgba(245, 158, 11, 0.08)', 
            border: '1px solid rgba(245, 158, 11, 0.25)', 
            borderRadius: '12px', 
            padding: '14px 16px', 
            marginBottom: '24px' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontWeight: 700, fontSize: '0.9rem' }}>
                <Sparkles size={16} />
                <span>Posizioni Aperte / Cerchiamo Componenti:</span>
              </div>

              {isLeader && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <select
                    className="form-select"
                    style={{ fontSize: '0.76rem', padding: '2px 8px', height: '28px' }}
                    value={newLookingForRole}
                    onChange={e => setNewLookingForRole(e.target.value)}
                  >
                    {INSTRUMENT_OPTIONS.map(i => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-outline-accent btn-sm"
                    style={{ padding: '2px 8px', fontSize: '0.76rem', height: '28px' }}
                    onClick={handleAddLookingFor}
                  >
                    <Plus size={12} />
                    <span>Aggiungi</span>
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {band.lookingFor && band.lookingFor.length > 0 ? (
                band.lookingFor.map(role => (
                  <span
                    key={role}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(245, 158, 11, 0.2)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      color: '#fef08a',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    🎸 {role}
                    {isLeader && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLookingFor(role)}
                        style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: 0 }}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.84rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ✨ Formazione al completo! Attualmente la band non cerca nuovi componenti.
                </span>
              )}
            </div>
          </div>

          {/* Lista Componenti (Membri) */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="var(--accent-purple-light)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#fff' }}>
                  Membri della Band ({band.members.length})
                </h3>
              </div>

              {isLeader && !isAddingMember && (
                <button
                  type="button"
                  className="btn btn-outline-accent btn-sm"
                  onClick={() => setIsAddingMember(true)}
                >
                  <UserPlus size={14} />
                  <span>Aggiungi Componente</span>
                </button>
              )}
            </div>

            {/* Form per aggiungere membro (solo leader) */}
            {isLeader && isAddingMember && (
              <form 
                onSubmit={handleAddMemberSubmit}
                style={{
                  background: 'rgba(139, 92, 246, 0.08)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-purple-light)' }}>
                    Recluta un Musicista della Piattaforma:
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingMember(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="form-row-2">
                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Scegli il Musicista *</label>
                    <select
                      className="form-select"
                      value={selectedMusicianId}
                      onChange={e => {
                        const mId = e.target.value;
                        setSelectedMusicianId(mId);
                        const m = musicians.find(mus => mus.id === mId);
                        if (m && !memberRole) {
                          setMemberRole(m.instruments[0]?.name || '');
                        }
                      }}
                      required
                    >
                      <option value="">-- Seleziona Musicista --</option>
                      {availableMusicians.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.city} • {m.instruments.map(i => i.name).join(', ')})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Ruolo / Strumento nella Band *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="es. Batteria, Basso, Chitarra Solista..."
                      value={memberRole}
                      onChange={e => setMemberRole(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setIsAddingMember(false)}
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                  >
                    <Plus size={14} />
                    <span>Conferma e Aggiungi</span>
                  </button>
                </div>
              </form>
            )}

            {/* Cards dei Membri */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {band.members.map(member => {
                const isThisMemberLeader = member.musicianId === band.leaderId;
                const isCurrent = currentMusician?.id === member.musicianId;

                return (
                  <div
                    key={member.musicianId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(21, 29, 48, 0.6)',
                      border: isThisMemberLeader ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div 
                      onClick={() => handleViewMusician(member.musicianId)}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1, minWidth: 0 }}
                      title="Clicca per visualizzare la scheda musicista"
                    >
                      <img
                        src={member.musicianAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                        alt={member.musicianName}
                        style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-purple)' }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#fff' }}>
                            {member.musicianName}
                          </span>
                          {isThisMemberLeader && (
                            <span 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '3px', 
                                background: 'rgba(234, 179, 8, 0.2)', 
                                color: '#facc15', 
                                fontSize: '0.68rem', 
                                padding: '2px 6px', 
                                borderRadius: '6px',
                                fontWeight: 700
                              }}
                            >
                              <Crown size={11} /> Leader
                            </span>
                          )}
                          {isCurrent && (
                            <span style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.15)', padding: '2px 6px', borderRadius: '6px' }}>
                              Tu
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-purple-light)', marginTop: '2px' }}>
                          🎵 {member.role}
                        </div>
                      </div>
                    </div>

                    {/* Actions on member */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                        onClick={() => handleViewMusician(member.musicianId)}
                        title="Vedi Profilo"
                      >
                        <span>Scheda</span>
                        <ChevronRight size={13} />
                      </button>

                      {/* Remove button if Leader (cannot remove self if only 1 member) or if Self leaving */}
                      {(isLeader && !isThisMemberLeader) && (
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#f87171',
                            padding: '4px 8px'
                          }}
                          onClick={() => handleRemoveMember(member.musicianId, member.musicianName)}
                          title="Rimuovi dalla band"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}

                      {/* If member is viewing and wants to leave */}
                      {(!isLeader && isCurrent) && (
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#f87171',
                            padding: '4px 8px'
                          }}
                          onClick={() => handleRemoveMember(member.musicianId, member.musicianName)}
                        >
                          <LogOut size={13} />
                          <span>Lascia Band</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leader Danger Zone */}
          {isLeader && (
            <div style={{
              marginTop: '28px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Area Gestione Leader
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  In qualità di fondatore puoi eliminare l'intera band.
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm"
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid var(--accent-red)',
                  color: 'var(--accent-red)'
                }}
                onClick={handleDeleteBand}
              >
                <Trash2 size={14} />
                <span>Elimina Band</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

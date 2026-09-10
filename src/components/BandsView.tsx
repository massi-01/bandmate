import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Radio, 
  Search, 
  MapPin, 
  Users, 
  Sparkles, 
  Plus, 
  ChevronRight, 
  Crown
} from 'lucide-react';
import { CITY_OPTIONS, GENRE_OPTIONS } from '../data/mockData';

export const BandsView: React.FC = () => {
  const { 
    bands, 
    currentMusician, 
    setIsAuthModalOpen, 
    setIsCreateBandOpen,
    setSelectedBandForModal 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [onlyLookingFor, setOnlyLookingFor] = useState(false);

  const filteredBands = useMemo(() => {
    return bands.filter(band => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        band.name.toLowerCase().includes(q) ||
        band.bio.toLowerCase().includes(q) ||
        band.genres.some(g => g.toLowerCase().includes(q)) ||
        band.members.some(m => m.musicianName.toLowerCase().includes(q) || m.role.toLowerCase().includes(q)) ||
        band.lookingFor.some(r => r.toLowerCase().includes(q));

      const matchesCity = 
        selectedCity === 'all' || 
        band.city.toLowerCase().includes(selectedCity.toLowerCase());

      const matchesGenre = 
        selectedGenre === 'all' || 
        band.genres.some(g => g.toLowerCase() === selectedGenre.toLowerCase());

      const matchesLookingFor = 
        !onlyLookingFor || (band.lookingFor && band.lookingFor.length > 0);

      return matchesSearch && matchesCity && matchesGenre && matchesLookingFor;
    });
  }, [bands, searchQuery, selectedCity, selectedGenre, onlyLookingFor]);

  const handleCreateBandClick = () => {
    if (!currentMusician) {
      setIsAuthModalOpen(true);
    } else {
      setIsCreateBandOpen(true);
    }
  };

  const totalRecruiting = bands.filter(b => b.lookingFor && b.lookingFor.length > 0).length;

  return (
    <div>
      {/* Hero Banner */}
      <div className="section-hero">
        <div>
          <h1 className="section-hero-title">Scopri, Crea e Unisciti alle Band</h1>
          <p className="section-hero-desc">
            Esplora le formazioni musicali della tua zona, scopri chi suona insieme o fonda la tua band 
            per reclutare nuovi membri e calcare i palchi dal vivo!
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleCreateBandClick}
          style={{ whiteSpace: 'nowrap', zIndex: 2 }}
        >
          <Plus size={18} />
          <span>Fonda Nuova Band</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-input-wrap">
          <Search size={18} className="filter-input-icon" />
          <input
            type="text"
            className="filter-input"
            placeholder="Cerca band per nome, genere, membro o strumento cercato..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

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
          value={selectedGenre}
          onChange={e => setSelectedGenre(e.target.value)}
        >
          <option value="all">Tutti i Generi</option>
          {GENRE_OPTIONS.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <label style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: onlyLookingFor ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
          border: onlyLookingFor ? '1px solid #f59e0b' : '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-full)',
          padding: '8px 14px',
          fontSize: '0.84rem',
          fontWeight: 600,
          color: onlyLookingFor ? '#fbbf24' : 'var(--text-secondary)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          userSelect: 'none'
        }}>
          <input
            type="checkbox"
            checked={onlyLookingFor}
            onChange={e => setOnlyLookingFor(e.target.checked)}
            style={{ accentColor: '#f59e0b' }}
          />
          <Sparkles size={14} />
          <span>Cercano Componenti ({totalRecruiting})</span>
        </label>
      </div>

      {/* Grid of Band Cards */}
      {filteredBands.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '64px 20px',
          background: 'rgba(21, 29, 48, 0.4)',
          borderRadius: '20px',
          border: '1px dashed var(--border-subtle)'
        }}>
          <div className="brand-icon" style={{ width: '56px', height: '56px', margin: '0 auto 16px', opacity: 0.8 }}>
            <Radio size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
            Nessuna band trovata
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '450px', margin: '0 auto 20px' }}>
            Nessun gruppo corrisponde ai criteri di ricerca selezionati. Sii il primo a fondare una band nella tua città!
          </p>
          <button
            className="btn btn-primary"
            onClick={handleCreateBandClick}
          >
            <Plus size={16} />
            <span>Fonda la Tua Band Ora</span>
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredBands.map(band => {
            const isUserLeader = currentMusician?.id === band.leaderId;

            return (
              <div 
                key={band.id} 
                className="glass-card band-card"
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                {/* Band Cover Header with City */}
                <div style={{ position: 'relative', height: '150px', margin: '-20px -20px 14px -20px', overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
                  <img 
                    src={band.avatar} 
                    alt={band.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(0,0,0,0.3) 100%)'
                  }} />
                  <span 
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'rgba(9, 12, 21, 0.85)',
                      backdropFilter: 'blur(8px)',
                      color: 'var(--accent-cyan)',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <MapPin size={12} />
                    {band.city}
                  </span>

                  {isUserLeader && (
                    <span 
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(234, 179, 8, 0.9)',
                        color: '#000',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Crown size={12} /> Tuo Gruppo
                    </span>
                  )}
                </div>

                {/* Band Name */}
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>
                  {band.name}
                </h2>

                {/* Genres */}
                <div className="genre-tags" style={{ marginBottom: '12px' }}>
                  {band.genres.slice(0, 3).map(g => (
                    <span key={g} className="genre-tag">{g}</span>
                  ))}
                  {band.genres.length > 3 && (
                    <span className="genre-tag">+{band.genres.length - 3}</span>
                  )}
                </div>

                {/* Bio snippet */}
                {band.bio && (
                  <p style={{
                    fontSize: '0.86rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    marginBottom: '14px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {band.bio}
                  </p>
                )}

                {/* Looking For Open Positions Badge */}
                {band.lookingFor && band.lookingFor.length > 0 && (
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '10px',
                    padding: '8px 10px',
                    marginBottom: '14px',
                    fontSize: '0.78rem',
                    color: '#fbbf24',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Sparkles size={14} style={{ flexShrink: 0 }} />
                    <span style={{ fontWeight: 700 }}>Cerchiamo:</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{band.lookingFor.join(', ')}</span>
                  </div>
                )}

                {/* Members Avatars Row */}
                <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {band.members.slice(0, 4).map((m, idx) => (
                        <img
                          key={m.musicianId}
                          src={m.musicianAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt={m.musicianName}
                          title={`${m.musicianName} (${m.role})`}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #131b2e',
                            marginLeft: idx > 0 ? '-8px' : 0,
                            zIndex: 4 - idx
                          }}
                        />
                      ))}
                      {band.members.length > 4 && (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'var(--accent-purple)',
                          color: '#fff',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: '-8px',
                          border: '2px solid #131b2e'
                        }}>
                          +{band.members.length - 4}
                        </div>
                      )}
                    </div>

                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {band.members.length} {band.members.length === 1 ? 'componente' : 'componenti'}
                    </span>
                  </div>
                </div>

                {/* Card Button */}
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setSelectedBandForModal(band)}
                >
                  <Users size={16} />
                  <span>Vedi Band & Membri</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

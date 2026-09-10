import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  MapPin, 
  Music, 
  Sparkles, 
  UserPlus, 
  Eye
} from 'lucide-react';
import { INSTRUMENT_OPTIONS, CITY_OPTIONS, GENRE_OPTIONS } from '../data/mockData';

export const MusiciansView: React.FC = () => {
  const { 
    musicians, 
    setSelectedMusicianForModal, 
    currentMusician, 
    setIsEditProfileOpen,
    setIsAuthModalOpen
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('all');

  const filteredMusicians = useMemo(() => {
    return musicians.filter(m => {
      // Search text matches name, bio, or username
      const matchesSearch = 
        searchQuery === '' ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.instruments.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

      // Instrument filter
      const matchesInstrument = 
        selectedInstrument === 'all' ||
        m.instruments.some(i => i.name.toLowerCase() === selectedInstrument.toLowerCase());

      // City filter
      const matchesCity = 
        selectedCity === 'all' || 
        m.city.toLowerCase().includes(selectedCity.toLowerCase());

      // Genre filter
      const matchesGenre = 
        selectedGenre === 'all' ||
        m.genres.some(g => g.toLowerCase() === selectedGenre.toLowerCase());

      return matchesSearch && matchesInstrument && matchesCity && matchesGenre;
    });
  }, [musicians, searchQuery, selectedInstrument, selectedCity, selectedGenre]);

  return (
    <div>
      {/* Banner di Benvenuto */}
      <div className="section-hero">
        <div>
          <h1 className="section-hero-title">Trova i Tuoi Compagni di Band</h1>
          <p className="section-hero-desc">
            Esplora profili di musicisti con informazioni verificate su strumenti, livello, città ed età. 
            Contattali per provare o creare il tuo prossimo progetto musicale.
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            if (!currentMusician) {
              setIsAuthModalOpen(true);
            } else {
              setIsEditProfileOpen(true);
            }
          }}
          style={{ whiteSpace: 'nowrap', zIndex: 2 }}
        >
          <UserPlus size={18} />
          <span>{currentMusician ? 'Modifica la tua Scheda' : 'Registrati / Crea Scheda'}</span>
        </button>
      </div>

      {/* Barra Filtri Avanzata */}
      <div className="filter-bar">
        <div className="filter-input-wrap">
          <Search size={18} className="filter-input-icon" />
          <input
            type="text"
            className="filter-input"
            placeholder="Cerca per nome, strumento, o parole chiave nella bio..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filtro Strumento */}
        <select
          className="filter-select"
          value={selectedInstrument}
          onChange={e => setSelectedInstrument(e.target.value)}
        >
          <option value="all">Tutti gli Strumenti</option>
          {INSTRUMENT_OPTIONS.map(inst => (
            <option key={inst} value={inst}>{inst}</option>
          ))}
        </select>

        {/* Filtro Città */}
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

        {/* Filtro Genere */}
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

        {(searchQuery || selectedInstrument !== 'all' || selectedCity !== 'all' || selectedGenre !== 'all') && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedInstrument('all');
              setSelectedCity('all');
              setSelectedGenre('all');
            }}
          >
            Azzera Filtri
          </button>
        )}
      </div>

      {/* Statistiche Risultati */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Trovati <strong style={{ color: '#fff' }}>{filteredMusicians.length}</strong> musicisti pronti a suonare
        </div>
      </div>

      {/* Grid delle schede musicisti */}
      {filteredMusicians.length === 0 ? (
        <div 
          style={{
            background: 'var(--bg-card)',
            padding: '48px 24px',
            textAlign: 'center',
            borderRadius: '16px',
            border: '1px dashed var(--border-subtle)'
          }}
        >
          <Music size={42} color="var(--accent-purple-light)" style={{ marginBottom: '12px', opacity: 0.7 }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '6px', color: '#fff' }}>Nessun musicista corrisponde ai filtri</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 16px' }}>
            Prova ad allargare la ricerca o a rimuovere i filtri di strumento e città.
          </p>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedInstrument('all');
              setSelectedCity('all');
              setSelectedGenre('all');
            }}
          >
            Mostra tutti i musicisti
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredMusicians.map(m => {
            const isSelf = currentMusician ? m.id === currentMusician.id : false;

            return (
              <div key={m.id} className="glass-card">
                {/* Header Scheda: Avatar, Nome, Età, Sesso, Provenienza */}
                <div className="musician-card-header">
                  <img
                    src={m.avatar}
                    alt={m.name}
                    className="musician-avatar"
                  />
                  <div className="musician-meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h2 className="musician-name">{m.name}</h2>
                      {isSelf && (
                        <span style={{ fontSize: '0.68rem', background: 'var(--accent-purple)', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          Tu
                        </span>
                      )}
                    </div>

                    {/* Informazioni Personali: Età e Sesso */}
                    <div className="musician-personal-info">
                      <span>{m.age} anni</span>
                      <span className="info-bullet">•</span>
                      <span>{m.gender}</span>
                    </div>

                    {/* Provenienza */}
                    <div className="musician-location">
                      <MapPin size={13} />
                      <span>{m.city}</span>
                    </div>
                  </div>
                </div>

                {/* Strumenti Suonati */}
                <div style={{ marginBottom: '6px' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                    Strumenti
                  </div>
                  <div className="badge-container">
                    {m.instruments.map(inst => (
                      <span
                        key={inst.name}
                        className={`instrument-badge ${inst.isPrimary ? 'primary' : 'secondary'}`}
                      >
                        <Music size={12} />
                        <span>{inst.name}</span>
                        <span className="level-tag">({inst.level})</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Generi */}
                <div className="genre-tags">
                  {m.genres.slice(0, 3).map(genre => (
                    <span key={genre} className="genre-tag">{genre}</span>
                  ))}
                  {m.genres.length > 3 && (
                    <span className="genre-tag">+{m.genres.length - 3}</span>
                  )}
                </div>

                {/* Bio Snippet */}
                <p className="musician-bio">{m.bio}</p>

                {/* Footer: Stato Disponibilità e Pulsante Dettaglio */}
                <div className="card-footer">
                  <span className={`availability-pill ${m.availability.includes('Jam') || m.availability.includes('live') ? 'active' : 'seeking'}`}>
                    <Sparkles size={12} />
                    <span>{m.availability}</span>
                  </span>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedMusicianForModal(m)}
                  >
                    <Eye size={14} />
                    <span>Vedi Profilo</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

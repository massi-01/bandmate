import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Lock, 
  Mail, 
  Plus, 
  Trash2, 
  LogIn, 
  UserPlus, 
  AlertCircle
} from 'lucide-react';
import { INSTRUMENT_OPTIONS, GENRE_OPTIONS, CITY_OPTIONS } from '../data/mockData';
import type { Gender, SkillLevel, AvailabilityStatus, InstrumentItem } from '../types';
import { authApi } from '../services/api';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    login, 
    register, 
    showNotification 
  } = useApp();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Demo accounts
  const [demoAccounts, setDemoAccounts] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthModalOpen) {
      setErrorMessage(null);
      authApi.getDemoAccounts().then(res => {
        setDemoAccounts(res.demoAccounts);
      }).catch(() => {});
    }
  }, [isAuthModalOpen]);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [regName, setRegName] = useState('');
  const [regAge, setRegAge] = useState<number>(24);
  const [regGender, setRegGender] = useState<Gender>('Uomo');
  const [regCity, setRegCity] = useState(CITY_OPTIONS[0]);
  const [regBio, setRegBio] = useState('');
  const [regAvailability, setRegAvailability] = useState<AvailabilityStatus>('Disponibile per Jam');
  const [regExperienceYears, setRegExperienceYears] = useState<number>(5);
  const [regContact, setRegContact] = useState('');
  const [regGenres, setRegGenres] = useState<string[]>(['Rock', 'Blues']);

  // Register instruments list
  const [regInstruments, setRegInstruments] = useState<InstrumentItem[]>([
    { name: 'Chitarra Elettrica', level: 'Intermedio', isPrimary: true }
  ]);
  const [newInstName, setNewInstName] = useState(INSTRUMENT_OPTIONS[1]);
  const [newInstLevel, setNewInstLevel] = useState<SkillLevel>('Intermedio');

  const addRegisterInstrument = () => {
    if (regInstruments.some(i => i.name === newInstName)) return;
    setRegInstruments([
      ...regInstruments,
      { name: newInstName, level: newInstLevel, isPrimary: regInstruments.length === 0 }
    ]);
  };

  const removeRegisterInstrument = (name: string) => {
    const remaining = regInstruments.filter(i => i.name !== name);
    if (remaining.length > 0 && !remaining.some(i => i.isPrimary)) {
      remaining[0].isPrimary = true;
    }
    setRegInstruments(remaining);
  };

  const toggleRegisterGenre = (genre: string) => {
    if (regGenres.includes(genre)) {
      setRegGenres(regGenres.filter(g => g !== genre));
    } else {
      setRegGenres([...regGenres, genre]);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    try {
      await login(loginEmail.trim(), loginPassword);
      setIsAuthModalOpen(false);
      showNotification('Accesso effettuato con successo!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Errore durante il login.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (email: string) => {
    setErrorMessage(null);
    setLoading(true);
    try {
      await login(email, 'password123');
      setIsAuthModalOpen(false);
      showNotification('Accesso demo effettuato con successo!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Errore durante il login demo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (regPassword !== regPasswordConfirm) {
      setErrorMessage('Le due password inserite non coincidono.');
      return;
    }

    if (regInstruments.length === 0) {
      setErrorMessage('Aggiungi almeno uno strumento suonato al tuo profilo.');
      return;
    }

    setLoading(true);
    try {
      await register({
        email: regEmail.trim(),
        password: regPassword,
        name: regName.trim(),
        age: regAge,
        gender: regGender,
        city: regCity,
        instruments: regInstruments,
        genres: regGenres,
        bio: regBio.trim(),
        availability: regAvailability,
        experienceYears: regExperienceYears,
        phoneOrContact: regContact.trim() || regEmail.trim()
      });
      setIsAuthModalOpen(false);
      showNotification('Benvenuto su BandMate! Profilo creato con successo.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Errore durante la registrazione.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsAuthModalOpen(false)}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: authMode === 'register' ? '680px' : '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="brand-icon" style={{ width: '28px', height: '28px', borderRadius: '8px' }}>
              <Lock size={15} />
            </div>
            <div className="modal-title">
              {authMode === 'login' ? 'Accedi a BandMate' : 'Registrati come Musicista'}
            </div>
          </div>
          <button className="modal-close-btn" onClick={() => setIsAuthModalOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Switch Tab: Login vs Register */}
        <div style={{ padding: '16px 24px 0', display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className={`btn btn-sm ${authMode === 'login' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => { setAuthMode('login'); setErrorMessage(null); }}
          >
            <LogIn size={15} />
            <span>Accedi</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${authMode === 'register' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => { setAuthMode('register'); setErrorMessage(null); }}
          >
            <UserPlus size={15} />
            <span>Crea Nuovo Account</span>
          </button>
        </div>

        {errorMessage && (
          <div style={{ margin: '14px 24px 0', padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--accent-red)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {authMode === 'login' ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                    required
                    placeholder="tua.email@esempio.it"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', marginTop: '8px' }}
              >
                {loading ? 'Accesso in corso...' : 'Accedi al tuo Profilo'}
              </button>

              {/* Demo Accounts section */}
              {demoAccounts.length > 0 && (
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '10px' }}>
                    Oppure prova con 1-Click con un profilo demo:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {demoAccounts.slice(0, 3).map(acc => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => handleDemoLogin(acc.email)}
                        className="btn btn-secondary btn-sm"
                        style={{ justifyContent: 'flex-start', padding: '6px 10px', gap: '10px' }}
                      >
                        <img 
                          src={acc.avatar} 
                          alt={acc.name} 
                          style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                        <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                          <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.84rem' }}>{acc.name}</span>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginLeft: '8px' }}>({acc.role})</span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--accent-purple-light)', fontWeight: 600 }}>Prova ➜</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegisterSubmit}>
            <div className="modal-body">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Crea il tuo account e la tua scheda profilo per comparire tra i musicisti della community e partecipare alle jam session.
              </div>

              {/* Credenziali */}
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    required
                    placeholder="tua.email@esempio.it"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password * (min. 6 caratteri)</label>
                  <input
                    type="password"
                    className="form-input"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Conferma Password *</label>
                <input
                  type="password"
                  className="form-input"
                  required
                  placeholder="••••••••"
                  value={regPasswordConfirm}
                  onChange={e => setRegPasswordConfirm(e.target.value)}
                />
              </div>

              {/* Dati Personali Richiesti: Nome, Età, Sesso, Provenienza */}
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Nome Completo *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="Es. Marco Rossi"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
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
                    value={regAge}
                    onChange={e => setRegAge(parseInt(e.target.value) || 18)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sesso *</label>
                  <select
                    className="form-select"
                    value={regGender}
                    onChange={e => setRegGender(e.target.value as Gender)}
                  >
                    <option value="Uomo">Uomo</option>
                    <option value="Donna">Donna</option>
                    <option value="Non binario">Non binario</option>
                    <option value="Preferisco non specificare">Preferisco non specificare</option>
                  </select>
                </div>
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Provenienza (Città) *</label>
                  <select
                    className="form-select"
                    value={regCity}
                    onChange={e => setRegCity(e.target.value)}
                  >
                    {CITY_OPTIONS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Disponibilità</label>
                  <select
                    className="form-select"
                    value={regAvailability}
                    onChange={e => setRegAvailability(e.target.value as AvailabilityStatus)}
                  >
                    <option value="Disponibile per Jam">Disponibile per Jam</option>
                    <option value="Cerco Band fissa">Cerco Band fissa</option>
                    <option value="Disponibile per serate/live">Disponibile per serate/live</option>
                    <option value="Solo per divertimento">Solo per divertimento</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Anni di Esperienza</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    className="form-input"
                    value={regExperienceYears}
                    onChange={e => setRegExperienceYears(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Strumenti Suonati */}
              <div className="form-group">
                <label className="form-label">Strumenti Suonati & Livello *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                  {regInstruments.map(inst => (
                    <div
                      key={inst.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: inst.isPrimary ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: inst.isPrimary ? '1px solid var(--accent-purple)' : '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.86rem' }}>{inst.name}</span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>({inst.level})</span>
                        {inst.isPrimary && (
                          <span style={{ fontSize: '0.68rem', background: 'var(--accent-purple)', color: '#fff', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                            Principale
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRegisterInstrument(inst.name)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <select
                    className="form-select"
                    style={{ flex: 2 }}
                    value={newInstName}
                    onChange={e => setNewInstName(e.target.value)}
                  >
                    {INSTRUMENT_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <select
                    className="form-select"
                    style={{ flex: 1.5 }}
                    value={newInstLevel}
                    onChange={e => setNewInstLevel(e.target.value as SkillLevel)}
                  >
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzato">Avanzato</option>
                    <option value="Professionista">Professionista</option>
                  </select>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={addRegisterInstrument}
                  >
                    <Plus size={16} />
                    <span>Aggiungi</span>
                  </button>
                </div>
              </div>

              {/* Generi */}
              <div className="form-group">
                <label className="form-label">Generi Musicali</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {GENRE_OPTIONS.slice(0, 10).map(g => {
                    const isSelected = regGenres.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleRegisterGenre(g)}
                        style={{
                          background: isSelected ? 'rgba(249, 115, 22, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                          color: isSelected ? '#fdba74' : 'var(--text-secondary)',
                          border: isSelected ? '1px solid #f97316' : '1px solid var(--border-subtle)',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '0.76rem',
                          cursor: 'pointer'
                        }}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bio & Contatto */}
              <div className="form-group">
                <label className="form-label">Bio (Presentati alla community)</label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  placeholder="Qualche riga su cosa suoni, influenze e che progetti cerchi..."
                  value={regBio}
                  onChange={e => setRegBio(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contatto Pubblico (Email o Social per essere ricontattato)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Es. nome@email.it oppure @tuo_profilo"
                  value={regContact}
                  onChange={e => setRegContact(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', marginTop: '6px' }}
              >
                {loading ? 'Creazione profilo...' : 'Completa Registrazione & Entra in BandMate'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

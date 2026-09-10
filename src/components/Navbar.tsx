import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Music, 
  Users, 
  Calendar, 
  MessageSquare, 
  ChevronDown, 
  Edit3, 
  LogIn,
  LogOut,
  UserCheck
} from 'lucide-react';
import { authApi } from '../services/api';

export const Navbar: React.FC = () => {
  const { 
    currentMusician, 
    currentUser,
    isAuthenticated,
    login,
    logout,
    activeTab, 
    setActiveTab, 
    setIsEditProfileOpen,
    setIsAuthModalOpen,
    showNotification
  } = useApp();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const primaryInstrument = currentMusician?.instruments?.find(i => i.isPrimary) || currentMusician?.instruments?.[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    authApi.getDemoAccounts().then(res => {
      setDemoAccounts(res.demoAccounts);
    }).catch(() => {});
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand-logo" onClick={() => setActiveTab('musicians')}>
          <div className="brand-icon">
            <Music size={22} strokeWidth={2.5} />
          </div>
          <div>
            <div className="brand-text">BandMate</div>
            <div className="brand-tagline">Musicians Network</div>
          </div>
        </div>

        {/* Central Nav Tabs */}
        <nav className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === 'musicians' ? 'active' : ''}`}
            onClick={() => setActiveTab('musicians')}
          >
            <Users size={18} />
            <span>Musicisti</span>
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <Calendar size={18} />
            <span>Eventi & Jam</span>
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            <MessageSquare size={18} />
            <span>Bacheca Annunci</span>
          </button>
        </nav>

        {/* Auth / Profile Actions */}
        <div className="nav-actions" ref={dropdownRef} style={{ position: 'relative' }}>
          {isAuthenticated && currentMusician ? (
            <>
              <button 
                className="user-pill-btn" 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                title="Gestisci profilo o cambia account"
              >
                <img 
                  src={currentMusician.avatar} 
                  alt={currentMusician.name} 
                  className="user-avatar-sm" 
                />
                <div className="user-pill-info">
                  <div className="user-pill-name">{currentMusician.name}</div>
                  <div className="user-pill-role">{primaryInstrument?.name || 'Musicista'}</div>
                </div>
                <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
              </button>

              {dropdownOpen && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '115%',
                    right: 0,
                    width: '290px',
                    background: '#131b2e',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '16px',
                    padding: '12px',
                    boxShadow: '0 16px 36px rgba(0, 0, 0, 0.6)',
                    zIndex: 100,
                    animation: 'slideUp 0.15s ease-out'
                  }}
                >
                  <div style={{ padding: '6px 8px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                      Account Attivo
                    </div>
                    <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                      {currentMusician.name}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                      {currentUser?.email}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--accent-cyan)', marginTop: '2px' }}>
                      📍 {currentMusician.city} • {currentMusician.age} anni
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '6px' }}
                      onClick={() => {
                        setDropdownOpen(false);
                        setIsEditProfileOpen(true);
                      }}
                    >
                      <Edit3 size={15} color="var(--accent-purple-light)" />
                      <span>Modifica Mio Profilo</span>
                    </button>
                  </div>

                  {/* Quick Switch between demo accounts */}
                  <div style={{ padding: '8px 4px 4px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '6px' }}>
                      Cambia Persona Demo:
                    </div>
                    <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {demoAccounts.map(acc => {
                        const isCurrent = currentUser?.email === acc.email;
                        return (
                          <div
                            key={acc.email}
                            onClick={async () => {
                              if (isCurrent) return;
                              setDropdownOpen(false);
                              await login(acc.email, 'password123');
                              showNotification(`Accesso effettuato come ${acc.name}`, 'info');
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '6px 8px',
                              borderRadius: '8px',
                              cursor: isCurrent ? 'default' : 'pointer',
                              background: isCurrent ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                              border: isCurrent ? '1px solid var(--accent-purple)' : '1px solid transparent',
                              transition: 'background 0.15s ease'
                            }}
                          >
                            <img 
                              src={acc.avatar} 
                              alt={acc.name} 
                              style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} 
                            />
                            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: isCurrent ? '#fff' : 'var(--text-secondary)' }}>
                                {acc.name}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                {acc.role}
                              </div>
                            </div>
                            {isCurrent && <UserCheck size={15} color="var(--accent-purple-light)" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Logout */}
                  <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', marginTop: '4px' }}>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-red)',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        width: '100%',
                        padding: '6px 8px',
                        fontWeight: 600
                      }}
                    >
                      <LogOut size={15} />
                      <span>Disconnetti (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <button 
              className="btn btn-primary btn-sm auth-btn"
              onClick={() => setIsAuthModalOpen(true)}
            >
              <LogIn size={15} />
              <span className="auth-btn-text-desktop">Accedi / Registrati</span>
              <span className="auth-btn-text-mobile">Accedi</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

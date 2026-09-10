import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { MusiciansView } from './components/MusiciansView';
import { BandsView } from './components/BandsView';
import { EventsView } from './components/EventsView';
import { FeedView } from './components/FeedView';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { BandDetailsModal } from './components/BandDetailsModal';
import { CreateBandModal } from './components/CreateBandModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Music, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeTab, notification, musicians, bands, events, posts } = useApp();

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        {activeTab === 'musicians' && <MusiciansView />}
        {activeTab === 'bands' && <BandsView />}
        {activeTab === 'events' && <EventsView />}
        {activeTab === 'feed' && <FeedView />}
      </main>

      <MobileBottomNav />
      <BandDetailsModal />
      <CreateBandModal />
      <ProfileModal />
      <AuthModal />

      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          {notification.type === 'success' && <CheckCircle size={20} color="#34d399" />}
          {notification.type === 'info' && <Info size={20} color="#38bdf8" />}
          {notification.type === 'error' && <AlertTriangle size={20} color="#f87171" />}
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{notification.message}</span>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        padding: '32px 24px',
        background: 'rgba(9, 12, 21, 0.9)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="brand-icon" style={{ width: '28px', height: '28px', borderRadius: '8px' }}>
              <Music size={16} />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>
              BandMate
            </span>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span>🎸 <strong>{musicians.length}</strong> Musicisti Iscritti</span>
            <span>📻 <strong>{bands.length}</strong> Band Attive</span>
            <span>⚡ <strong>{events.length}</strong> Jam & Eventi</span>
            <span>💬 <strong>{posts.length}</strong> Annunci Bacheca</span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            BandMate • Connetti musicisti, trova band e suona dal vivo nella tua città. Realizzato per musicisti appassionati.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

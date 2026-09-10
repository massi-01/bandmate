import React from 'react';
import { useApp } from '../context/AppContext';
import { Users, Calendar, MessageSquare } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  return (
    <nav className="mobile-bottom-nav" aria-label="Navigazione mobile">
      <button
        type="button"
        className={`mobile-nav-btn ${activeTab === 'musicians' ? 'active' : ''}`}
        onClick={() => setActiveTab('musicians')}
      >
        <Users size={20} />
        <span>Musicisti</span>
      </button>

      <button
        type="button"
        className={`mobile-nav-btn ${activeTab === 'events' ? 'active' : ''}`}
        onClick={() => setActiveTab('events')}
      >
        <Calendar size={20} />
        <span>Eventi & Jam</span>
      </button>

      <button
        type="button"
        className={`mobile-nav-btn ${activeTab === 'feed' ? 'active' : ''}`}
        onClick={() => setActiveTab('feed')}
      >
        <MessageSquare size={20} />
        <span>Bacheca</span>
      </button>
    </nav>
  );
};

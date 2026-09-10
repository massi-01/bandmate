import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  MusicianProfile,
  JamEvent,
  Post,
  ActiveTab
} from '../types';
import { 
  authApi, 
  musiciansApi, 
  eventsApi, 
  postsApi, 
  getAuthToken, 
  setAuthToken 
} from '../services/api';

interface AppContextType {
  // Auth state
  currentUser: { id: string; email: string } | null;
  currentMusician: MusicianProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Data
  musicians: MusicianProfile[];
  refreshMusicians: () => Promise<void>;
  updateCurrentProfile: (data: Partial<MusicianProfile>) => Promise<void>;

  events: JamEvent[];
  refreshEvents: () => Promise<void>;
  createEvent: (eventData: any) => Promise<void>;
  joinEventSlot: (eventId: string, slotId: string) => Promise<boolean>;
  leaveEventSlot: (eventId: string, slotId: string) => Promise<void>;

  posts: Post[];
  refreshPosts: () => Promise<void>;
  createPost: (postData: any) => Promise<void>;
  togglePostLike: (postId: string) => Promise<void>;
  addPostComment: (postId: string, content: string) => Promise<void>;

  // Navigation & UI state
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  selectedMusicianForModal: MusicianProfile | null;
  setSelectedMusicianForModal: (m: MusicianProfile | null) => void;
  isEditProfileOpen: boolean;
  setIsEditProfileOpen: (open: boolean) => void;
  isCreateEventOpen: boolean;
  setIsCreateEventOpen: (open: boolean) => void;
  isCreatePostOpen: boolean;
  setIsCreatePostOpen: (open: boolean) => void;

  notification: { message: string; type: 'success' | 'info' | 'error' } | null;
  showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
  const [currentMusician, setCurrentMusician] = useState<MusicianProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [musicians, setMusicians] = useState<MusicianProfile[]>([]);
  const [events, setEvents] = useState<JamEvent[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('musicians');
  const [selectedMusicianForModal, setSelectedMusicianForModal] = useState<MusicianProfile | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // 1. Data Refreshers
  const refreshMusicians = useCallback(async () => {
    try {
      const data = await musiciansApi.getAll();
      setMusicians(data);
    } catch (err: any) {
      console.error('Failed to load musicians:', err);
    }
  }, []);

  const refreshEvents = useCallback(async () => {
    try {
      const data = await eventsApi.getAll();
      setEvents(data);
    } catch (err: any) {
      console.error('Failed to load events:', err);
    }
  }, []);

  const refreshPosts = useCallback(async () => {
    try {
      const data = await postsApi.getAll();
      setPosts(data);
    } catch (err: any) {
      console.error('Failed to load posts:', err);
    }
  }, []);

  // 2. Initial Auth & Data Load
  useEffect(() => {
    // Initial fetch of data from SQLite backend API
    refreshMusicians();
    refreshEvents();
    refreshPosts();

    // Check token
    const token = getAuthToken();
    if (token) {
      authApi.getMe()
        .then(res => {
          setCurrentUser(res.user);
          setCurrentMusician(res.musician);
        })
        .catch(() => {
          setAuthToken(null);
          setCurrentUser(null);
          setCurrentMusician(null);
        });
    } else {
      // If not logged in on first load, auto-login as Davide demo for frictionless immediate preview
      authApi.login({ email: 'davide@bandmate.it', password: 'password123' })
        .then(res => {
          setCurrentUser(res.user);
          setCurrentMusician(res.musician);
        })
        .catch(() => {});
    }
  }, [refreshMusicians, refreshEvents, refreshPosts]);

  // 3. Auth Actions
  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    setCurrentUser(res.user);
    setCurrentMusician(res.musician);
    await refreshMusicians();
  };

  const register = async (payload: any) => {
    const res = await authApi.register(payload);
    setCurrentUser(res.user);
    setCurrentMusician(res.musician);
    await refreshMusicians();
  };

  const logout = async () => {
    await authApi.logout();
    setCurrentUser(null);
    setCurrentMusician(null);
    showNotification('Disconnessione effettuata.', 'info');
  };

  // 4. Musician Profile Update
  const updateCurrentProfile = async (data: Partial<MusicianProfile>) => {
    if (!currentMusician) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const updated = await musiciansApi.update(currentMusician.id, data);
      setCurrentMusician(updated);
      setMusicians(prev => prev.map(m => m.id === updated.id ? updated : m));
      showNotification('Profilo aggiornato con successo nel database!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Errore durante l\'aggiornamento del profilo', 'error');
    }
  };

  // 5. Events actions
  const createEvent = async (eventData: any) => {
    if (!currentMusician) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const newEvent = await eventsApi.create(eventData);
      setEvents(prev => [newEvent, ...prev]);
      showNotification('Evento salvato nel database con successo!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Errore durante la creazione dell\'evento', 'error');
    }
  };

  const joinEventSlot = async (eventId: string, slotId: string): Promise<boolean> => {
    if (!currentMusician) {
      showNotification('Accedi o registrati per unirti a una jam!', 'info');
      setIsAuthModalOpen(true);
      return false;
    }
    try {
      const updatedEvent = await eventsApi.joinSlot(eventId, slotId);
      setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
      showNotification('Ti sei unito alla jam session!', 'success');
      return true;
    } catch (err: any) {
      showNotification(err.message || 'Impossibile unirsi allo slot', 'error');
      return false;
    }
  };

  const leaveEventSlot = async (eventId: string, slotId: string) => {
    if (!currentMusician) return;
    try {
      const updatedEvent = await eventsApi.leaveSlot(eventId, slotId);
      setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
      showNotification('Hai liberato il tuo posto nella jam.', 'info');
    } catch (err: any) {
      showNotification(err.message || 'Errore nel liberare il posto', 'error');
    }
  };

  // 6. Posts actions
  const createPost = async (postData: any) => {
    if (!currentMusician) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const newPost = await postsApi.create(postData);
      setPosts(prev => [newPost, ...prev]);
      showNotification('Annuncio pubblicato nel database!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Errore nella pubblicazione', 'error');
    }
  };

  const togglePostLike = async (postId: string) => {
    if (!currentMusician) {
      showNotification('Accedi per applaudire gli annunci!', 'info');
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const updatedPost = await postsApi.toggleLike(postId);
      setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    } catch (err: any) {
      showNotification(err.message || 'Errore', 'error');
    }
  };

  const addPostComment = async (postId: string, content: string) => {
    if (!currentMusician) {
      showNotification('Accedi o registrati per rispondere pubblicamente!', 'info');
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const updatedPost = await postsApi.addComment(postId, content);
      setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
      showNotification('Risposta pubblicata!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Errore nella risposta', 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentMusician,
        isAuthenticated: !!currentUser,
        login,
        register,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,

        musicians,
        refreshMusicians,
        updateCurrentProfile,

        events,
        refreshEvents,
        createEvent,
        joinEventSlot,
        leaveEventSlot,

        posts,
        refreshPosts,
        createPost,
        togglePostLike,
        addPostComment,

        activeTab,
        setActiveTab,

        selectedMusicianForModal,
        setSelectedMusicianForModal,
        isEditProfileOpen,
        setIsEditProfileOpen,
        isCreateEventOpen,
        setIsCreateEventOpen,
        isCreatePostOpen,
        setIsCreatePostOpen,

        notification,
        showNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

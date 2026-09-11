import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  MusicianProfile,
  JamEvent,
  Post,
  Band,
  ActiveTab
} from '../types';
import { 
  authApi, 
  musiciansApi, 
  eventsApi, 
  postsApi, 
  bandsApi,
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
  applyBandToEvent: (eventId: string, bandId: string, message?: string) => Promise<boolean>;
  withdrawBandFromEvent: (eventId: string, bandId: string) => Promise<boolean>;
  addEventComment: (eventId: string, content: string) => Promise<boolean>;

  // Posts
  posts: Post[];
  refreshPosts: () => Promise<void>;
  createPost: (postData: any) => Promise<void>;
  togglePostLike: (postId: string) => Promise<void>;
  addPostComment: (postId: string, content: string) => Promise<void>;

  // Bands
  bands: Band[];
  refreshBands: () => Promise<void>;
  createBand: (bandData: any) => Promise<Band | null>;
  updateBand: (bandId: string, data: any) => Promise<void>;
  addBandMember: (bandId: string, musicianId: string, role: string) => Promise<boolean>;
  removeBandMember: (bandId: string, memberId: string) => Promise<boolean>;
  deleteBand: (bandId: string) => Promise<boolean>;

  // Navigation & UI state
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  selectedMusicianForModal: MusicianProfile | null;
  setSelectedMusicianForModal: (m: MusicianProfile | null) => void;
  selectedBandForModal: Band | null;
  setSelectedBandForModal: (b: Band | null) => void;
  selectedEventForModal: JamEvent | null;
  setSelectedEventForModal: (event: JamEvent | null) => void;
  isEditProfileOpen: boolean;
  setIsEditProfileOpen: (open: boolean) => void;
  isCreateEventOpen: boolean;
  setIsCreateEventOpen: (open: boolean) => void;
  isCreatePostOpen: boolean;
  setIsCreatePostOpen: (open: boolean) => void;
  isCreateBandOpen: boolean;
  setIsCreateBandOpen: (open: boolean) => void;

  notification: { message: string; type: 'success' | 'info' | 'error' } | null;
  showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
  const [currentMusician, setCurrentMusician] = useState<MusicianProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [musicians, setMusicians] = useState<MusicianProfile[]>([]);
  const [bands, setBands] = useState<Band[]>([]);
  const [events, setEvents] = useState<JamEvent[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('musicians');
  const [selectedMusicianForModal, setSelectedMusicianForModal] = useState<MusicianProfile | null>(null);
  const [selectedBandForModal, setSelectedBandForModal] = useState<Band | null>(null);
  const [selectedEventForModal, setSelectedEventForModal] = useState<JamEvent | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreateBandOpen, setIsCreateBandOpen] = useState(false);

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

  const refreshBands = useCallback(async () => {
    try {
      const data = await bandsApi.getAll();
      setBands(data);
    } catch (err: any) {
      console.error('Failed to load bands:', err);
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
    // Initial fetch of data from backend API
    refreshMusicians();
    refreshBands();
    refreshEvents();
    refreshPosts();

    // Check token - user is NOT authenticated on startup unless a valid session exists
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
    }
  }, [refreshMusicians, refreshBands, refreshEvents, refreshPosts]);

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
      if (selectedEventForModal?.id === updatedEvent.id) {
        setSelectedEventForModal(updatedEvent);
      }
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
      if (selectedEventForModal?.id === updatedEvent.id) {
        setSelectedEventForModal(updatedEvent);
      }
      showNotification('Hai liberato il tuo posto nella jam.', 'info');
    } catch (err: any) {
      showNotification(err.message || 'Errore nel liberare il posto', 'error');
    }
  };

  const applyBandToEvent = async (eventId: string, bandId: string, message?: string): Promise<boolean> => {
    if (!currentMusician) {
      showNotification('Accedi per candidare la tua band!', 'info');
      setIsAuthModalOpen(true);
      return false;
    }
    try {
      const updatedEvent = await eventsApi.applyBand(eventId, { bandId, message });
      setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
      if (selectedEventForModal?.id === updatedEvent.id) {
        setSelectedEventForModal(updatedEvent);
      }
      showNotification('Band candidata con successo all\'evento!', 'success');
      return true;
    } catch (err: any) {
      showNotification(err.message || 'Errore durante la candidatura della band', 'error');
      return false;
    }
  };

  const withdrawBandFromEvent = async (eventId: string, bandId: string): Promise<boolean> => {
    if (!currentMusician) return false;
    try {
      const updatedEvent = await eventsApi.withdrawBand(eventId, bandId);
      setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
      if (selectedEventForModal?.id === updatedEvent.id) {
        setSelectedEventForModal(updatedEvent);
      }
      showNotification('Candidatura della band ritirata.', 'info');
      return true;
    } catch (err: any) {
      showNotification(err.message || 'Errore durante il ritiro della candidatura', 'error');
      return false;
    }
  };

  const addEventComment = async (eventId: string, content: string): Promise<boolean> => {
    if (!currentMusician) {
      showNotification('Accedi per fare una domanda o lasciare un commento!', 'info');
      setIsAuthModalOpen(true);
      return false;
    }
    try {
      const updatedEvent = await eventsApi.addComment(eventId, content);
      setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
      if (selectedEventForModal?.id === updatedEvent.id) {
        setSelectedEventForModal(updatedEvent);
      }
      showNotification('Commento inviato con successo!', 'success');
      return true;
    } catch (err: any) {
      showNotification(err.message || 'Errore durante l\'invio del commento', 'error');
      return false;
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

  // 7. Bands actions
  const createBand = async (bandData: any): Promise<Band | null> => {
    if (!currentMusician) {
      showNotification('Accedi o registrati per creare una band!', 'info');
      setIsAuthModalOpen(true);
      return null;
    }
    try {
      const newBand = await bandsApi.create(bandData);
      setBands(prev => [newBand, ...prev]);
      showNotification('Band fondata con successo!', 'success');
      return newBand;
    } catch (err: any) {
      showNotification(err.message || 'Errore durante la creazione della band', 'error');
      return null;
    }
  };

  const updateBand = async (bandId: string, data: any) => {
    try {
      const updated = await bandsApi.update(bandId, data);
      setBands(prev => prev.map(b => b.id === updated.id ? updated : b));
      if (selectedBandForModal?.id === updated.id) {
        setSelectedBandForModal(updated);
      }
      showNotification('Informazioni band aggiornate!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Errore durante l\'aggiornamento della band', 'error');
    }
  };

  const addBandMember = async (bandId: string, musicianId: string, role: string): Promise<boolean> => {
    try {
      const updated = await bandsApi.addMember(bandId, { musicianId, role });
      setBands(prev => prev.map(b => b.id === updated.id ? updated : b));
      if (selectedBandForModal?.id === updated.id) {
        setSelectedBandForModal(updated);
      }
      showNotification('Nuovo membro aggiunto alla band!', 'success');
      return true;
    } catch (err: any) {
      showNotification(err.message || 'Impossibile aggiungere il membro', 'error');
      return false;
    }
  };

  const removeBandMember = async (bandId: string, memberId: string): Promise<boolean> => {
    try {
      const updated = await bandsApi.removeMember(bandId, memberId);
      setBands(prev => prev.map(b => b.id === updated.id ? updated : b));
      if (selectedBandForModal?.id === updated.id) {
        setSelectedBandForModal(updated);
      }
      showNotification('Membro rimosso dalla band.', 'info');
      return true;
    } catch (err: any) {
      showNotification(err.message || 'Impossibile rimuovere il membro', 'error');
      return false;
    }
  };

  const deleteBand = async (bandId: string): Promise<boolean> => {
    try {
      await bandsApi.delete(bandId);
      setBands(prev => prev.filter(b => b.id !== bandId));
      if (selectedBandForModal?.id === bandId) {
        setSelectedBandForModal(null);
      }
      showNotification('Band eliminata.', 'info');
      return true;
    } catch (err: any) {
      showNotification(err.message || 'Impossibile eliminare la band', 'error');
      return false;
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
        applyBandToEvent,
        withdrawBandFromEvent,
        addEventComment,

        posts,
        refreshPosts,
        createPost,
        togglePostLike,
        addPostComment,

        bands,
        refreshBands,
        createBand,
        updateBand,
        addBandMember,
        removeBandMember,
        deleteBand,

        activeTab,
        setActiveTab,

        selectedMusicianForModal,
        setSelectedMusicianForModal,
        selectedBandForModal,
        setSelectedBandForModal,
        selectedEventForModal,
        setSelectedEventForModal,
        isEditProfileOpen,
        setIsEditProfileOpen,
        isCreateEventOpen,
        setIsCreateEventOpen,
        isCreatePostOpen,
        setIsCreatePostOpen,
        isCreateBandOpen,
        setIsCreateBandOpen,

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

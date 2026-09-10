import type { MusicianProfile, JamEvent, Post } from '../types';

const TOKEN_KEY = 'bandmate_auth_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const text = await response.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    if (!response.ok) {
      throw new Error(`Errore dal server (${response.status}): ${text.slice(0, 120)}`);
    }
    throw new Error(`Risposta non valida dal server: ${text.slice(0, 120)}`);
  }

  if (!response.ok) {
    throw new Error(data.error || `Errore richiesta API (${response.status}): ${response.statusText}`);
  }

  return data as T;
}

// 1. Auth API
export const authApi = {
  async register(payload: {
    email: string;
    password: string;
    name: string;
    age: number;
    gender: string;
    city: string;
    region?: string;
    instruments: any[];
    genres: string[];
    bio?: string;
    availability?: string;
    experienceYears?: number;
    phoneOrContact?: string;
    avatar?: string;
  }) {
    const data = await request<{ token: string; user: any; musician: MusicianProfile }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
    setAuthToken(data.token);
    return data;
  },

  async login(credentials: { email: string; password: string }) {
    const data = await request<{ token: string; user: any; musician: MusicianProfile }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials)
      }
    );
    setAuthToken(data.token);
    return data;
  },

  async getMe() {
    return request<{ user: any; musician: MusicianProfile }>('/api/auth/me');
  },

  async logout() {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      setAuthToken(null);
    }
  },

  async getDemoAccounts() {
    return request<{ demoAccounts: any[]; defaultPassword: string }>('/api/auth/demo-accounts');
  }
};

// 2. Musicians API
export const musiciansApi = {
  async getAll(params?: { search?: string; instrument?: string; city?: string; genre?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.instrument && params.instrument !== 'all') query.set('instrument', params.instrument);
    if (params?.city && params.city !== 'all') query.set('city', params.city);
    if (params?.genre && params.genre !== 'all') query.set('genre', params.genre);

    const queryString = query.toString();
    const endpoint = `/api/musicians${queryString ? `?${queryString}` : ''}`;
    const data = await request<{ musicians: MusicianProfile[] }>(endpoint);
    return data.musicians;
  },

  async getById(id: string) {
    const data = await request<{ musician: MusicianProfile }>(`/api/musicians/${id}`);
    return data.musician;
  },

  async update(id: string, payload: Partial<MusicianProfile>) {
    const data = await request<{ musician: MusicianProfile }>(`/api/musicians/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return data.musician;
  }
};

// 3. Events API
export const eventsApi = {
  async getAll(params?: { city?: string; type?: string }) {
    const query = new URLSearchParams();
    if (params?.city && params.city !== 'all') query.set('city', params.city);
    if (params?.type && params.type !== 'all') query.set('type', params.type);

    const queryString = query.toString();
    const endpoint = `/api/events${queryString ? `?${queryString}` : ''}`;
    const data = await request<{ events: JamEvent[] }>(endpoint);
    return data.events;
  },

  async create(payload: {
    title: string;
    description: string;
    type: JamEvent['type'];
    date: string;
    time: string;
    locationName: string;
    address: string;
    city: string;
    genres: string[];
    slots: { instrument: string; maxCount: number }[];
    equipmentNotes?: string;
  }) {
    const data = await request<{ event: JamEvent }>('/api/events', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return data.event;
  },

  async joinSlot(eventId: string, slotId: string) {
    const data = await request<{ event: JamEvent }>(`/api/events/${eventId}/join`, {
      method: 'POST',
      body: JSON.stringify({ slotId })
    });
    return data.event;
  },

  async leaveSlot(eventId: string, slotId: string) {
    const data = await request<{ event: JamEvent }>(`/api/events/${eventId}/leave`, {
      method: 'POST',
      body: JSON.stringify({ slotId })
    });
    return data.event;
  }
};

// 4. Posts API
export const postsApi = {
  async getAll(params?: { category?: string }) {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'all') query.set('category', params.category);

    const queryString = query.toString();
    const endpoint = `/api/posts${queryString ? `?${queryString}` : ''}`;
    const data = await request<{ posts: Post[] }>(endpoint);
    return data.posts;
  },

  async create(payload: {
    category: Post['category'];
    title: string;
    content: string;
    city: string;
    targetInstruments: string[];
    genres: string[];
  }) {
    const data = await request<{ post: Post }>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return data.post;
  },

  async toggleLike(postId: string) {
    const data = await request<{ post: Post }>(`/api/posts/${postId}/like`, {
      method: 'POST'
    });
    return data.post;
  },

  async addComment(postId: string, content: string) {
    const data = await request<{ post: Post }>(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
    return data.post;
  }
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const SESSION_KEY = 'campus_connect_session';

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: SupabaseUser;
}

export interface SupabaseUser {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  created_at: string;
  user_metadata: Record<string, any>;
}

function getSession(): SupabaseSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: SupabaseSession = JSON.parse(raw);
    if (session.expires_at && Date.now() / 1000 > session.expires_at) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function saveSession(session: SupabaseSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getAccessToken(): string | null {
  return getSession()?.access_token || null;
}

export function getSessionUser(): SupabaseUser | null {
  return getSession()?.user || null;
}

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`,
  };
}

export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export async function signInWithPassword(email: string, password: string): Promise<SupabaseSession> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error_description || err.msg || 'Invalid email or password');
  }
  const data = await res.json();
  const session: SupabaseSession = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    user: data.user,
  };
  saveSession(session);
  return session;
}

export async function signUp(
  email: string,
  password: string,
  metadata: Record<string, any>
): Promise<SupabaseSession> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ email, password, data: metadata }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error_description || err.msg || 'Registration failed');
  }
  const data = await res.json();
  const session: SupabaseSession = {
    access_token: data.access_token || '',
    refresh_token: data.refresh_token || '',
    expires_at: data.expires_at || 0,
    user: data.user,
  };
  if (session.access_token) saveSession(session);
  return session;
}

export async function signOut(): Promise<void> {
  const token = getAccessToken();
  if (token && SUPABASE_URL) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  clearSession();
}

// ── Generic REST helpers for Supabase PostgREST ──────────────

export async function dbSelect<T = any>(
  table: string,
  query: string = '',
): Promise<T[]> {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${query}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch ${table}`);
  return res.json();
}

export async function dbInsert<T = any>(
  table: string,
  data: Record<string, any>,
): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...authHeaders(), Prefer: 'return=representation' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to insert into ${table}`);
  }
  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] : rows;
}

export async function dbUpdate<T = any>(
  table: string,
  matchQuery: string,
  data: Record<string, any>,
): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${matchQuery}`, {
    method: 'PATCH',
    headers: { ...authHeaders(), Prefer: 'return=representation' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update ${table}`);
  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] : rows;
}

export async function dbDelete(table: string, matchQuery: string): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${matchQuery}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete from ${table}`);
}

export async function dbUpsert<T = any>(
  table: string,
  data: Record<string, any>,
): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      Prefer: 'return=representation,resolution=merge-duplicates',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to upsert into ${table}`);
  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] : rows;
}

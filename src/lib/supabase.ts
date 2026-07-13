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

// Raw stored session WITHOUT the expiry check — used during startup restore so
// we can attempt a refresh instead of discarding an otherwise-valid session.
export function getStoredSession(): SupabaseSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SupabaseSession) : null;
  } catch {
    return null;
  }
}

export function isSessionExpired(session: SupabaseSession): boolean {
  // treat as expired 30s early to avoid racing the boundary
  return !!session.expires_at && Date.now() / 1000 > session.expires_at - 30;
}

// Exchange a refresh token for a fresh access token. Returns null if the refresh
// token is invalid/expired (caller should then force a re-login).
export async function refreshSession(): Promise<SupabaseSession | null> {
  const current = getStoredSession();
  if (!current?.refresh_token) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ refresh_token: current.refresh_token }),
    });
    if (!res.ok) {
      clearSession();
      return null;
    }
    const data = await res.json();
    if (!data.access_token) {
      clearSession();
      return null;
    }
    const session: SupabaseSession = {
      access_token: data.access_token,
      refresh_token: data.refresh_token ?? current.refresh_token,
      expires_at: data.expires_at,
      user: data.user ?? current.user,
    };
    saveSession(session);
    return session;
  } catch {
    return null;
  }
}

// Return a usable session, refreshing transparently if the access token has
// expired. Returns null only when there is no session or the refresh failed.
export async function restoreSession(): Promise<SupabaseSession | null> {
  const stored = getStoredSession();
  if (!stored) return null;
  if (isSessionExpired(stored)) {
    return refreshSession();
  }
  return stored;
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

// Efficient exact row count via PostgREST's Content-Range header (no rows transferred).
export async function dbCount(table: string, filter: string = ''): Promise<number> {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=id${filter ? '&' + filter : ''}`;
  const res = await fetch(url, {
    method: 'HEAD',
    headers: { ...authHeaders(), Prefer: 'count=exact', Range: '0-0' },
  });
  if (!res.ok) return 0;
  const range = res.headers.get('content-range'); // e.g. "0-0/123" or "*/123"
  const total = range?.split('/')?.[1];
  return total ? parseInt(total, 10) : 0;
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

// Call a Postgres RPC (SECURITY DEFINER function). Works for anon (e.g. username→email).
export async function rpcCall<T = any>(fn: string, args: Record<string, any>): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(`RPC ${fn} failed`);
  return res.json();
}

const AVATAR_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const AVATAR_MAX = 5 * 1024 * 1024; // 5MB

// Upload an avatar to the public "avatars" bucket under the caller's auth-uid folder.
// Returns the public URL. Throws friendly errors for type/size/permission issues.
export async function uploadAvatar(file: File): Promise<string> {
  if (!AVATAR_TYPES.includes(file.type)) {
    throw new Error('Please choose a JPG, PNG or WEBP image.');
  }
  if (file.size > AVATAR_MAX) {
    throw new Error('Image must be 5MB or smaller.');
  }
  const session = getSession();
  const token = session?.access_token;
  const authUid = session?.user?.id;
  if (!token || !authUid) throw new Error('You must be signed in to upload.');

  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  const path = `${authUid}/${Date.now()}.${ext}`;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/avatars/${path}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': file.type,
      'x-upsert': 'true',
    },
    body: file,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Upload failed. Check that the "avatars" bucket exists.');
  }
  // cache-bust so the new image shows immediately
  return `${SUPABASE_URL}/storage/v1/object/public/avatars/${path}?v=${Date.now()}`;
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

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  apiLogin,
  apiLogout,
  apiMe,
  apiRefresh,
  apiRegister,
  getAccessToken,
  setAccessToken,
  onAuthFailure,
  ApiError,
} from '@/lib/api/client';
import type { ApiUser, ApiWorkspace } from '@/types/auth';

interface AuthContextValue {
  user: ApiUser | null;
  workspace: ApiWorkspace | null;
  loading: boolean;
  isAuthenticated: boolean;
  login(email: string, password: string): Promise<void>;
  register(name: string, email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  loadUser(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [workspace, setWorkspace] = useState<ApiWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const initialised = useRef(false);

  /**
   * Restore the session on mount.
   *
   * The access token lives in memory only, so a page load starts without one
   * and relies on the HttpOnly refresh cookie. A 401 from /api/auth/me triggers
   * exactly one extra refresh before giving up.
   */
  const loadUser = useCallback(async () => {
    setLoading(true);

    const clearSession = () => {
      setUser(null);
      setWorkspace(null);
      setAccessToken(null);
    };

    const refresh = async () => {
      const { accessToken: token } = await apiRefresh();
      setAccessToken(token);
    };

    const fetchMe = async () => {
      const me = await apiMe();
      setUser(me.user);
      setWorkspace(me.workspace ?? null);
    };

    try {
      if (!getAccessToken()) {
        await refresh();
      }

      try {
        await fetchMe();
      } catch (err) {
        if (!(err instanceof ApiError) || err.status !== 401) throw err;
        await refresh();
        await fetchMe();
      }
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialise session on first mount only.
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    void loadUser();
  }, [loadUser]);

  // Subscribe to centralized auth failure (refresh failure / 401 unrecoverable)
  useEffect(() => {
    return onAuthFailure(() => {
      setUser(null);
      setWorkspace(null);
      setAccessToken(null);
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setAccessToken(res.accessToken);
    setUser(res.user);
    setWorkspace(res.workspace ?? null);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await apiRegister(name, email, password);
    setAccessToken(res.accessToken);
    setUser(res.user);
    setWorkspace(res.workspace ?? null);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    setWorkspace(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        workspace,
        loading,
        isAuthenticated: user !== null,
        login,
        register,
        logout,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

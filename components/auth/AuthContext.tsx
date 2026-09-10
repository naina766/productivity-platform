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
  type SafeUser,
  ApiError,
} from '@/lib/api/client';

// ─── Types ───────────────────────────────────────────────────────────────────

interface WorkspaceInfo {
  id: string;
  name: string;
  role: string;
}

interface AuthContextValue {
  user: SafeUser | null;
  workspace: WorkspaceInfo | null;
  loading: boolean;
  isAuthenticated: boolean;
  login(email: string, password: string): Promise<void>;
  register(name: string, email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  loadUser(): Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const initialised = useRef(false);

  /**
   * Try to restore the session on mount:
   * 1. If an access token is already in memory, call /api/auth/me.
   * 2. If that fails (401), try /api/auth/refresh to get a new access token.
   * 3. Retry /api/auth/me with the new token.
   * 4. If refresh also fails, clear state and treat as unauthenticated.
   */
  const loadUser = useCallback(async () => {
    setLoading(true);
    try {
      let token = getAccessToken();

      // No in-memory token — try to refresh via the HttpOnly cookie.
      if (!token) {
        try {
          const refreshRes = await apiRefresh();
          setAccessToken(refreshRes.accessToken);
          token = refreshRes.accessToken;
        } catch {
          // Refresh failed — no valid session.
          setUser(null);
          setWorkspace(null);
          return;
        }
      }

      try {
        const meRes = await apiMe(token);
        setUser(meRes.user);
        setWorkspace(meRes.workspace ?? null);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          // Access token expired — try one more refresh.
          try {
            const refreshRes = await apiRefresh();
            setAccessToken(refreshRes.accessToken);
            const meRes = await apiMe(refreshRes.accessToken);
            setUser(meRes.user);
            setWorkspace(meRes.workspace ?? null);
          } catch {
            setUser(null);
            setWorkspace(null);
            setAccessToken(null);
          }
        } else {
          throw err;
        }
      }
    } catch {
      setUser(null);
      setWorkspace(null);
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

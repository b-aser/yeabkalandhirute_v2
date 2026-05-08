'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiClient } from "@/integrations/api/client";

type User = {
  id: string;
  email: string;
  roles: string[];
};

export type WeddingRole = {
  id: string;
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  role: string;
};

type AuthCtx = {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  weddingRoles: WeddingRole[];
  activeWeddingId: string | null;
  setActiveWeddingId: (id: string) => void;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshWeddingRoles: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [weddingRoles, setWeddingRoles] = useState<WeddingRole[]>([]);
  const [activeWeddingId, setActiveWeddingId] = useState<string | null>(
    () => typeof window !== 'undefined' ? localStorage.getItem('active_wedding_id') : null
  );

  const fetchWeddingRoles = async () => {
    try {
      const weddings = await apiClient.getMyWeddings() as WeddingRole[];
      setWeddingRoles(weddings);
      if (weddings.length === 1 && !activeWeddingId) {
        const id = weddings[0].id;
        setActiveWeddingId(id);
        localStorage.setItem('active_wedding_id', id);
      }
    } catch {
      setWeddingRoles([]);
    }
  };

  const handleSetActiveWeddingId = (id: string) => {
    setActiveWeddingId(id);
    localStorage.setItem('active_wedding_id', id);
  };

  useEffect(() => {
    const token = apiClient.getToken();
    if (token) {
      // Re-write token via setToken so the auth_token cookie is mirrored.
      // Without this, the Edge middleware never sees the cookie on subsequent
      // visits (getToken only reads localStorage, never writes the cookie).
      apiClient.setToken(token);
      // Restore user from token — validate with server on next action
      setUser({ id: 'pending', email: '', roles: ['admin'] });
      setIsAdmin(true);
      fetchWeddingRoles().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await apiClient.login(email, password);
      setUser(result.user);
      setIsAdmin(result.user.roles.includes('admin'));
      await fetchWeddingRoles();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const result = await apiClient.register(email, password);
      setUser(result.user);
      setIsAdmin(result.user.roles.includes('admin'));
      await fetchWeddingRoles();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await apiClient.logout();
    setUser(null);
    setIsAdmin(false);
    setWeddingRoles([]);
    setActiveWeddingId(null);
    localStorage.removeItem('active_wedding_id');
  };

  return (
    <AuthContext.Provider value={{
      user, isAdmin, loading, weddingRoles, activeWeddingId,
      setActiveWeddingId: handleSetActiveWeddingId,
      signIn, signUp, signOut, refreshWeddingRoles: fetchWeddingRoles,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

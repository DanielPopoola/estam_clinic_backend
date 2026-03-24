import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi, token as tokenStore, usersApi } from '../../lib/api';
import type { User } from '../../lib/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isDoctor: boolean;
  isReceptionist: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, if we already have a token in storage, fetch the current user.
  useEffect(() => {
    const access = tokenStore.getAccess();
    if (!access) {
      setIsLoading(false);
      return;
    }
    usersApi
      .me()
      .then((res) => setUser(res.data))
      .catch(() => tokenStore.clear())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { data } = await authApi.login(username, password);
    tokenStore.setTokens(data.access, data.refresh);
    const profile = await usersApi.me();
    setUser(profile.data);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAdmin: user?.role === 'ADMIN',
        isDoctor: user?.role === 'DOCTOR',
        isReceptionist: user?.role === 'RECEPTIONIST',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
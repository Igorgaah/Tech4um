import { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

const TOKEN_KEY = 'tech4um_token';
const USER_KEY  = 'tech4um_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Validate token on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then((res) => {
        const u = res.data.user;
        setUser(u);
        localStorage.setItem(USER_KEY, JSON.stringify(u));
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const saveSession = useCallback((userData, token) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const register = useCallback(async (data) => {
    const res = await authApi.register(data);
    saveSession(res.data.user, res.data.token);
    toast.success('Cadastro realizado com sucesso! Bem-vindo(a)!');
    return res.data;
  }, [saveSession]);

  const login = useCallback(async (data) => {
    const res = await authApi.login(data);
    saveSession(res.data.user, res.data.token);
    toast.success(`Bem-vindo(a) de volta, ${res.data.user.username}!`);
    return res.data;
  }, [saveSession]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (_) {}
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    toast.success('Até logo!');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

import { useMemo } from 'react';

export const useAuth = () => {
  const user = useMemo(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  }, []);

  const login = (authUser, authToken = '') => {
    localStorage.setItem('user', JSON.stringify(authUser));
    if (authToken) localStorage.setItem('token', authToken);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return {
    user,
    login,
    logout,
    isAuthenticated: Boolean(user),
  };
};

export default useAuth;

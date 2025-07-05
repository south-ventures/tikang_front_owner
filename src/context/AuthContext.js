import { createContext, useContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tikangUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [hasValidated, setHasValidated] = useState(false);

  const storeToken = (token) => {
    localStorage.setItem('tikangToken', token);
    setHasValidated(false); // Allow validation to re-run
  };

  const validateToken = async () => {
    if (hasValidated) return user;

    const token = localStorage.getItem('tikangToken');
    const isOnAuthPage = ['/login', '/register', '/forgot-password'].includes(window.location.pathname);

    if (!token) {
      if (!isOnAuthPage) window.location.href = '/login';
      return null;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Invalid or expired token');

      const data = await res.json();
      setUser(data.user);
      localStorage.setItem('tikangUser', JSON.stringify(data.user));
      setHasValidated(true);
      return data.user;
    } catch (err) {
      console.error('Auto-login failed:', err);
      localStorage.removeItem('tikangToken');
      localStorage.removeItem('tikangUser');
      setUser(null);
      setHasValidated(false);
      if (!isOnAuthPage) window.location.href = '/login';
      return null;
    }
  };

  const fetchUser = async () => {
    const token = localStorage.getItem('tikangToken');
    if (!token) return null;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Invalid token');

      const decoded = jwtDecode(token);
      if (!decoded || !decoded.email || !decoded.userId) {
        throw new Error('Decoded token missing required fields');
      }

      setUser(decoded);
      localStorage.setItem('tikangUser', JSON.stringify(decoded));
      return decoded;
    } catch (err) {
      console.error('fetchUser error:', err);
      localStorage.removeItem('tikangToken');
      localStorage.removeItem('tikangUser');
      setUser(null);
      return null;
    }
  };

  const login = (token) => {
    try {
      const decoded = jwtDecode(token);
      if (decoded.full_name && decoded.email) {
        localStorage.setItem('tikangToken', token);
        localStorage.setItem('tikangUser', JSON.stringify(decoded));
        setUser(decoded);
        setHasValidated(false); // Reset validation flag
      } else {
        throw new Error('Token missing required fields');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setUser(null);
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('tikangToken');

    try {
      await fetch(`${process.env.REACT_APP_API_URL_OWNER}/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error('Logout failed:', err);
    }

    localStorage.removeItem('tikangToken');
    localStorage.removeItem('tikangUser');
    setUser(null);
    setHasValidated(false);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        setUser,
        fetchUser,
        validateToken,
        storeToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

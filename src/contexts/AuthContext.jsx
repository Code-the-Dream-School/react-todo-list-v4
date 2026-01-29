import { createContext, useContext, useState } from 'react';

const baseUrl = import.meta.env.VITE_BASE_URL;

// Create the Auth Context
export const AuthContext = createContext();

// Custom hook to use the Auth Context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth Provider component
export function AuthProvider({ children }) {
  const [name, setName] = useState('');
  const [token, setToken] = useState('');

  // Login function
  const login = async (userEmail, password) => {
    const options = {
      body: JSON.stringify({ email: userEmail, password }),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    };

    const res = await fetch(`${baseUrl}/users/logon`, options);
    const data = await res.json();

    if (res.status === 200 && data.name && data.csrfToken) {
      setName(data.name);
      setToken(data.csrfToken);
      return { success: true };
    } else {
      return {
        success: false,
        error: `Authentication failed: ${data?.message}`,
      };
    }
  };

  // Logout function
  const logout = async () => {
    if (!token) {
      // If no token, just clear state
      setName('');
      setToken('');
      return { success: true };
    }

    try {
      const options = {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': token,
        },
        credentials: 'include',
      };

      const res = await fetch(`${baseUrl}/user/logoff`, options);

      if (res.status === 200 || res.status === 401) {
        setName('');
        setToken('');
        return { success: true };
      } else {
        const data = await res.json();
        return {
          success: false,
          error: data.message || 'Logoff failed',
        };
      }
    } catch {
      return {
        success: false,
        error: 'Error logging off',
      };
    }
  };

  // Context value
  const value = {
    name,
    token,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

import { createContext, useState, useEffect, type ReactNode } from 'react';
import { signIn, signUp } from '../lib/api';
import { jwtDecode } from 'jwt-decode';
import type { LoginUserDto, CreateUserDto, Role } from '../lib/auth.dto';

interface DecodedToken {
  sub: string;
  email: string;
  name?: string;
  role?: Role;
  iat?: number;
  exp?: number;
}

interface AuthContextType {
  token: string | null;
  user: DecodedToken | null;
  login: (credentials: LoginUserDto) => Promise<void>;
  register: (userData: CreateUserDto) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<DecodedToken | null>(null);

  useEffect(() => {
    // Check for token in localStorage on mount
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setUser(jwtDecode(storedToken));
    }
  }, []);

  const login = async (credentials: LoginUserDto) => {
    const { accessToken } = await signIn(credentials);
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
    setUser(jwtDecode(accessToken));
  };

  const register = async (userData: CreateUserDto) => {
    await signUp(userData);
    // Optionally login after registration
    const { accessToken } = await signIn({ email: userData.email, password: userData.password });
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
    setUser(jwtDecode(accessToken));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

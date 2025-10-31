
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Pilot } from '../types';
import * as authService from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';

interface AuthContextType {
  currentUser: Pilot | null;
  login: (cpf: string, password: string) => Promise<Pilot | null>;
  loginWithGoogle: () => Promise<Pilot | null>;
  logout: () => void;
  isAuthenticated: boolean;
  updateCurrentUser: (updatedPilotData: Partial<Pilot>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Pilot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verifica uma sessão existente quando o app carrega
    const sessionUser = authService.getSession();
    if (sessionUser) {
      setCurrentUser(sessionUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (cpf: string, password: string) => {
    const user = await authService.loginWithCpf(cpf, password);
    setCurrentUser(user);
    return user;
  };
  
  const loginWithGoogle = async () => {
    const user = await authService.loginWithGoogle();
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const updateCurrentUser = (updatedPilotData: Partial<Pilot>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updatedPilotData };
      setCurrentUser(updatedUser);
      authService.updateSession(updatedUser);
    }
  };

  const value = {
    currentUser,
    login,
    loginWithGoogle,
    logout,
    isAuthenticated: !!currentUser,
    updateCurrentUser,
  };

  if (isLoading) {
    return <LoadingSpinner text="Inicializando sessão..." />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
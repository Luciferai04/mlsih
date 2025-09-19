import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { User, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (phoneNumber: string, deviceInfo: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshToken: () => Promise<void>;
  acceptConsent: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    token: null,
    refreshToken: null,
  });

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      const refreshToken = await AsyncStorage.getItem('@refresh_token');
      const userString = await AsyncStorage.getItem('@user_data');
      
      if (token && userString) {
        const user = JSON.parse(userString);
        
        // Validate token with backend
        const isValid = await authService.validateToken(token);
        
        if (isValid) {
          setState({
            isAuthenticated: true,
            isLoading: false,
            user,
            token,
            refreshToken,
          });
        } else {
          // Try to refresh token
          if (refreshToken) {
            await refreshTokenHandler(refreshToken);
          } else {
            await clearAuthData();
          }
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (phoneNumber: string, deviceInfo: any) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authService.login({ phoneNumber, deviceInfo });
      const { accessToken, refreshToken, user } = response.data;
      
      await AsyncStorage.multiSet([
        ['@auth_token', accessToken],
        ['@refresh_token', refreshToken],
        ['@user_data', JSON.stringify(user)],
      ]);
      
      setState({
        isAuthenticated: true,
        isLoading: false,
        user,
        token: accessToken,
        refreshToken,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authService.register(data);
      const { accessToken, refreshToken, user } = response.data;
      
      await AsyncStorage.multiSet([
        ['@auth_token', accessToken],
        ['@refresh_token', refreshToken],
        ['@user_data', JSON.stringify(user)],
      ]);
      
      setState({
        isAuthenticated: true,
        isLoading: false,
        user,
        token: accessToken,
        refreshToken,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Call logout endpoint if needed
      if (state.token) {
        await authService.logout(state.token);
      }
      
      await clearAuthData();
    } catch (error) {
      console.error('Logout error:', error);
      await clearAuthData();
    }
  };

  const clearAuthData = async () => {
    await AsyncStorage.multiRemove(['@auth_token', '@refresh_token', '@user_data']);
    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
      refreshToken: null,
    });
  };

  const refreshTokenHandler = async (refreshToken: string) => {
    try {
      const response = await authService.refreshToken(refreshToken);
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      await AsyncStorage.multiSet([
        ['@auth_token', accessToken],
        ['@refresh_token', newRefreshToken],
      ]);
      
      setState(prev => ({
        ...prev,
        token: accessToken,
        refreshToken: newRefreshToken,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Token refresh failed:', error);
      await clearAuthData();
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!state.user || !state.token) return;
      
      const response = await authService.updateProfile(state.token, userData);
      const updatedUser = { ...state.user, ...response.data };
      
      await AsyncStorage.setItem('@user_data', JSON.stringify(updatedUser));
      
      setState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (error) {
      throw error;
    }
  };

  const acceptConsent = async () => {
    try {
      if (!state.user || !state.token) return;
      
      const response = await authService.updateConsent(state.token, true);
      const updatedUser = { ...state.user, consentGiven: true, consentTimestamp: new Date().toISOString() };
      
      await AsyncStorage.setItem('@user_data', JSON.stringify(updatedUser));
      
      setState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (error) {
      throw error;
    }
  };

  const refreshToken = async () => {
    if (state.refreshToken) {
      await refreshTokenHandler(state.refreshToken);
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    refreshToken,
    acceptConsent,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
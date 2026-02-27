import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // App khulte hi check karo storage mein kuch hai ya nahi
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  // Simple Login: Data lo aur save kar do
  const login = async (userData: any, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    await AsyncStorage.setItem('token', userToken);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  // Simple Logout: Sab clear kar do
  const logout = async () => {
    setUser(null);
    setToken(null);
    // await AsyncStorage.clear(); // Poori storage saaf
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      isLoading, 
      isLoggedIn: !!token // Agar token hai toh matlab banda login hai
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
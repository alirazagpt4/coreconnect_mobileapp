import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Hamara simple Context aur Screens
import { AuthProvider, useAuth } from './src/context/AuthContext';
import SplashScreen from './src/SplashScreen';
import LoginScreen from './src/LoginScreen';
import ActivityScreen from './src/ActivityScreen';
import MarkAttendanceScreen from './src/MarkAttendanceScreen';
import StartDayScreen from './src/StartDayScreen';

const Stack = createStackNavigator();

const NavigationTree = () => {
  const { token, isLoading } = useAuth();

  
  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token == null ? (
       
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
        
        <Stack.Screen name="Activity" component={ActivityScreen} />
        <Stack.Screen name="MarkAttendance" component={MarkAttendanceScreen} />
        <Stack.Screen name="StartDay" component={StartDayScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <NavigationTree />
      </NavigationContainer>
    </AuthProvider>
  );
}
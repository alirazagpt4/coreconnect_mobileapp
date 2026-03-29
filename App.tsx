import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ToastProvider } from './src/context/ToastContext';

// Hamara simple Context aur Screens
import { AuthProvider, useAuth } from './src/context/AuthContext';
import SplashScreen from './src/SplashScreen';
import LoginScreen from './src/LoginScreen';
import ActivityScreen from './src/ActivityScreen';
import MarkAttendanceScreen from './src/MarkAttendanceScreen';
import StartDayScreen from './src/StartDayScreen';
import CreateSaleScreen from './src/CreateSaleScreen';
import ShortItemScreen from './src/ShortItemScreen';
import ReportScreen from './src/ReportScreen';
import AttendanceReportScreen from './src/AttendanceReportScreen';
import SalesReportScreen from './src/SalesReportScreen';
import InterceptionScreen from './src/InterceptionScreen';
import ExpiryStockScreen from './src/ExpiryStockScreen';
import ShortTesterScreen from './src/ShortTesterScreen';

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
          <Stack.Screen name="CreateSale" component={CreateSaleScreen} />
          <Stack.Screen name="ShortItems" component={ShortItemScreen} />
          <Stack.Screen name="Report" component={ReportScreen} />
          <Stack.Screen name="Attendance Report" component={AttendanceReportScreen} />
          <Stack.Screen name="Sales Report" component={SalesReportScreen} />
          <Stack.Screen name="Interception" component={InterceptionScreen} />
          <Stack.Screen name="ShortTesters" component={ShortTesterScreen} />
          <Stack.Screen name="ExpiryStock" component={ExpiryStockScreen} />



        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NavigationContainer>
          <NavigationTree />
        </NavigationContainer>
      </ToastProvider>
    </AuthProvider>
  );
}
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, StatusBar, ActivityIndicator } from 'react-native';

const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    // 4 second ka timer
    const timer = setTimeout(() => {
      navigation.replace('Login'); 
    }, 4000);

    return () => clearTimeout(timer); 
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Logo Section */}
      <Image 
        source={require('./assets/logo.jpeg')} 
        style={styles.logo} 
      />
      
      {/* Loading Section */}
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Clean white background (aap apni pasand ka color rakh sakte hain)
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 80, // Screen ke thoda upar loading dikhane ke liye
    alignItems: 'center',
  },
  loadingText: {
    color: '#333333',
    fontSize: 16,
    marginTop: 10,
    fontWeight: '500',
  },
});

export default SplashScreen;
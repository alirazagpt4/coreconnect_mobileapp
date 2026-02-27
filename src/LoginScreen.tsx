import React, { useState } from 'react';
import { View, StyleSheet, Image, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useAuth } from './context/AuthContext';
import API from './api/API'; // Aapka banaya hua axios instance

const LoginScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    // Basic validation
    if (!name || !password) {
      Alert.alert("Error", "Please fill all the fields");
      return;
    }

    setLoading(true);
    try {
      // API call jo aapne batayi thi
      const response = await API.post('/users/login', {
        name: name,
        password: password,
      });

      const { message, token, user } = response.data;

      if (token) {
        
        login(user, token); 

        console.log(message); 
        
       navigation.navigate('Activity'); 
      }
    } catch (error: any) {
      // Backend se aane wala error message dikhayen
      const errorMsg = error.response?.data?.message || "Login fail ho gaya!";
      Alert.alert("Login Error", errorMsg);
      console.log("Error details:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('./assets/logo.jpeg')} style={styles.logo} />
      <Text variant="headlineMedium" style={styles.title}>Login</Text>
      
      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
        activeOutlineColor="#1b2142"
        autoCapitalize="none"
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        secureTextEntry
        style={styles.input}
        activeOutlineColor="#1b2142"
      />

      <Button 
        mode="contained" 
        onPress={handleLogin} 
        loading={loading} // API call ke waqt ghoomega
        disabled={loading}
        style={styles.button}
        labelStyle={{ color: 'white' }}
      >
        {loading ? 'Logging in...' : 'Login'}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  logo: { width: 120, height: 120, alignSelf: 'center', marginBottom: 20, resizeMode: 'contain' },
  title: { textAlign: 'center', marginBottom: 20, fontWeight: 'bold', color: '#333' },
  input: { marginBottom: 15 },
  button: { backgroundColor: '#1b2142', paddingVertical: 5, marginTop: 10, borderRadius: 5 }
});

export default LoginScreen;
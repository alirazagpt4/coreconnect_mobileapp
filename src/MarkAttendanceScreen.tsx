import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, Appbar, Button, HelperText } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import API from './api/API.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MarkAttendanceScreen = ({ navigation, route }: any) => {
  const [attendanceType, setAttendanceType] = useState<string | null>(null);
  const [loading , setLoading] = useState(true)

  // Colors
  const navyBlue = '#1b2142';
  const deepMaroon = '#9a324e';

  // Jab StartDay screen se wapas aayein toh status check karein
  useEffect(() => {
  const checkStatus = async () => {
    // AsyncStorage se saved date aur status uthao
    const savedDate = await AsyncStorage.getItem('attendanceDate');
    const savedType = await AsyncStorage.getItem('attendanceType');
    const today = new Date().toISOString().split('T')[0]; // Aaj ki date: 2026-02-27

    if (savedDate === today) {
      // Agar date aaj ki hi hai, toh purana status set kar do (Disable buttons)
      setAttendanceType(savedType);
    } else {
      // Agar date purani hai (Raat 12 baje ke baad), toh reset kar do (Enable buttons)
      setAttendanceType(null);
      await AsyncStorage.removeItem('attendanceDate');
      await AsyncStorage.removeItem('attendanceType');
    }
  };

  checkStatus();



    if (route.params?.status === 'marked') {
      setAttendanceType('start');
    }
  }, [route.params?.status]);


  // Status aur Date dono save karne ka function
const saveStatusLocally = async (type: string) => {
  const today = new Date().toISOString().split('T')[0];
  await AsyncStorage.setItem('attendanceDate', today);
  await AsyncStorage.setItem('attendanceType', type);
  setAttendanceType(type);
};

  // Leave API Call Logic
  const submitLeave = async () => {
    setLoading(true);
    try {
      const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });

      // Leave ke liye payload (isLeave: 'true')
      const formData = new FormData();
      formData.append('image', ""); // Leave mein image empty jati hai
      formData.append('latitude', "");
      formData.append('longitude', "");
      formData.append('time', currentTime);
      formData.append('isLeave', 'true'); // Yahan true bhej rahe hain

      const response = await API.post('/attendance/start-day', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        // setAttendanceType('leave');
        await saveStatusLocally('leave');
        Alert.alert("Success", "Your leave has been marked for today.");
      } else {
        Alert.alert("Error", response.data.message || "Failed to mark leave");
      }
    } catch (error: any) {
      console.log("Leave Error:", error.response?.data || error.message);
      Alert.alert("Server Error", "Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleTakeLeave = () => {
    Alert.alert(
      "Confirm Leave",
      "Are you taking leave today?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes", 
          onPress: submitLeave 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: navyBlue }}>
        <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
        <Appbar.Content title="Mark Attendance" titleStyle={{ color: 'white' }} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        
       {attendanceType && (
  <View style={styles.statusBox}>
    <Icon name="check-circle" size={24} color={navyBlue} />
    <Text style={[styles.statusText, { color: navyBlue }]}>
      {attendanceType === 'leave' ? "You are on leave today" : "Your day has been started"}
    </Text>
  </View>
)}

        <Text style={styles.label}>Select Attendance Action</Text>

        <Button
          mode="outlined"
          icon="clock-check"
          onPress={() => navigation.navigate('StartDay')}
          disabled={!!attendanceType}
          style={[styles.button, !attendanceType && { borderColor: navyBlue }]}
          textColor={attendanceType ? '#bdc3c7' : navyBlue}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Start Day
        </Button>
        <HelperText type="info" visible={!attendanceType}>
          Mark your entry with photo and location.
        </HelperText>

        <View style={{ height: 25 }} />

        <Button
          mode="outlined"
          icon="calendar-remove"
          onPress={handleTakeLeave}
          disabled={!!attendanceType}
          style={[styles.button, !attendanceType && { borderColor: deepMaroon }]}
          textColor={attendanceType ? '#bdc3c7' : deepMaroon}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Take Leave
        </Button>
        <HelperText type="info" visible={!attendanceType}>
          Request for a day off.
        </HelperText>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { padding: 25 },
  label: { fontSize: 13, color: '#666', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 25, fontWeight: 'bold' },
  button: { borderRadius: 10, borderWidth: 2, backgroundColor: '#ffffff' },
  buttonContent: { height: 65 },
  buttonLabel: { fontSize: 18, fontWeight: 'bold' },
  statusBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f2f5', padding: 18, borderRadius: 12, marginBottom: 30, borderWidth: 1, borderColor: '#d1d5db' },
  statusText: { marginLeft: 12, fontWeight: '700', fontSize: 15 }
});

export default MarkAttendanceScreen;
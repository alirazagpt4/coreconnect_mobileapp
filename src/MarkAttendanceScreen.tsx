import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, Appbar, Button, HelperText } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import API from './api/API.js';

const MarkAttendanceScreen = ({ navigation, route }: any) => {
  const [isAttendanceMarked, setIsAttendanceMarked] = useState(false);
  const [loading , setLoading] = useState(true)

  // Colors
  const navyBlue = '#1b2142';
  const deepMaroon = '#9a324e';

  // Jab StartDay screen se wapas aayein toh status check karein
  useEffect(() => {
    if (route.params?.status === 'marked') {
      setIsAttendanceMarked(true);
    }
  }, [route.params?.status]);


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
        setIsAttendanceMarked(true);
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
        
        {isAttendanceMarked && (
          <View style={styles.statusBox}>
            <Icon name="check-circle" size={24} color={navyBlue} />
            <Text style={[styles.statusText, { color: navyBlue }]}>
                Attendance already marked for today
            </Text>
          </View>
        )}

        <Text style={styles.label}>Select Attendance Action</Text>

        <Button
          mode="outlined"
          icon="clock-check"
          onPress={() => navigation.navigate('StartDay')}
          disabled={isAttendanceMarked}
          style={[styles.button, !isAttendanceMarked && { borderColor: navyBlue }]}
          textColor={isAttendanceMarked ? '#bdc3c7' : navyBlue}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Start Day
        </Button>
        <HelperText type="info" visible={!isAttendanceMarked}>
          Mark your entry with photo and location.
        </HelperText>

        <View style={{ height: 25 }} />

        <Button
          mode="outlined"
          icon="calendar-remove"
          onPress={handleTakeLeave}
          disabled={isAttendanceMarked}
          style={[styles.button, !isAttendanceMarked && { borderColor: deepMaroon }]}
          textColor={isAttendanceMarked ? '#bdc3c7' : deepMaroon}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Take Leave
        </Button>
        <HelperText type="info" visible={!isAttendanceMarked}>
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
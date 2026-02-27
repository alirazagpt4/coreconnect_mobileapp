import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { Text, Appbar, Button } from 'react-native-paper';
import { launchCamera } from 'react-native-image-picker';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';
import API from './api/API.js';


const StartDayScreen = ({ navigation }: any) => {
  const [photo, setPhoto] = useState<any>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const navyBlue = '#1b2142';

  // 1. Permission Mangna
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  // 2. Camera Capture (Low Quality)
  const takePhoto = () => {
    const options: any = {
      mediaType: 'photo',
      cameraType: 'front',
      quality: 0.3, // Quality low rakhi hai (0.1 to 1.0)
      maxWidth: 800,
      maxHeight: 800,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) return;
      if (response.assets && response.assets.length > 0) {
        setPhoto(response.assets[0]);
      }
    });
  };

  // 3. Location Capture (15 Seconds Timeout)
  const getLocation = () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(coords);
          resolve(coords);
        },
        (error) => {
          Alert.alert("Location Error", "Could not get your location.");
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  };

 
  // 4. Submit Payload
  const handleSubmit = async () => {
    if (!photo) {
      Alert.alert("Error", "Please take a photo first!");
      return;
    }

    setLoading(true);
    try {
      // Location uthao
      const currentLoc: any = await getLocation();      
      const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false }); // 24hr format behtar hai
      const currentDate = new Date().toISOString().split('T')[0];

      // Console mein Payload dikhana
      console.log("--- ATTENDANCE PAYLOAD ---");
      console.log("Image URI:", photo.uri);
      console.log("Latitude:", currentLoc.lat);
      console.log("Longitude:", currentLoc.lng);
      console.log("Time:", currentTime);

      // Multipart Form Data Tyari
      const formData = new FormData();
      formData.append('image', {
        uri: photo.uri,
        type: photo.type || 'image/jpeg',
        name: photo.fileName || `attendance_${Date.now()}.jpg`,
      });

      formData.append('latitude', String(currentLoc.lat)); // String mein convert kiya
      formData.append('longitude', String(currentLoc.lng)); // String mein convert kiya
      formData.append('time', currentTime);
      formData.append('isLeave', 'false');

      // Step C: Actual API Call (Multipart Headers ke saath)
      const response = await API.post('/attendance/start-day', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Step D: Response Check (Postman response ke mutabiq)
      if (response.data.success) {
        Alert.alert("Success", response.data.message || "Day started successfully!");
        // Status bhej kar wapas jayein taake buttons disable ho jayein
        navigation.navigate('MarkAttendance', { status: 'marked' });
      } else {
        Alert.alert("Error", response.data.message || "Something went wrong");
      }
      

    } catch (error: any) {
      // Error handling (Backend ya Network issue)
      console.log("Submit Error:", error.response?.data || error.message);
      Alert.alert("Server Error", error.response?.data?.message || "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: navyBlue }}>
        <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
        <Appbar.Content title="Start Day" titleStyle={{ color: 'white' }} />
      </Appbar.Header>

      <View style={styles.content}>
        <View style={styles.imageContainer}>
          {photo ? (
            <Image source={{ uri: photo.uri }} style={styles.preview} />
          ) : (
            <View style={styles.placeholder}>
              <Text>No Photo Captured</Text>
            </View>
          )}
        </View>

        <Button 
          mode="outlined" 
          icon="camera" 
          onPress={takePhoto} 
          style={styles.cameraBtn}
          textColor={navyBlue}
        >
          Capture Store Photo
        </Button>

        {loading ? (
          <ActivityIndicator size="large" color={navyBlue} style={{ marginTop: 20 }} />
        ) : (
          <Button 
            mode="contained" 
            onPress={handleSubmit} 
            style={[styles.submitBtn, { backgroundColor: navyBlue }]}
          >
            Confirm & Start Day
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, alignItems: 'center' },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  preview: { width: '100%', height: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cameraBtn: { width: '100%', marginBottom: 20, borderColor: '#1b2142' },
  submitBtn: { width: '100%', paddingVertical: 8 },
});

export default StartDayScreen;
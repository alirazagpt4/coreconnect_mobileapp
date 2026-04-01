import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { Text, Appbar, Divider, List, } from 'react-native-paper';
import { useAuth } from './context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import API from './api/API.js';


const ActivityScreen = ({ navigation }: any) => {
  const [version, setVersion] = useState("v7.3");





  const { logout, user } = useAuth();
  console.log("users role and designation", user.designation)
  const isSupervisor = user?.designation?.toLowerCase() === 'supervisor';

  const handleLogoutPress = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes, Logout",
          onPress: () => logout(), // Aapka actual logout function yahan call hoga
          style: "destructive"
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Simple Header */}
      <Appbar.Header style={{ backgroundColor: '#1b2142' }}>
        {/* Left Side: Logo + Title Group */}
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingLeft: 10 }}>
          <Image
            source={require('./assets/cc.png')} // Apna sahi path check kar lena
            style={{
              width: 28,
              height: 28,
              borderRadius: 14, // CORE FIX: Perfect circle (28 / 2 = 14)
              borderWidth: 1, // Optional: Logo ke bahar patli white line
              borderColor: 'rgba(255, 255, 255, 0.2)',
              backgroundColor: 'white', // Subtle white border,
              
            }}
            resizeMode="cover" // Cover zaroori hai perfect circle ke liye
            accessibilityRole="image"
            accessibilityLabel="CoreConnect Circular Logo"
          />
          <Text style={{
            color: 'white',
            fontSize: 18,
            fontWeight: 'bold',
            marginLeft: 10
          }}>
            Core Connect
          </Text>
        </View>

        {/* Right Side: Version + Logout Group */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 5 }}>
          <Text
            style={{
              color: 'white',
              fontSize: 11,
              fontWeight: '500',
              opacity: 0.7,
              marginRight: -4
            }}
            accessibilityLabel={`App Version ${version}`}
          >
            {version}
          </Text>

          <Appbar.Action
            icon="logout"
            color="white"
            onPress={handleLogoutPress}
            rippleColor="rgba(255, 255, 255, .1)"
            accessibilityLabel="Logout"
          />
        </View>
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* User Greeting Section */}
        <View style={styles.userSection}>
          <Text style={styles.welcomeText}>Hello, {user?.fullname || 'User'}</Text>
          <Text style={styles.infoText}>{user?.designation} • {user?.city}</Text>
        </View>

        <Divider style={styles.divider} />

        {/* Simple List Items */}


        <List.Item
          title="Mark Attendance"
          titleStyle={styles.listTitle}
          left={props => <List.Icon {...props} icon="calendar-check" color="#3498db" />}
          right={props => <List.Icon {...props} icon="chevron-right" color="#ccc" />}
          onPress={() => navigation.navigate('MarkAttendance')}
          style={styles.listItem}
        />
        <Divider />




        <List.Item
          title="Create Interceptions"
          titleStyle={styles.listTitle}
          left={props => <List.Icon {...props} icon="target" color="#2ecc71" />}
          right={props => <List.Icon {...props} icon="chevron-right" color="#ccc" />}
          onPress={() => navigation.navigate('Interception')}
          style={styles.listItem}
        />
        <Divider />

        <List.Item
          title="Create Sales"
          titleStyle={styles.listTitle}
          left={props => <List.Icon {...props} icon="cart-plus" color="#2ecc71" />}
          right={props => <List.Icon {...props} icon="chevron-right" color="#ccc" />}
          onPress={() => navigation.navigate('CreateSale')}
          style={styles.listItem}
        />
        <Divider />


        {/* 3. NEW: Short Testers Section */}
        <List.Item
          title="Short Testers"
          titleStyle={styles.listTitle}
          left={props => <List.Icon {...props} icon="flask-outline" color="#9b59b6" />}
          right={props => <List.Icon {...props} icon="chevron-right" color="#ccc" />}
          onPress={() => navigation.navigate('ShortTesters')} // Navigation name check kar lena stack mein
          style={styles.listItem}
        />
        <Divider />


        <List.Item
          title="Short Items"
          titleStyle={styles.listTitle}
          left={props => <List.Icon {...props} icon="cart-plus" color="#e74c3c" />} // Red color for 'Short' alert
          right={props => <List.Icon {...props} icon="chevron-right" color="#ccc" />}
          onPress={() => navigation.navigate('ShortItems')}
          style={styles.listItem}
        />
        <Divider />


        {/* 2. CONDITIONAL RENDERING: Sirf Supervisor ko dikhega */}
        {isSupervisor && (
          <>
            <List.Item
              title="Expiry Stock"
              titleStyle={styles.listTitle}
              left={props => <List.Icon {...props} icon="calendar-remove" color="#f1c40f" />}
              right={props => <List.Icon {...props} icon="chevron-right" color="#ccc" />}
              onPress={() => navigation.navigate('ExpiryStock')}
              style={styles.listItem}
            />
            <Divider />
          </>
        )}

        <List.Item
          title="Reports"
          titleStyle={styles.listTitle}
          left={props => <List.Icon {...props} icon="file-chart" color="#e67e22" />}
          right={props => <List.Icon {...props} icon="chevron-right" color="#ccc" />}
          onPress={() => navigation.navigate('Report')}
          style={styles.listItem}
        />
        <Divider />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1 },
  userSection: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  welcomeText: { fontSize: 22, fontWeight: 'bold', color: '#1b2142' },
  infoText: { fontSize: 14, color: '#666', marginTop: 5 },
  divider: { height: 1, backgroundColor: '#e0e0e0' },
  listItem: {
    paddingVertical: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '500',
  }
});

export default ActivityScreen;
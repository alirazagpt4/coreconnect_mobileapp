import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { Text, Appbar, Divider, List, } from 'react-native-paper';
import { useAuth } from './context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import API from './api/API.js';


const ActivityScreen = ({ navigation }: any) => {
  const [version, setVersion] = useState("v8.1");





  const { logout, user } = useAuth();

  // 1. SAFE LOGGING: Agar user null hai toh crash nahi hoga
  console.log("User designation:", user?.designation || "No User");
  const designation = user?.designation?.toLowerCase();
  const isSupervisor = designation === 'supervisor';
  const isBA = designation === 'ba';

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
      <Appbar.Header style={{ backgroundColor: '#1b2142', paddingHorizontal: 10 }}>

        {/* 1. Left Side: Logo and Title */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={require('./assets/logo.jpeg')}
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: 'white',
            }}
            resizeMode="contain"
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

        {/* 2. FLEXIBLE SPACER: Ye "Gussa" khatam karega */}
        {/* Ye khali View beech mein saari extra jagah le lega */}
        <View style={{ flex: 1 }} />

        {/* 3. Right Side: Version + Logout */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{
            color: 'white',
            fontSize: 12,
            opacity: 0.7,
            marginRight: 5 // Thoda gap version aur button ke beech
          }}>
            {version}
          </Text>
          <Appbar.Action
            icon="logout"
            color="white"
            onPress={handleLogoutPress}
            size={24} // Size fixed rakho
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



        {isBA && (
          <>
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

            <List.Item
              title="Short Testers"
              titleStyle={styles.listTitle}
              left={props => <List.Icon {...props} icon="flask-outline" color="#9b59b6" />}
              right={props => <List.Icon {...props} icon="chevron-right" color="#ccc" />}
              onPress={() => navigation.navigate('ShortTesters')}
              style={styles.listItem}
            />
            <Divider />

            <List.Item
              title="Short Items"
              titleStyle={styles.listTitle}
              left={props => <List.Icon {...props} icon="cart-plus" color="#e74c3c" />}
              right={props => <List.Icon {...props} icon="chevron-right" color="#ccc" />}
              onPress={() => navigation.navigate('ShortItems')}
              style={styles.listItem}
            />
            <Divider />
          </>
        )}


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
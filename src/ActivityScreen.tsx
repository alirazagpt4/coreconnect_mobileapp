import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Text, Appbar, Divider, List } from 'react-native-paper';
import { useAuth } from './context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


const ActivityScreen = ({ navigation }: any) => {
  const [version, setVersion] = useState("v7.2");


  const { logout, user } = useAuth();

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
        <Appbar.Content title="CoreConnect" titleStyle={{ color: 'white' }} />
        {/* <Appbar.Action icon="logout" color="white" onPress={handleLogoutPress} /> */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 5 }}>
          <Text
            style={{
              color: 'white',
              fontSize: 12,
              fontWeight: '500',
              opacity: 0.7,
              marginRight: -4 // Logout icon ke kareeb karne ke liye
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


        {/* 5. NEW: Expiry Stock Section */}
        <List.Item
          title="Expiry Stock"
          titleStyle={styles.listTitle}
          left={props => <List.Icon {...props} icon="calendar-remove" color="#f1c40f" />}
          right={props => <List.Icon {...props} icon="chevron-right" color="#ccc" />}
          onPress={() => navigation.navigate('ExpiryStock')} // Navigation name check kar lena stack mein
          style={styles.listItem}
        />
        <Divider />

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
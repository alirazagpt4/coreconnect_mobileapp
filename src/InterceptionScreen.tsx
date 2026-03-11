import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Appbar, TextInput, Button, Card } from 'react-native-paper';
import API from './api/API.js';

const InterceptionScreen = ({ navigation }: any) => {
    const [profile, setProfile] = useState<any>(null);
    const [intercepted, setIntercepted] = useState('');
    const [converted, setConverted] = useState('');
    const [ratio, setRatio] = useState('0');
    const [loading, setLoading] = useState(false);

    // 1. Load Profile to get Store ID
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await API.get('/users/profile');
                if (res.data && res.data.profile) {
                    console.log("profile res :::" , res.data.profile);
                    setProfile(res.data.profile);
                }
            } catch (e) {
                console.log("Profile Fetch Error:", e);
            }
        };
        fetchProfile();
    }, []);

    // 2. Real-time Ratio Calculation
    useEffect(() => {
        const intVal = parseFloat(intercepted);
        const convVal = parseFloat(converted);

        if (intVal > 0 && convVal >= 0) {
            const res = (convVal / intVal) * 100;
            // Agar ratio 100 se upar ja rahi ho to handle karein (Logical check)
            setRatio(res.toFixed(1));
        } else {
            setRatio('0');
        }
    }, [intercepted, converted]);

    // 3. Handle Submit
    const handleSubmit = async () => {
        const intVal = parseInt(intercepted);
        const convVal = parseInt(converted);

        if (!intercepted || !converted) {
            return Alert.alert("Wait", "Please enter both Interceptions and Conversions");
        }

        if (convVal > intVal) {
            return Alert.alert("Logic Error", "Conversions cannot be more than Interceptions");
        }

        console.log("store...")

        const payload = {
            intercepted: intVal,
            converted: convVal,
            ratio: parseFloat(ratio),
            store_id: profile?.assigned_stores?.[0]?.id || null, // Profile se store_id
            
        };

        if (!payload.store_id) {
            return Alert.alert("Error", "Store ID not found in your profile.");
        }

        setLoading(true);
        try {
            const res = await API.post('/interceptions/add', payload);
            if (res.data.success) {
                Alert.alert("Success", "Interception report saved successfully");
                navigation.goBack();
            } else {
                Alert.alert("Failed", res.data.message);
            }
        } catch (e) {
            console.log("Save Error:", e);
            Alert.alert("Error", "Server connection failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
                <Appbar.Content
                    title={<Text style={styles.headerTitle}>Add Interception</Text>}
                    subtitle={<Text style={styles.headerSubtitle}>{profile?.assigned_stores?.[0]?.store_name || "Loading store..."}</Text>}
                />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>Performance Metrics</Text>

                <Card style={styles.formCard}>
                    <TextInput
                        label="Interceptions"
                        value={intercepted}
                        onChangeText={setIntercepted}
                        keyboardType="numeric"
                        mode="outlined"
                        style={styles.input}
                        activeOutlineColor="#1b2142"
                    />

                    <TextInput
                        label="Conversions"
                        value={converted}
                        onChangeText={setConverted}
                        keyboardType="numeric"
                        mode="outlined"
                        style={styles.input}
                        activeOutlineColor="#1b2142"
                    />

                    <View style={styles.ratioContainer}>
                        <TextInput
                            label="Ratio (%)"
                            value={ratio + "%"}
                            editable={false} // User edit nahi kar sakta
                            mode="outlined"
                            style={[styles.input, styles.ratioInput]}
                        />
                        {/* <Text style={styles.helperText}>
                            Formula: (Converted / Intercepted) * 100
                        </Text> */}
                    </View>

                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        loading={loading}
                        disabled={loading}
                        style={styles.submitButton}
                        labelStyle={styles.btnLabel}
                    >
                        SAVE INTERCEPTION
                    </Button>
                </Card>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { backgroundColor: '#1b2142' },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    headerSubtitle: { color: '#adb5bd', fontSize: 12 },
    scrollContent: { padding: 20 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#495057', marginBottom: 15, textTransform: 'uppercase' },
    formCard: { padding: 20, borderRadius: 15, elevation: 4, backgroundColor: '#fff' },
    input: { marginBottom: 15, backgroundColor: '#fff' },
    ratioInput: { backgroundColor: '#e9ecef' }, // Gray background for disabled field
    ratioContainer: { marginBottom: 20 },
    helperText: { fontSize: 11, color: '#6c757d', fontStyle: 'italic', marginTop: -10, marginLeft: 5 },
    submitButton: { backgroundColor: '#1b2142', paddingVertical: 8, borderRadius: 10 },
    btnLabel: { fontSize: 16, fontWeight: 'bold' }
});

export default InterceptionScreen;
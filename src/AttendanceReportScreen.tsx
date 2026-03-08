import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Text, Appbar, Button, Card, List } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import { DatePickerModal, en, registerTranslation } from 'react-native-paper-dates';
import API from './api/API.js';

registerTranslation('en', en);

// FIXED: Is function ko ab foolproof bana diya hai
const formatDateData = (dateInput: any) => {
    // Agar dateInput empty ya undefined hai
    if (!dateInput) return "N/A";

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    try {
        // Step 1: Agar Input Date Object hai (From/To Date picker se)
        if (dateInput instanceof Date) {
            const m = months[dateInput.getMonth()];
            const d = String(dateInput.getDate()).padStart(2, '0');
            const y = dateInput.getFullYear();
            return `${m} ${d}, ${y}`;
        }

        // Step 2: Backend String Handling (e.g., "2026-03-01" ya "2026-03-01T00:00:00Z")
        // Pehle sirf date wala hissa alag karein (T se pehle wala)
        const pureDateString = dateInput.toString().split('T')[0];

        // Dash (-) ya Slash (/) se split karein
        const parts = pureDateString.includes('-') ? pureDateString.split('-') : pureDateString.split('/');

        if (parts.length === 3) {
            // YYYY-MM-DD format check
            if (parts[0].length === 4) {
                const year = parts[0];
                const month = months[parseInt(parts[1], 10) - 1];
                const day = parts[2].padStart(2, '0');
                if (month) return `${month} ${day}, ${year}`;
            }
            // DD-MM-YYYY format check
            else if (parts[2].length === 4) {
                const year = parts[2];
                const month = months[parseInt(parts[1], 10) - 1];
                const day = parts[0].padStart(2, '0');
                if (month) return `${month} ${day}, ${year}`;
            }
        }
    } catch (e) {
        return dateInput; // Error ki surat mein original bhej do
    }

    return dateInput;
};

const AttendanceReport = ({ navigation }: any) => {
    const [loading, setLoading] = useState(false);
    const [team, setTeam] = useState<any[]>([]);
    const [selectedBaId, setSelectedBaId] = useState<any>(null);
    const [status, setStatus] = useState('both');
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [showFrom, setShowFrom] = useState(false);
    const [showTo, setShowTo] = useState(false);
    const [reportData, setReportData] = useState<any[]>([]);
    const statusOptions = [
        { label: 'Both', value: 'both' }, // Naya option
        { label: 'Present', value: 'present' },
        { label: 'Absent', value: 'absent' }
    ];

    useEffect(() => { fetchTeam(); }, []);

    const fetchTeam = async () => {
        try {
            const response = await API.get('/users/my-team');
            if (response.data.success) {
                setTeam(response.data.data);
                if (response.data.data.length > 0) setSelectedBaId(response.data.data[0].id);
            }
        } catch (error) { Alert.alert("Error", "Could not load team list"); }
    };

    const generateReport = async () => {
        if (!selectedBaId) return Alert.alert("Wait", "Please select a BA first");
        setLoading(true);
        const fDateStr = fromDate.toISOString().split('T')[0];
        const tDateStr = toDate.toISOString().split('T')[0];
        try {
            const endpoint = `/reports/sale-executive-report?fromDate=${fDateStr}&toDate=${tDateStr}&ba_id=${selectedBaId}&status=${status}`;
            const response = await API.get(endpoint);
            if (response.data.success) setReportData(response.data.data);
        } catch (error) { Alert.alert("Error", "Failed to fetch report"); }
        finally { setLoading(false); }
    };

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
                <Appbar.Content title="Attendance Report" titleStyle={{ color: 'white' }} />
            </Appbar.Header>

            <ScrollView style={styles.content}>
                <Card style={styles.filterCard}>
                    <Text style={styles.label}>Select Person</Text>
                    <Dropdown
                        style={styles.dropdown}
                        data={team}
                        labelField="label"
                        valueField="id"
                        placeholder="Choose BA / Staff"
                        value={selectedBaId}
                        onChange={item => setSelectedBaId(item.id)}
                        selectedTextStyle={styles.dropdownSelectedText}
                        itemTextStyle={styles.dropdownItemText}
                        containerStyle={styles.dropdownContainer}
                    />

                    <Text style={styles.label}>Attendance Status</Text>
                    <Dropdown
                        style={styles.dropdown}
                        data={statusOptions}
                        labelField="label"
                        valueField="value"
                        value={status}
                        onChange={item => setStatus(item.value)}
                        selectedTextStyle={styles.dropdownSelectedText}
                        itemTextStyle={styles.dropdownItemText}
                        containerStyle={styles.dropdownContainer}
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 5 }}>
                            <Text style={styles.label}>From Date</Text>
                            <TouchableOpacity onPress={() => setShowFrom(true)} style={styles.datePickerBtn}>
                                {/* FIXED: Picker ke andar bhi formatted date dikhegi */}
                                <Text style={styles.dateTextValue}>{formatDateData(fromDate)}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1, marginLeft: 5 }}>
                            <Text style={styles.label}>To Date</Text>
                            <TouchableOpacity onPress={() => setShowTo(true)} style={styles.datePickerBtn}>
                                <Text style={styles.dateTextValue}>{formatDateData(toDate)}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Button mode="contained" onPress={generateReport} loading={loading} disabled={loading} style={styles.generateBtn}>
                        GENERATE ATTENDANCE
                    </Button>
                </Card>

                {loading ? (
                    <ActivityIndicator color="#1b2142" size="large" style={{ marginTop: 30 }} />
                ) : (
                    (() => {
                        // 1. Filter logic as per your requirement
                        const filteredData = reportData.filter((day) => {
                            if (status === 'both') {
                                return true; // Sab kuch dikhao (Present, Absent, Null, Undefined)
                            }

                            if (status === 'present') {
                                // Sirf wo jinka status "present" ho
                                return day.attendance?.status?.toLowerCase() === 'present';
                            }

                            if (status === 'absent') {
                                // Sirf wo jinka status "absent" ho
                                return day.attendance?.status?.toLowerCase() === 'absent';
                            }

                            return true;
                        });

                        // 2. Empty check
                        if (filteredData.length === 0) {
                            return (
                                <Card style={{ padding: 20, marginTop: 20, borderRadius: 10, alignItems: 'center' }}>
                                    <List.Icon icon="database-off" color="#95a5a6" />
                                    <Text style={{ color: '#7f8c8d', fontSize: 14, fontWeight: '500' }}>
                                        No {status} records found.
                                    </Text>
                                </Card>
                            );
                        }

                        // 3. Render list
                        return filteredData.map((day, index) => (
                            <View key={index} style={styles.dayWrapper}>
                                <View style={styles.dateBanner}>
                                    <Text style={styles.dateBannerText}>{formatDateData(day.date)}</Text>
                                </View>
                                <Card style={styles.dayCard}>
                                    <List.Item
                                        title="Attendance Status"
                                        description={
                                            day.attendance
                                                ? `${day.attendance.status} - Time: ${day.attendance.time}`
                                                : "No Record"
                                        }
                                        titleStyle={{ fontSize: 14, fontWeight: 'bold' }}
                                        left={props => {
                                            // Status ke mutabiq icon aur color
                                            let iconName = "help-circle-outline";
                                            let iconColor = "#95a5a6"; // Default for null

                                            if (day.attendance?.status?.toLowerCase() === 'present') {
                                                iconName = "account-check";
                                                iconColor = "#2ecc71";
                                            } else if (day.attendance?.status?.toLowerCase() === 'absent') {
                                                iconName = "account-off";
                                                iconColor = "#e74c3c";
                                            }

                                            return <List.Icon {...props} icon={iconName} color={iconColor} />;
                                        }}
                                    />
                                </Card>
                            </View>
                        ));
                    })()
                )}
            </ScrollView>

            <DatePickerModal locale="en" mode="single" visible={showFrom} onDismiss={() => setShowFrom(false)} date={fromDate} onConfirm={(params: any) => { setShowFrom(false); if (params.date) setFromDate(params.date); }} />
            <DatePickerModal locale="en" mode="single" visible={showTo} onDismiss={() => setShowTo(false)} date={toDate} onConfirm={(params: any) => { setShowTo(false); if (params.date) setToDate(params.date); }} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    header: { backgroundColor: '#1b2142' },
    content: { padding: 12 },
    filterCard: { padding: 15, borderRadius: 15, marginBottom: 20, elevation: 5, backgroundColor: '#fff' },
    label: { fontSize: 11, fontWeight: 'bold', color: '#7f8c8d', marginBottom: 6, textTransform: 'uppercase' },
    dropdown: { height: 48, color: '#000', borderColor: '#dcdde1', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, marginBottom: 15 },
    dropdownSelectedText: { fontSize: 14, color: '#000' },
    dropdownItemText: { fontSize: 14, color: '#000' },
    dropdownContainer: { borderRadius: 10, backgroundColor: '#fff' },
    row: { flexDirection: 'row', marginBottom: 18 },
    datePickerBtn: { height: 48, borderColor: '#dcdde1', borderWidth: 1, borderRadius: 10, justifyContent: 'center', paddingHorizontal: 12, backgroundColor: '#fff' },
    dateTextValue: { fontSize: 14, color: '#2f3640' },
    generateBtn: { backgroundColor: '#1b2142', borderRadius: 10, paddingVertical: 6 },
    dayWrapper: { marginBottom: 20 },
    dateBanner: { backgroundColor: '#1b2142', padding: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
    dateBannerText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    dayCard: { borderTopLeftRadius: 0, borderTopRightRadius: 0, borderRadius: 10, elevation: 3 }
});

export default AttendanceReport;
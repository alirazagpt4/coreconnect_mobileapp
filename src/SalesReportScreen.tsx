import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Text, Appbar, Button, Card, Divider, List } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import { DatePickerModal, en, registerTranslation } from 'react-native-paper-dates';
import API from './api/API.js';

registerTranslation('en', en);

const statusOptions = [
    { label: 'Both (All Records)', value: 'both' }, // Naya option
    { label: 'Present', value: 'present' },
    { label: 'Absent', value: 'absent' }
];

const formatDateData = (dateInput: any) => {
    if (!dateInput) return "N/A";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    try {
        if (dateInput instanceof Date) {
            const m = months[dateInput.getMonth()];
            const d = String(dateInput.getDate()).padStart(2, '0');
            const y = dateInput.getFullYear();
            return `${m} ${d}, ${y}`;
        }

        const pureDateString = dateInput.toString().split('T')[0];
        const parts = pureDateString.includes('-') ? pureDateString.split('-') : pureDateString.split('/');

        if (parts.length === 3) {
            if (parts[0].length === 4) { // YYYY-MM-DD
                const month = months[parseInt(parts[1], 10) - 1];
                return `${month} ${parts[2].padStart(2, '0')}, ${parts[0]}`;
            } else if (parts[2].length === 4) { // DD-MM-YYYY
                const month = months[parseInt(parts[1], 10) - 1];
                return `${month} ${parts[0].padStart(2, '0')}, ${parts[2]}`;
            }
        }
    } catch (e) {
        return dateInput;
    }
    return dateInput;
};

const SalesReportScreen = ({ navigation }: any) => {
    const [loading, setLoading] = useState(false);
    const [team, setTeam] = useState<any[]>([]);
    const [selectedBaId, setSelectedBaId] = useState<any>(null);
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [showFrom, setShowFrom] = useState(false);
    const [showTo, setShowTo] = useState(false);
    const [reportData, setReportData] = useState<any[]>([]);

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
            const endpoint = `/reports/sale-executive-report?fromDate=${fDateStr}&toDate=${tDateStr}&ba_id=${selectedBaId}`;
            const response = await API.get(endpoint);
            if (response.data.success) setReportData(response.data.data);
        } catch (error) { Alert.alert("Error", "Failed to fetch report"); }
        finally { setLoading(false); }
    };

    const formatPrice = (num: any) => {
        const val = parseFloat(num);
        // Agar number valid nahi hai toh 0 dikhao, warna round figure (bina decimal ke)
        if (isNaN(val)) return "0";

        // toLocaleString use kar rahe hain taake 1000 se upar ho toh comma (e.g. 1,500) aaye
        return Math.round(val).toLocaleString('en-US');
    };

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
                <Appbar.Content title="Sales Report" titleStyle={{ color: 'white' }} />
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
                        placeholderStyle={{ fontSize: 14, color: '#aaa' }}
                        selectedTextStyle={styles.dropdownSelectedText}
                        itemTextStyle={styles.dropdownItemText}
                        containerStyle={styles.dropdownContainer}
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 5 }}>
                            <Text style={styles.label}>From Date</Text>
                            <TouchableOpacity onPress={() => setShowFrom(true)} style={styles.datePickerBtn}>
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
                        GENERATE SALES REPORT
                    </Button>
                </Card>

                {loading ? (
                    <ActivityIndicator color="#1b2142" size="large" style={{ marginTop: 30 }} />
                ) : (
                    reportData.length === 0 ? (
                        // Case 1: Agar backend se empty array aaya
                        <Card style={styles.noDataCard}>
                            <List.Icon icon="database-off" color="#95a5a6" />
                            <Text style={styles.noDataText}>No sales record found between these dates.</Text>
                        </Card>
                    ) : (
                        // Case 2: Agar data hai toh map karo
                        reportData.map((day, index) => (
                            <View key={index} style={styles.dayWrapper}>
                                <View style={styles.dateBanner}>
                                    <Text style={styles.dateBannerText}> {formatDateData(day.date)}</Text>
                                </View>
                                <Card style={styles.dayCard}>
                                    <View style={styles.salesPadding}>
                                        <View style={styles.sectionHeaderRow}>
                                            <List.Icon icon="cart-outline" color="#000" style={{ margin: 4, padding: 0 }} />
                                            <Text style={styles.salesSectionTitle}> Daily Sales</Text>
                                        </View>
                                        {day.sales && day.sales.length > 0 ? (
                                            day.sales.map((sale: any, sIdx: number) => {
                                                // --- FRONTEND CALCULATION ---
                                                // Yahan hum manually total nikaal rahe hain
                                                let totalQty = 0;
                                                let totalAmount = 0;

                                                if (sale.items && sale.items.length > 0) {
                                                    sale.items.forEach((item: any) => {
                                                        totalQty += parseInt(item.qty) || 0;
                                                        totalAmount += parseFloat(item.total) || 0;
                                                    });
                                                }

                                                return (
                                                    <View key={sIdx} style={styles.storeBlock}>
                                                        <Text style={styles.storeLabel}>Store: <Text style={{ color: '#1b2142' }}>{sale.store}</Text></Text>

                                                        {sale.items.map((item: any, iIdx: number) => (
                                                            <View key={iIdx} style={styles.productRow}>
                                                                <Text style={styles.productName}>{item.product} (x{item.qty})</Text>
                                                                <Text style={styles.productPrice}>{formatPrice(item.total)}</Text>
                                                            </View>
                                                        ))}

                                                        {/* --- DISPLAY TOTAL QTY & AMOUNT --- */}
                                                        <View style={styles.storeTotalLine}>
                                                            <View>
                                                                <Text style={styles.storeTotalText}>Total Qty</Text>
                                                                <Text style={styles.qtyAmount}>{totalQty} Units</Text>
                                                            </View>
                                                            <View style={{ alignItems: 'flex-end' }}>
                                                                <Text style={styles.storeTotalText}>Total Value</Text>
                                                                <Text style={styles.storeTotalAmount}>RS. {formatPrice(totalAmount)}</Text>
                                                            </View>
                                                        </View>

                                                        {sIdx < day.sales.length - 1 && <Divider style={{ marginVertical: 12 }} />}
                                                    </View>
                                                );
                                            })
                                        ) : (
                                            <Text style={styles.emptySalesText}>No sales reported for this date.</Text>
                                        )}
                                    </View>
                                </Card>
                            </View>
                        ))
                    )
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
    dropdown: { height: 48, color: '#464647ff', borderColor: '#dcdde1', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, marginBottom: 15 },
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
    dayCard: { borderTopLeftRadius: 0, borderTopRightRadius: 0, borderRadius: 10, elevation: 3 },
    salesPadding: { padding: 15 },
    sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginLeft: - 2 },
    salesSectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1b2142', marginBottom: 12, letterSpacing: 1 },
    storeBlock: { marginBottom: 5 },
    storeLabel: { fontSize: 13, fontWeight: 'bold', color: '#7f8c8d', marginBottom: 8 },
    productRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    productName: { fontSize: 12, color: '#353b48', flex: 2.5 },
    productPrice: { fontSize: 12, color: '#353b48', flex: 1, textAlign: 'right', fontWeight: '500' },
    storeTotalLine: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, backgroundColor: '#f9f9f9', padding: 8, borderRadius: 5 },
    storeTotalText: { fontSize: 12, fontWeight: 'bold', color: '#7f8c8d' },
    storeTotalAmount: { fontSize: 13, fontWeight: 'bold', color: '#27ae60' },
    emptySalesText: { fontSize: 12, color: '#95a5a6', fontStyle: 'italic', textAlign: 'center', marginVertical: 10 }
    , noDataCard: {
        padding: 30,
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        backgroundColor: '#fff',
        elevation: 2
    },
    noDataText: {
        fontSize: 14,
        color: '#7f8c8d',
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 10
    },
    qtyAmount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#27ae60', // Dark blue theme color
    }
});

export default SalesReportScreen;
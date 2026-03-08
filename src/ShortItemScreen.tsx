import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Appbar, Button, Card, IconButton } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import API from './api/API.js';

const ShortItemScreen = ({ navigation }: any) => {
    const [profile, setProfile] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [selectedCat, setSelectedCat] = useState<any>(null);
    const [selectedSubCat, setSelectedSubCat] = useState<any>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [shortItemsList, setShortItemsList] = useState<any[]>([]);

    // 1. Load Initial Data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const profileRes = await API.get('/users/profile');
                if (profileRes.data && profileRes.data.profile) {
                    setProfile(profileRes.data.profile);
                }

                const catRes = await API.get('/category');
                const categoriesData = catRes.data.data || catRes.data;
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            } catch (e) {
                console.log("Init Error:", e);
            }
        };
        fetchInitialData();
    }, []);

    // 2. Fetch Sub-Categories
    const handleCategoryChange = async (catId: number) => {
        setSelectedCat(catId);
        setSelectedSubCat(null);
        setProducts([]);
        setSubCategories([]);
        try {
            const res = await API.get(`/subCategory/${catId}`);
            let data = Array.isArray(res.data) ? res.data : (res.data.subcategories || []);
            setSubCategories(data);
        } catch (e) {
            setSubCategories([]);
        }
    };

    // 3. Fetch Products
    const handleSubCatChange = async (subId: number) => {
        setSelectedSubCat(subId);
        setSelectedProduct(null);
        setProducts([]);
        try {
            const res = await API.get(`/items/${subId}`);
            let data = Array.isArray(res.data.data) ? res.data.data : [];
            setProducts(data);
        } catch (e) {
            setProducts([]);
        }
    };

    // 4. Add to Short List
    const addItemToList = () => {
        if (!selectedProduct) return Alert.alert("Wait", "Please select a product first");

        // Duplicate check
        const exists = shortItemsList.find(i => i.item_id === selectedProduct.id);
        if (exists) return Alert.alert("Note", "This item is already in the list");

        const newItem = {
            item_id: selectedProduct.id,
            product_name: selectedProduct.product_name || selectedProduct.name,
        };
        setShortItemsList([...shortItemsList, newItem]);
        setSelectedProduct(null); // Reset product dropdown after add
    };

    // 5. Submit Report
    const handleSubmitShortItems = async () => {
        if (shortItemsList.length === 0) {
            return Alert.alert("Error", "List khali hai, kam az kam ek item toh add karein!");
        }

        setLoading(true);
        const payload = {
            store_id: profile?.assigned_stores?.[0]?.id || 2,
            ba_user_id: profile?.id || 10, // Profile se ID uthayi
            report_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            items: shortItemsList.map(item => ({
                item_id: item.item_id,
                product_name: item.product_name
            }))
        };

        try {
            const res = await API.post('/shortitems/create-short-items', payload);

            if (res.data.success) {
                Alert.alert("Success", "Short items report submitted successfully!");
                navigation.goBack();
            } else {
                Alert.alert("Failed", res.data.message || "Kuch masla hua hai.");
            }
        } catch (e) {
            console.log("Submit Error:", e);
            Alert.alert("Error", "Server connection failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
                <Appbar.Content
                    title={
                        <View>
                            <Text style={styles.headerTitle}>Short Items</Text>
                            <Text style={styles.headerSubtitle}>{profile?.assigned_stores?.[0]?.store_name || "Store"}</Text>
                        </View>
                    }
                />
            </Appbar.Header>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>SELECT SHORT ITEMS</Text>

                <Card style={styles.formCard}>
                    <View style={styles.row}>
                        <Dropdown
                            style={[styles.dropdown, { flex: 1, marginRight: 5 }]}
                            placeholderStyle={styles.dropdownPlaceholder}
                            selectedTextStyle={styles.dropdownSelectedText}
                            itemTextStyle={styles.dropdownItemText}
                            containerStyle={styles.dropdownContainer}
                            data={categories}
                            labelField="category_name"
                            valueField="id"
                            placeholder="Category"
                            value={selectedCat}
                            onChange={item => handleCategoryChange(item.id)}
                        />
                        <Dropdown
                            style={[styles.dropdown, { flex: 1 }]}
                            placeholderStyle={styles.dropdownPlaceholder}
                            selectedTextStyle={styles.dropdownSelectedText}
                            itemTextStyle={styles.dropdownItemText}
                            containerStyle={styles.dropdownContainer}
                            data={subCategories}
                            labelField="subcategory_name"
                            valueField="id"
                            placeholder="Sub-Cat"
                            value={selectedSubCat}
                            onChange={item => handleSubCatChange(item.id)}
                        />
                    </View>

                    <Dropdown
                        style={[styles.dropdown, { marginTop: 10 }]}
                        placeholderStyle={styles.dropdownPlaceholder}
                        selectedTextStyle={styles.dropdownSelectedText}
                        itemTextStyle={styles.dropdownItemText}
                        containerStyle={styles.dropdownContainer}
                        data={products}
                        labelField="product_name"
                        valueField="id"
                        placeholder="Select Product"
                        value={selectedProduct?.id}
                        onChange={item => setSelectedProduct(item)}
                    />

                    <Button
                        mode="contained"
                        onPress={addItemToList}
                        style={styles.addButton}
                        icon="plus"
                    >
                        ADD TO SHORT ITEM LIST
                    </Button>
                </Card>

                <View style={styles.listSection}>
                    <Text style={styles.sectionTitle}>📝 ITEMS TO CART ({shortItemsList.length})</Text>
                    <View style={styles.listCard}>
                        {shortItemsList.length === 0 ? (
                            <Text style={styles.emptyText}>No items added yet</Text>
                        ) : (
                            shortItemsList.map((item, index) => (
                                <View key={index} style={styles.listItem}>
                                    <Text style={styles.itemText}>{index + 1}. {item.product_name}</Text>
                                    <IconButton
                                        icon="delete-outline"
                                        size={20}
                                        iconColor="#ff5252"
                                        onPress={() => {
                                            const newList = [...shortItemsList];
                                            newList.splice(index, 1);
                                            setShortItemsList(newList);
                                        }}
                                    />
                                </View>
                            ))
                        )}
                    </View>
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    mode="contained"
                    onPress={handleSubmitShortItems}
                    loading={loading}
                    disabled={loading}
                    style={styles.submitButton}
                >
                    SUBMIT SHORT ITEMS REPORT
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { backgroundColor: '#1b2142', height: 55 },
    headerTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    headerSubtitle: { color: '#adb5bd', fontSize: 11 },
    scrollView: { flex: 1 },
    scrollContent: { padding: 12 },
    sectionTitle: { fontSize: 12, fontWeight: '700', color: '#495057', marginBottom: 8, textTransform: 'uppercase', marginTop: 10 },
    formCard: { padding: 12, borderRadius: 12, backgroundColor: '#fff', elevation: 2 },
    row: { flexDirection: 'row' },
    dropdown: { height: 45, borderColor: '#dee2e6', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, backgroundColor: '#fff' },
    dropdownPlaceholder: { fontSize: 13, color: '#adb5bd' },
    dropdownSelectedText: { fontSize: 13, color: '#212529' },
    dropdownItemText: { fontSize: 14, color: '#212529' },
    dropdownContainer: { borderRadius: 8 },
    addButton: { backgroundColor: '#1b2142', borderRadius: 8, marginTop: 15 },
    listSection: { marginTop: 20 },
    listCard: { backgroundColor: '#fff', borderRadius: 12, elevation: 1, overflow: 'hidden' },
    listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 15, borderBottomWidth: 1, borderBottomColor: '#f8f9fa' },
    itemText: { fontSize: 14, color: '#212529', fontWeight: '500', flex: 1 },
    emptyText: { textAlign: 'center', padding: 30, color: '#adb5bd' },
    footer: { backgroundColor: '#fff', padding: 15, paddingBottom: 30, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 20 },
    submitButton: { borderRadius: 12, height: 52, backgroundColor: '#1b2142', justifyContent: 'center' }
});

export default ShortItemScreen;
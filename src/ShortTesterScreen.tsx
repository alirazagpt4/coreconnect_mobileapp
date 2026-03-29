import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Appbar, Button, Card, IconButton, Divider } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import API from './api/API.js';
import { useToast } from './context/ToastContext';

const ShortTesterScreen = ({ navigation }: any) => {
    const toast = useToast();
    const [profile, setProfile] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [selectedCat, setSelectedCat] = useState<any>(null);
    const [selectedSubCat, setSelectedSubCat] = useState<any>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [testerList, setTesterList] = useState<any[]>([]);

    // 1. Load Initial Data (Profile & Categories)
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

    // 4. Add to List
    const addItemToList = () => {
        if (!selectedProduct) return toast.showToast("Please select a product first");

        const exists = testerList.find(i => i.item_id === selectedProduct.id);
        if (exists) return toast.showToast("This item is already in the list");

        const newItem = {
            item_id: selectedProduct.id,
            product_name: selectedProduct.product_name || selectedProduct.name,
        };
        toast.showToast("Item added to list");
        setTesterList([...testerList, newItem]);
        setSelectedProduct(null);
    };

    // 5. Submit Report
    const handleSubmit = async () => {
        if (testerList.length === 0) {
            return toast.showToast("Please add item to the list!");
        }

        setLoading(true);
        const payload = {
            store_id: profile?.assigned_stores?.[0]?.id || 2,
            ba_user_id: profile?.id || 10,
            report_date: new Date().toISOString().split('T')[0],
            items: testerList.map(item => ({
                item_id: item.item_id,
                product_name: item.product_name
            }))
        };

        try {
            const res = await API.post('/shorttesters/create-testers', payload);
            if (res.data.success) {
                toast.showToast("Tester report submitted successfully!");
                setTimeout(() => { navigation.goBack(); }, 2000);
            } else {
                toast.showToast(res.data.message || "Something went wrong.");
            }
        } catch (e) {
            toast.showToast("Server connection failed.");
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
                            <Text style={styles.headerTitle}>Short Testers</Text>
                            <Text style={styles.headerSubtitle}>{profile?.assigned_stores?.[0]?.store_name || "Store"}</Text>
                        </View>
                    }
                />
            </Appbar.Header>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>SELECT TESTER ITEMS</Text>

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
                        inputSearchStyle={styles.inputSearchStyle}
                        search
                        searchPlaceholder="Search product..."
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
                        ADD TO TESTER LIST
                    </Button>
                </Card>

                <View style={styles.listSection}>
                    <Text style={styles.sectionTitle}>📝 ITEMS TO CART ({testerList.length})</Text>
                    <View style={styles.listCard}>
                        {testerList.length === 0 ? (
                            <Text style={styles.emptyText}>No items added yet</Text>
                        ) : (
                            testerList.map((item, index) => (
                                <View key={index} style={styles.listItem}>
                                    <Text style={styles.itemText}>{index + 1}. {item.product_name}</Text>
                                    <IconButton
                                        icon="delete-outline"
                                        size={20}
                                        iconColor="#ff5252"
                                        onPress={() => {
                                            const newList = [...testerList];
                                            newList.splice(index, 1);
                                            setTesterList(newList);
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
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={loading}
                    style={styles.submitButton}
                >
                    SUBMIT TESTER
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
    inputSearchStyle: { height: 40, fontSize: 14, borderRadius: 8, color: '#000' },
    addButton: { backgroundColor: '#1b2142', borderRadius: 8, marginTop: 15 },
    listSection: { marginTop: 20 },
    listCard: { backgroundColor: '#fff', borderRadius: 12, elevation: 1, overflow: 'hidden' },
    listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 15, borderBottomWidth: 1, borderBottomColor: '#f8f9fa' },
    itemText: { fontSize: 14, color: '#212529', fontWeight: '500', flex: 1 },
    emptyText: { textAlign: 'center', padding: 30, color: '#adb5bd' },
    footer: { backgroundColor: '#fff', padding: 15, paddingBottom: 30, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 20 },
    submitButton: { borderRadius: 12, height: 52, backgroundColor: '#1b2142', justifyContent: 'center' }
});

export default ShortTesterScreen;
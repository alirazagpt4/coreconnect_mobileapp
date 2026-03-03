import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Appbar, TextInput, Button, Card, List, Divider, IconButton } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import API from './api/API.js';

const CreateSaleScreen = ({ navigation }: any) => {
    const [profile, setProfile] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [selectedCat, setSelectedCat] = useState<any>(null);
    const [selectedSubCat, setSelectedSubCat] = useState<any>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [quantity, setQuantity] = useState('');
    const [cart, setCart] = useState<any[]>([]);


    // 1. Load Profile & Categories
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const profileRes = await API.get('/users/profile');
                // Ensure data exists before setting
                if (profileRes.data && profileRes.data.profile) {
                    const profileData = profileRes.data.profile;
                    setProfile({ ...profileData });
                }

                const catRes = await API.get('/category');
                // Check if categories are in 'data' field or direct array
                const categoriesData = catRes.data.data || catRes.data;
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            } catch (e) {
                console.log("Init Error:", e);
            }
        };
        fetchInitialData();
    }, []);

    // 2. Fetch Sub-Categories (Safe way to prevent spread error)
    const handleCategoryChange = async (catId: number) => {
        setSelectedCat(catId);
        setSelectedSubCat(null);
        setProducts([]);
        setSubCategories([]); // Pehle purana data saaf karein
        try {
            const res = await API.get(`/subCategory/${catId}`);
            // Agar data direct array nahi hai toh crash hota hai. Hum isay check karenge:
            let data = [];
            if (Array.isArray(res.data)) {
                data = res.data;
            } else if (res.data && Array.isArray(res.data.subcategories)) {
                data = res.data.subcategories;
            }
            setSubCategories(data);
        } catch (e) {
            console.log("SubCat Fetch Error:", e);
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
            console.log("productsss...", res.data.data);
            let data = [];
            if (Array.isArray(res.data.data)) {
                data = res.data.data;
            } else if (res.data.data && Array.isArray(res.data.data)) {
                data = res.data.data;
            }
            setProducts(data);
        } catch (e) {
            console.log("Items Fetch Error:", e);
            setProducts([]);
        }
    };

    const addToCart = () => {
        if (!selectedProduct || !quantity) return Alert.alert("Wait", "Select product & quantity");
        const newItem = {
            item_id: selectedProduct.id,
            product_name: selectedProduct.product_name || selectedProduct.name,
            quantity: parseInt(quantity),
            price: parseFloat(selectedProduct.price_after_discount || 0),
            total: parseInt(quantity) * parseFloat(selectedProduct.price_after_discount || 0)
        };
        setCart([...cart, newItem]);
        setQuantity('');
    };

    const calculateGrandTotal = () => {
        return cart.reduce((sum, item) => sum + item.total, 0).toFixed(2);
    };




    const handleCreateSale = async () => {
        if (cart.length === 0) {
            return Alert.alert("Error", "Bhai, pehle cart mein kuch add toh kar lo!");
        }

        const payload = {
            // Profile API se store ID uthayi
            store_id: profile?.assigned_stores?.[0]?.id || 2,
            total_amount: parseFloat(calculateGrandTotal()),
            items: cart.map(item => ({
                item_id: item.item_id,
                product_name: item.product_name,
                quantity: item.quantity,
                price: item.price
            }))
        };

        try {
            const res = await API.post('/sales/create-sale', payload);

            if (res.data.success) {
                Alert.alert("Success", "Sale created successfully ");

                // --- SAB KUCH KHALI KARO (RESET) ---
                setCart([]);             // Cart khali ho gayi
                setSelectedCat(null);    // Category dropdown reset
                setSelectedSubCat(null); // Sub-category dropdown reset
                setSelectedProduct(null);// Product dropdown reset
                setQuantity('');         // Quantity field khali
                setSubCategories([]);    // Sub-category ki list clear
                setProducts([]);         // Products ki list clear

                // Agar aap chahte hain screen band ho jaye:
                navigation.goBack();

            } else {
                Alert.alert("Failed", res.data.message || "Kuch masla hua hai.");
            }
        } catch (e) {
            console.log("Sale Error:", e);
            Alert.alert("Error", "Server ka masla hai, dobara try karein.");
        }
    };




    return (
        <View style={styles.container}>
            {/* Header with Safe Chaining */}
            <Appbar.Header style={{ backgroundColor: '#1b2142' }}>
                <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
                <Appbar.Content
                    // Fullname check karein, agar null hai toh name dikhayein
                    title={
                        <View>
                            {/* Title: User Name */}
                            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                                {profile?.fullname || profile?.name || "Loading..."}
                            </Text>

                            {/* Subtitle: Store Name (Custom rendered) */}
                            {profile?.assigned_stores?.length > 0 && (
                                <Text style={{ color: '#bbc7c5ff', fontSize: 12, fontWeight: '500' }}>
                                    Store: {profile.assigned_stores[0].store_name}
                                </Text>
                            )}
                        </View>
                    }
                />

            </Appbar.Header>

            <ScrollView style={styles.content}>
                <Text style={styles.sectionTitle}> ADD NEW ITEM</Text>
                <Card style={styles.formCard}>
                    <Text style={styles.label}>Category</Text>
                    <Dropdown
                        style={styles.dropdown}
                        data={categories}
                        labelField="category_name" // Aapke console log ke mutabiq
                        valueField="id"
                        placeholder="Select Category"
                        value={selectedCat}
                        onChange={item => handleCategoryChange(item.id)}
                    />

                    <Text style={styles.label}>Sub-Category</Text>
                    <Dropdown
                        style={styles.dropdown}
                        data={subCategories}
                        labelField="subcategory_name" // Agar sub-cat show na ho toh "subcategory_name" try karein
                        valueField="id"
                        placeholder="Select Sub-Cat"
                        value={selectedSubCat}
                        onChange={item => handleSubCatChange(item.id)}
                    />

                    <Text style={styles.label}>Product</Text>
                    <Dropdown
                        style={styles.dropdown}
                        data={products}
                        labelField="product_name" // Items API mein aksar "item_name" hota hai
                        valueField="id"
                        placeholder="Select Product"
                        value={selectedProduct?.id}
                        onChange={item => setSelectedProduct(item)}
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Unit Price</Text>
                            <Text style={styles.priceValue}>PKR {selectedProduct?.price_after_discount || 0}</Text>
                        </View>
                        <TextInput
                            label="Qty"
                            value={quantity}
                            onChangeText={setQuantity}
                            keyboardType="numeric"
                            style={styles.qtyInput}
                            mode="outlined"
                        />
                    </View>

                    <Button mode="contained" onPress={addToCart} style={styles.addButton}>
                        + ADD TO LIST
                    </Button>
                </Card>

                {/* List showing added items */}
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}> CURRENT CART ({cart.length})</Text>
                {cart.map((item, index) => (
                    <List.Item
                        key={index}
                        title={item.product_name}
                        description={`Qty: ${item.quantity} | Total: ${item.total}`}
                        right={() => <IconButton icon="delete" onPress={() => {
                            const nc = [...cart]; nc.splice(index, 1); setCart(nc);
                        }} />}
                    />
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <Text style={styles.totalText}>GRAND TOTAL: PKR {calculateGrandTotal()}</Text>
                <Button
                    mode="contained"

                    onPress={handleCreateSale}
                    loading={loading}
                    disabled={loading}

                    style={styles.submitButton}
                >
                    SUBMIT & CREATE SALE
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 15 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1b2142' },
    formCard: { padding: 15, backgroundColor: '#f8f9fa', borderRadius: 10, elevation: 2 },
    label: { fontSize: 12, color: '#666', marginTop: 10 },
    dropdown: { height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, backgroundColor: '#fff', marginTop: 5 },
    row: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
    priceValue: { fontSize: 18, fontWeight: 'bold', color: '#1b2142' },
    qtyInput: { width: 80, height: 45, marginLeft: 20 },
    addButton: { marginTop: 20, backgroundColor: '#2ecc71' },
    footer: { padding: 15, borderTopWidth: 1, borderTopColor: '#eee' },
    totalText: { fontSize: 18, fontWeight: 'bold', textAlign: 'right', marginBottom: 10 },
    submitButton: { backgroundColor: '#1b2142' }
});

export default CreateSaleScreen;
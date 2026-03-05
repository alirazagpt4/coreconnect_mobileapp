import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Appbar, TextInput, Button, Card, List, Divider, IconButton } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import API from './api/API.js';

const formatNumber = (num: any) => {
    if (!num) return "0";
    return parseFloat(num).toLocaleString('en-US');
};

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
            <Appbar.Header style={styles.header}>
                <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
                <Appbar.Content
                    title={
                        <View>
                            <Text style={styles.headerTitle}>{profile?.fullname || "Ayesha"}</Text>
                            <Text style={styles.headerSubtitle}>{profile?.assigned_stores?.[0]?.store_name || "Store"}</Text>
                        </View>
                    }
                />
            </Appbar.Header>

            {/* ScrollView flex: 1 rahega lekin content container ko tight rakhenge */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.sectionTitle}>📦 ADD NEW ITEM</Text>

                <Card style={styles.formCard}>
                    <View style={styles.row}>
                        <Dropdown
                            style={[styles.dropdown, { flex: 1, marginRight: 5 }]}
                            placeholderStyle={styles.dropdownPlaceholder}
                            selectedTextStyle={styles.dropdownSelectedText}
                            // --- YE DO LINES ADD KAREIN ---
                            itemTextStyle={styles.dropdownItemText}
                            containerStyle={styles.dropdownContainer}
                            activeColor='#b5b5b6ff'
                            data={categories}
                            labelField="category_name"
                            valueField="id"
                            placeholder="Category"
                            value={selectedCat}
                            onChange={item => handleCategoryChange(item.id)}
                        />
                        <Dropdown
                            style={[styles.dropdown, { flex: 1, marginRight: 5 }]}
                            placeholderStyle={styles.dropdownPlaceholder}
                            selectedTextStyle={styles.dropdownSelectedText}
                            // --- YE DO LINES ADD KAREIN ---
                            itemTextStyle={styles.dropdownItemText}
                            containerStyle={styles.dropdownContainer}
                            activeColor='#b5b5b6ff'
                            data={subCategories}
                            labelField="subcategory_name"
                            valueField="id"
                            placeholder="Sub-Cat"
                            value={selectedSubCat}
                            onChange={item => handleSubCatChange(item.id)}
                        />
                    </View>

                    <Dropdown
                        style={[styles.dropdown, { flex: 1, marginRight: 5 }]}
                        placeholderStyle={styles.dropdownPlaceholder}
                        selectedTextStyle={styles.dropdownSelectedText}
                        // --- YE DO LINES ADD KAREIN ---
                        itemTextStyle={styles.dropdownItemText}
                        containerStyle={styles.dropdownContainer}
                        activeColor='#b5b5b6ff'
                        data={products}
                        labelField="product_name"
                        valueField="id"
                        placeholder="Select Product"
                        value={selectedProduct?.id}
                        onChange={item => setSelectedProduct(item)}
                    />

                    <View style={styles.actionRow}>
                        <Text style={styles.priceValue}>RS. {formatNumber(selectedProduct?.price_after_discount || 0)}</Text>
                        <View style={styles.qtyContainer}>
                            <TextInput
                                value={quantity}
                                onChangeText={setQuantity}
                                keyboardType="numeric"
                                style={styles.qtyInput}
                                placeholder="Qty"
                                mode="outlined"
                                dense
                            />
                            <Button
                                mode="contained"
                                onPress={addToCart}
                                style={styles.addButton}
                                labelStyle={styles.addButtonLabel}
                            >
                                ADD
                            </Button>
                        </View>
                    </View>
                </Card>

                <View style={styles.cartSection}>
                    <Text style={styles.sectionTitle}> CURRENT CART ({cart.length})</Text>

                    <View style={styles.cartHeader}>
                        <Text style={[styles.cartHeaderText, { flex: 2 }]}>ITEM</Text>
                        <Text style={[styles.cartHeaderText, { flex: 0.5, textAlign: 'center' }]}>QTY</Text>
                        <Text style={[styles.cartHeaderText, { flex: 1, textAlign: 'right' }]}>TOTAL</Text>
                        <View style={{ width: 35 }} />
                    </View>

                    <View style={styles.cartList}>
                        {cart.length === 0 ? (
                            <Text style={styles.emptyText}>Cart is empty</Text>
                        ) : (
                            cart.map((item, index) => (
                                <View key={index} style={styles.cartItem}>
                                    <Text style={[styles.itemText, { flex: 2 }]}>{item.product_name}</Text>
                                    <Text style={[styles.qtyText, { flex: 0.5 }]}>{item.quantity}</Text>
                                    <Text style={[styles.totalText, { flex: 1 }]}>{formatNumber(item.total)}</Text>
                                    <IconButton
                                        icon="close-circle-outline"
                                        size={18}
                                        iconColor="#ff5252"
                                        onPress={() => {
                                            const nc = [...cart]; nc.splice(index, 1); setCart(nc);
                                        }}
                                    />
                                </View>
                            ))
                        )}
                    </View>
                </View>

                {/* Spacer taake footer ke peeche content na dube */}
                <View style={{ height: 140 }} />
            </ScrollView>

            {/* Sticky Footer */}
            <View style={styles.footer}>
                <View style={styles.footerRow}>
                    <Text style={styles.footerTotalLabel}>GRAND TOTAL:</Text>
                    <Text style={styles.footerTotalAmount}>RS. {formatNumber(calculateGrandTotal())}</Text>
                </View>
                <Button
                    mode="contained"
                    onPress={handleCreateSale}
                    loading={loading}
                    style={styles.submitButton}
                >
                    CONFIRM & CREATE SALE
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
    scrollContent: { padding: 12 }, // Extra padding hatadi jo gap banati thi

    sectionTitle: { fontSize: 12, fontWeight: '700', color: '#495057', marginBottom: 8, textTransform: 'uppercase' },

    formCard: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#fff',
        elevation: 2,
        marginBottom: 20
    },
    row: { flexDirection: 'row' },
    dropdown: {
        height: 40,
        borderColor: '#dee2e6',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    dropdownPlaceholder: { fontSize: 13, color: '#adb5bd' },


    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12
    },
    priceValue: { fontSize: 18, fontWeight: 'bold', color: '#2ecc71' },
    qtyContainer: { flexDirection: 'row', alignItems: 'center' },
    qtyInput: { width: 60, height: 40, marginRight: 8, backgroundColor: '#fff' },
    addButton: { backgroundColor: '#1b2142', borderRadius: 8, height: 40, justifyContent: 'center' },
    addButtonLabel: { fontSize: 12, fontWeight: 'bold' },

    // Cart Styling
    cartSection: { marginTop: 5 },
    cartHeader: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef'
    },
    cartHeaderText: { fontSize: 11, fontWeight: 'bold', color: '#adb5bd' },
    cartList: { backgroundColor: '#fff', borderRadius: 12, marginTop: 5, elevation: 1 },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f9fa',
        minHeight: 55,
    },
    itemText: { fontSize: 13, fontWeight: '500', color: '#212529', flexWrap: 'wrap' },
    qtyText: { fontSize: 13, textAlign: 'center', color: '#495057' },
    totalText: { fontSize: 13, textAlign: 'right', fontWeight: 'bold', color: '#1b2142' },
    emptyText: { textAlign: 'center', padding: 20, color: '#adb5bd', fontSize: 13 },

    // Footer
    footer: {
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingTop: 15,
        // --- Ye 3 lines button ko upar karengi ---
        paddingBottom: 25, // Button ke niche ki jagah barha di
        marginBottom: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,

        elevation: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    footerTotalLabel: { fontSize: 14, fontWeight: '600', color: '#6c757d' },
    footerTotalAmount: { fontSize: 20, fontWeight: 'bold', color: '#1b2142' },
    submitButton: {
        borderRadius: 12,
        height: 52, // Height thori barha di professional look ke liye
        backgroundColor: '#1b2142',
        justifyContent: 'center',
        // --- Agar mazeed upar chahiye to yahan margin use karein ---
        marginTop: 5
    },
    dropdownSelectedText: {
        fontSize: 13,
        color: '#212529' // Select hone ke baad ka text color
    },

    // --- YE DO NAYE STYLES ADD KAREIN ---
    dropdownItemText: {
        fontSize: 14,
        color: '#212529', // List ke andar ka text color (Dark)
    },
    dropdownContainer: {
        borderRadius: 8,
        backgroundColor: '#ffffff', // List ka background
        marginTop: 2,
    },


});

export default CreateSaleScreen;
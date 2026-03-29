import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Appbar, Button, Card, IconButton, TextInput } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import { DatePickerModal, en, registerTranslation } from 'react-native-paper-dates';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import API from './api/API.js';
import { useToast } from './context/ToastContext';

registerTranslation('en', en);

const ExpiryStockScreen = ({ navigation }: any) => {
    const toast = useToast();
    const [profile, setProfile] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [selectedCat, setSelectedCat] = useState<any>(null);
    const [selectedSubCat, setSelectedSubCat] = useState<any>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [quantity, setQuantity] = useState('1');
    const [imageUri, setImageUri] = useState<any>(null);
    const [expiryList, setExpiryList] = useState<any[]>([]);

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const profileRes = await API.get('/users/profile');
                if (profileRes.data?.profile) setProfile(profileRes.data.profile);
                const catRes = await API.get('/category');
                console.log("category in expiry" , catRes.data)
                setCategories(catRes.data || []);
            } catch (e) { console.log(e); }
        };
        fetchInitialData();
    }, []);

    const handleCategoryChange = async (catId: number) => {
        setSelectedCat(catId);
        setSelectedSubCat(null);
        try {
            const res = await API.get(`/subCategory/${catId}`);
            console.log("subcats in expiry" , res.data)
            setSubCategories(res.data || []);
        } catch (e) { setSubCategories([]); }
    };

    const handleSubCatChange = async (subId: number) => {
        setSelectedSubCat(subId);
        setSelectedProduct(null);
        try {
            const res = await API.get(`/items/${subId}`);
            setProducts(res.data.data || []);
        } catch (e) { setProducts([]); }
    };

    const pickImage = () => {
        launchCamera({ mediaType: 'photo', quality: 0.5 }, (response) => {
            if (response.assets && response.assets.length > 0) {
                setImageUri(response.assets[0]);
            }
        });
    };

    const addItemToList = () => {
        if (!selectedProduct) return toast.showToast("Select a product first");
        if (!imageUri) return toast.showToast("Please capture a picture");

        const dateStr = date?.toISOString().split('T')[0];
        const newItem = {
            item_id: selectedProduct.id,
            product_name: selectedProduct.product_name,
            expiry_date: dateStr,
            quantity: quantity,
            picture: imageUri // Storing full object for FormData
        };

        setExpiryList([...expiryList, newItem]);
        setSelectedProduct(null);
        setImageUri(null);
        setQuantity('1');
        toast.showToast("Added to list");
    };

    const handleSubmit = async () => {
        if (expiryList.length === 0) return toast.showToast("List is empty!");
        setLoading(true);

        // FORM DATA REQUIRED FOR IMAGES
        const formData = new FormData();
        formData.append('store_id', profile?.assigned_stores?.[0]?.id || 2);

        // Backend key mapping
        expiryList.forEach((item, index) => {
            formData.append(`items[${index}][item_id]`, item.item_id);
            formData.append(`items[${index}][expiry_date]`, item.expiry_date);
            formData.append(`items[${index}][quantity]`, item.quantity);

            // Image append
            formData.append('picture', {
                uri: item.picture.uri,
                type: item.picture.type,
                name: item.picture.fileName || `expiry_${index}.jpg`,
            } as any);
        });

        try {
            const res = await API.post('/expirestocks/create-expiry', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                toast.showToast("Expiry report submitted!");
                navigation.goBack();
            }
        } catch (e) {
            toast.showToast("Submission failed");
        } finally { setLoading(false); }
    };

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
                <Appbar.Content title={
                    <View>
                        <Text style={styles.headerTitle}>Expiry Stock</Text>
                        <Text style={styles.headerSubtitle}>{profile?.assigned_stores?.[0]?.store_name || "Store"}</Text>
                    </View>
                } />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>SELECT EXPIRY ITEMS</Text>
                <Card style={styles.formCard}>
                    <View style={styles.row}>
                        <Dropdown style={[styles.dropdown, { flex: 1, marginRight: 5 }]}
                            placeholderStyle={styles.dropdownText}
                            selectedTextStyle={styles.dropdownText}
                            itemTextStyle={styles.dropdownItemText} // For release build fix
                            data={categories} labelField="category_name" valueField="id"
                            placeholder="Category" value={selectedCat} onChange={item => handleCategoryChange(item.id)} />

                        <Dropdown style={[styles.dropdown, { flex: 1 }]}
                            placeholderStyle={styles.dropdownText}
                            selectedTextStyle={styles.dropdownText}
                            itemTextStyle={styles.dropdownItemText}
                            data={subCategories} labelField="subcategory_name" valueField="id"
                            placeholder="Sub-Cat" value={selectedSubCat} onChange={item => handleSubCatChange(item.id)} />
                    </View>

                    <Dropdown style={[styles.dropdown, { marginTop: 10 }]}
                        placeholderStyle={styles.dropdownText}
                        selectedTextStyle={styles.dropdownText}
                        itemTextStyle={styles.dropdownItemText}
                        inputSearchStyle={styles.inputSearchStyle}
                        search data={products} labelField="product_name" valueField="id"
                        placeholder="Select Product" value={selectedProduct?.id}
                        onChange={item => setSelectedProduct(item)} />

                    <View style={styles.row}>
                        <TextInput mode="outlined" label="Qty" value={quantity}
                            onChangeText={setQuantity} keyboardType="numeric"
                            style={styles.qtyInput} outlineColor="#dee2e6" activeOutlineColor="#1b2142" />

                        <TouchableOpacity style={styles.cameraBtn} onPress={pickImage}>
                            <IconButton icon="camera" iconColor={imageUri ? "green" : "#1b2142"} size={25} />
                            <Text style={{ fontSize: 10, color: imageUri ? "green" : "#1b2142" }}>{imageUri ? "Captured" : "Take Pic"}</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.dateBtn} onPress={() => setOpen(true)}>
                        <Text style={styles.dateValue}>EXPIRY: {date?.toISOString().split('T')[0]}</Text>
                        <IconButton icon="calendar" size={20} />
                    </TouchableOpacity>

                    <DatePickerModal locale="en" mode="single" visible={open} onDismiss={() => setOpen(false)} date={date} onConfirm={(p) => { setOpen(false); setDate(p.date); }} validRange={{ startDate: new Date() }} />

                    <Button mode="contained" onPress={addItemToList} style={styles.addButton} icon="plus">ADD TO LIST</Button>
                </Card>

                <View style={styles.listSection}>
                    <Text style={styles.sectionTitle}>📝 ITEMS ({expiryList.length})</Text>
                    {expiryList.map((item, index) => (
                        <Card key={index} style={styles.itemCard}>
                            <View style={styles.listItem}>
                                <Image source={{ uri: item.picture.uri }} style={styles.listImg} />
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={styles.itemText}>{item.product_name}</Text>
                                    <Text style={styles.subItemText}>Qty: {item.quantity} | EXP: {item.expiry_date}</Text>
                                </View>
                                <IconButton icon="delete-outline" iconColor="#ff5252" onPress={() => setExpiryList(expiryList.filter((_, i) => i !== index))} />
                            </View>
                        </Card>
                    ))}
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.footer}>
                <Button mode="contained" onPress={handleSubmit} loading={loading} style={styles.submitButton}>SUBMIT REPORT</Button>
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
    row: { flexDirection: 'row', alignItems: 'center' },
    dropdown: { height: 45, borderColor: '#dee2e6', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, backgroundColor: '#fff' },
    dropdownText: { fontSize: 13, color: '#000' },
    dropdownItemText: { color: '#000' },
    inputSearchStyle: { height: 40, color: '#000' },
    qtyInput: { flex: 1, height: 45, marginTop: 10, backgroundColor: '#fff' },
    cameraBtn: { alignItems: 'center', justifyContent: 'center', marginLeft: 10, marginTop: 10, borderWidth: 1, borderColor: '#dee2e6', borderRadius: 8, paddingHorizontal: 5, height: 50 },
    dateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#dee2e6', borderRadius: 8, marginTop: 10, paddingHorizontal: 10, height: 45 },
    dateValue: { fontSize: 13, color: '#000' },
    addButton: { backgroundColor: '#1b2142', borderRadius: 8, marginTop: 15 },

    // --- Missing Properties Fixed Below ---
    listSection: { marginTop: 20 },
    itemCard: { marginBottom: 8, borderRadius: 8, backgroundColor: '#fff', elevation: 1 },
    listItem: { flexDirection: 'row', alignItems: 'center', padding: 10 },
    listImg: { width: 40, height: 40, borderRadius: 5 },
    itemText: { fontSize: 14, color: '#000', fontWeight: 'bold' },
    subItemText: { fontSize: 12, color: '#666' },

    footer: { backgroundColor: '#fff', padding: 15, paddingBottom: 30, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 20 },
    submitButton: { borderRadius: 12, height: 52, backgroundColor: '#1b2142', justifyContent: 'center' }
});

export default ExpiryStockScreen;
import React, { createContext, useContext, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ToastContext = createContext<any>(null);

export const ToastProvider = ({ children }: any) => {
    const [visible, setVisible] = useState(false);
    const [msg, setMsg] = useState('');

    const showToast = (message: string) => {
        setMsg(message);
        setVisible(true);
        setTimeout(() => setVisible(false), 2500);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {visible && (
                <View style={styles.toast}>
                    <Text style={styles.text}>{msg}</Text>
                </View>
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
    toast: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        backgroundColor: '#1b2142',
        padding: 15,
        borderRadius: 10,
        elevation: 10,
        zIndex: 9999,
    },
    text: { color: 'white', fontWeight: 'bold' }
});
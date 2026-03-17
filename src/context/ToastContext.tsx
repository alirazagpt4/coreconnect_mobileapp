import React, { createContext, useContext, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ToastContext = createContext<any>(null);

export const ToastProvider = ({ children }: any) => {
    const [msg, setMsg] = useState('');
    const [visible, setVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(100)).current; // Start position (hidden below)

    const showToast = (message: string) => {
        setMsg(message);
        setVisible(true);

        // Slide Up Animation
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 40,
            friction: 7,
        }).start();

        // Slide Down & Hide after 2.5s
        setTimeout(() => {
            Animated.timing(slideAnim, {
                toValue: 100,
                duration: 500,
                useNativeDriver: true,
            }).start(() => setVisible(false));
        }, 2500);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {visible && (
                <Animated.View
                    style={[
                        styles.toastContainer,
                        { transform: [{ translateY: slideAnim }] }
                    ]}
                    accessible={true}
                    accessibilityLabel={msg}
                    accessibilityRole="alert"
                >
                    <View style={styles.toastContent}>
                        <Icon name="check-circle" size={20} color="#2ecc71" style={styles.icon} />
                        <Text style={styles.text}>{msg}</Text>
                    </View>
                </Animated.View>
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        bottom: 40, // Screen ke bottom se thora upar
        alignSelf: 'center',
        zIndex: 9999,
        width: 'auto',
        maxWidth: '85%',
    },
    toastContent: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#323232', // Darker Grey like WhatsApp
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 30, // Capsule shape
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    icon: { marginRight: 10 },
    text: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 0.3
    }
});
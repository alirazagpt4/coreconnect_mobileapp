import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = axios.create(
    {
        baseURL: 'http://62.171.183.182/api',
        headers: {
            'Content-Type': 'application/json',
        },

    }
);


// interceptors 
API.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


export default API;

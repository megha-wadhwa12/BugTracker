import api from "@/lib/axios";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const loginAPI = async (data: any) => {
    const response = await axios.post(`${API_URL}/auth/login`, data);
    
    return response.data;
}

export const signupAPI = async (data: any) => {
    const response = await axios.post(`${API_URL}/auth/signup`, data);

    return response.data;
}

export const userProfileAPI = async () => {
    const response = await api.get(`${API_URL}/auth/profile`);

    return response.data;
}
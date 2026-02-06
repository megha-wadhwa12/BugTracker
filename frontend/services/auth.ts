import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_LOCAL_API_URL
console.log("API_URL: ", API_URL);

export const loginAPI = async (data: any) => {
    const response = await axios.post(`${API_URL}/auth/login`, data);
    console.log("response.data: ", response.data);
    
    return response.data;
}

export const signupAPI = async (data: any) => {
    const response = await axios.post(`${API_URL}/auth/signup`, data);
    console.log("response.data: ", response.data);

    return response.data;
}
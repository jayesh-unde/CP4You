import axios from 'axios';

const api = axios.create(
    {
        withCredentials:true,
        baseURL:import.meta.env.VITE_BACKEND_URL,
        headers:{
            'Content-Type':'application/json',
            Accept: 'application/json',
        }
    }
);

//list of all endpoints

export const sendOtpEmail = (data)=>api.post('/api/send-otp-email',data);
export const loginEmail = (data)=> api.post('/api/login-email',data);
export const verifyOtp = (data)=>api.post('/api/verify-otp',data);
export const logout = () => api.post('/api/logout');
export const googleLogin = (data) => api.post('/api/google-login', data);

api.interceptors.response.use(
    (config) => {
        return config;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && originalRequest && !originalRequest._isRetry) {
            originalRequest.isRetry = true;
            try {
                await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/refresh`, {
                    withCredentials: true,
                });
                return api.request(originalRequest);
            } catch (err) {
                console.log(err.message);
            }
        }
        throw error;
    }
);

export default api;
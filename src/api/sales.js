import api from "./axiosInstance"; // Import our new interceptor

// The baseURL (http://localhost:5000/api) is added automatically from axiosConfig
const API_URL = "/sales"; 

// ✅ Updated to use the 'api' interceptor
export const addSale = (data) => api.post(API_URL, data);
export const getSales = (page = 1, limit = 10) =>
  api.get(`/sales?page=${page}&limit=${limit}`);

export const getSaleById = (id) => api.get(`${API_URL}/${id}`);

// ✅ NEW: Added your requested functions
export const updateSale = (id, data) => api.put(`${API_URL}/${id}`, data);
export const deleteSale = (id) => api.delete(`${API_URL}/${id}`);
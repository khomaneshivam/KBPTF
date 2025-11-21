// ✅ 1. Import 'api' from your config, not 'axiosInstance'
import api from "./axiosInstance"; 

// ✅ 2. All functions now use the clean 'api' pattern
// The baseURL in axiosConfig (http://localhost:5000/api) is added automatically.

// ---------- ITEM ----------
const ITEM_URL = "/master/item"; // Will become /api/master/item

export const getItems = () => api.get(ITEM_URL);
export const addItem = (data) => api.post(ITEM_URL, data);
export const updateItem = (id, data) => api.put(`${ITEM_URL}/${id}`, data);
export const deleteItem = (id) => api.delete(`${ITEM_URL}/${id}`);

// ---------- PARTY ----------
const PARTY_URL = "/master/party"; // Will become /api/master/party

export const getParties = () => api.get(PARTY_URL);
export const addParty = (payload) => api.post(PARTY_URL, payload);
export const updateParty = (id, payload) => api.put(`${PARTY_URL}/${id}`, payload);
export const deleteParty = (id) => api.delete(`${PARTY_URL}/${id}`);

// ---------- EXPENSE ----------

// ---------- BANK ----------
const BANK_URL = "/master/bank"; // Will become /api/master/bank

export const getBanks = () => api.get(BANK_URL);
export const addBank = (data) => api.post(BANK_URL, data);
export const deleteBank = (id) => api.delete(`${BANK_URL}/${id}`);

// ---------- COMPANY ----------
const COMPANY_URL = "/master/company"; // Will become /api/master/company

export const getCompanies = () => api.get(COMPANY_URL);
export const addCompany = (data) => api.post(COMPANY_URL, data);
export const updateCompany = (id, data) => api.put(`${COMPANY_URL}/${id}`, data);
export const deleteCompany = (id) => api.delete(`${COMPANY_URL}/${id}`);
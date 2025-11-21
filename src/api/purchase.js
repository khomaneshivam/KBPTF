import api from "./axiosInstance";

const API_URL = "/purchase";   // No need for full URL — api.js adds baseURL

// ---------------------------------------------------
// GET ALL PURCHASES
// ---------------------------------------------------
export const getAllPurchases = (page, limit) =>
  api.get(`/purchase?page=${page}&limit=${limit}`);

// ---------------------------------------------------
// GET SINGLE PURCHASE
// ---------------------------------------------------
export const getPurchaseById = (id) => {
  return api.get(`${API_URL}/${id}`);
};

// ---------------------------------------------------
// CREATE PURCHASE
// ---------------------------------------------------
export const createPurchase = (data) => {
  return api.post(API_URL, data).data;
};

// ---------------------------------------------------
// UPDATE PURCHASE
// ---------------------------------------------------
export const updatePurchase = (id, data) => {
  return api.put(`${API_URL}/${id}`, data);
};

// ---------------------------------------------------
// DELETE PURCHASE
// ---------------------------------------------------
export const deletePurchase = (id) => {
  return api.delete(`${API_URL}/${id}`);
};

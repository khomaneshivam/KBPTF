import api from "./axiosInstance";

const API = "http://localhost:5000/api/expense";

export const addExpense = (data) =>
  api.post(API, data)

export const getExpenses = (page = 0, limit = 10) => {
  return api.get(`/expense?page=${page}&limit=${limit}`);
};

export const deleteExpense = (id) =>
  api.delete(`${API}/${id}`)
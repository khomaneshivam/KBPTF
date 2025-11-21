import api from "./axiosInstance";

export const getTotalBalances = () => api.get("/balance/balances");
export const getCashBalance = () => api.get("/balances/cash");
export const getCashLedger = (limit = 20) => api.get(`/balances/cash/ledger?limit=${limit}`);
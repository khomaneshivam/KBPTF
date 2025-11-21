import api from "./axiosInstance";

export const createBill = (data) => api.post("/bill", data);
export const getBills = () => api.get("/bill");
export const getBillById = (id) => api.get(`/bill/${id}`);

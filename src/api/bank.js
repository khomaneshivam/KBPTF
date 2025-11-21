import api from "./axiosInstance";

export const getBankOnlineSummary = () => api.get("/bank/online-summary");

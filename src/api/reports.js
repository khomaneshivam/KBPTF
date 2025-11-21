import api from "./axiosInstance";

/**
 * Meta: customers, suppliers, expenseTypes
 */
export const getReportMeta = () => api.get("/reports/meta");

/**
 * Monthly (advanced). Backend expects body { month, type, expenseType, customer, supplier, page, limit }
 */
export const getMonthlyReport = (body) => api.post("/reports/monthly", body);

/**
 * Daily summary
 */
export const getDailyReport = () => api.get("/reports/daily");

/**
 * Optional: date range report
 * body: { start, end, type, customer, supplier, expenseType, page, limit }
 */
export const getRangeReport = (body) => api.post("/reports/range", body);

/**
 * Bank summary, GST etc — adapt to your backend routes if available
 */
export const getBankSummary = (start, end) => api.get(`/reports/bank-summary?start=${start}&end=${end}`);
export const getOutstandingReport = () => api.get("/reports/outstanding");
export const getGstReport = (month) => api.get(`/reports/gst?month=${month}`);

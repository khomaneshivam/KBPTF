import api from "./axiosInstance";

// -------------------------------
// SALES OUTSTANDING
// -------------------------------
export const getSalesOutstanding = () =>
  api.get("/payments/sales-outstanding");

// -------------------------------
// PURCHASE OUTSTANDING
// -------------------------------
export const getPurchaseOutstanding = () =>
  api.get("/payments/purchase-outstanding");

// -------------------------------
// CASH SUMMARY
// -------------------------------
export const getFlowCashSummary = () =>
  api.get("/payments/cash-summary");

// -------------------------------
// RECEIVE PAYMENT (CUSTOMER ONLY)
// -------------------------------
export const updateSaleOutstanding = (data) =>
  api.post("/payments/receive", data);

// -------------------------------
// RECEIVE PAYMENT (SUPPLIER / PURCHASE OUTSTANDING)
// -------------------------------
export const updatePurchaseOutstanding = (data) =>
  api.post("/payments/purchase-receive", data);

// -------------------------------
// BANK BALANCES
// -------------------------------
export const getBankBalances = () =>
  api.get("/banks/balances");

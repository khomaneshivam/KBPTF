import api from "./axiosInstance"; // axios instance
// src/api/machinery.js


// MASTER
export const addMachinery = (data) => api.post("/machine/add", data);
export const getMachinery = () => api.get("/machine/list");

// RECORDS
export const addMachineryRecord = (data) =>
  api.post("/machine/record/add", data);
export const getMachineryRecords = () =>
  api.get("/machine/record/list");

//hii i am shivam
import api from "./axiosInstance";

export const addDirectorLoan = (data) =>
  api.post("/director-loan/add", data);

export const getDirectorLoans = () =>
  api.get("/director-loan/list");

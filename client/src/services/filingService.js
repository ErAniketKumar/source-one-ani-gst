import api from "./api";

export const addFilingHistory = (data) => api.post("/filing/add", data);
export const getMyFilings = () => api.get("/filing/my");
export const getFilingByGSTIN = (gstin, year) =>
  api.get(`/filing/${gstin}`, { params: year ? { year } : {} });

export const initializeFilings = (gstin) => 
  api.post("/filing/add", { gstin, financialYears: [] });

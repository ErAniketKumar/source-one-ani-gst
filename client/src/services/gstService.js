import api from "./api";

export const addGSTProfile = (data) => api.post("/gst", data);
export const getMyProfiles = () => api.get("/gst/my");
export const getProfileByGSTIN = (gstin) => api.get(`/gst/${gstin}`);
export const updateGSTProfile = (gstin, data) => api.patch(`/gst/${gstin}`, data);

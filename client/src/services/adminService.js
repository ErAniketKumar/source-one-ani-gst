import api from "./api";

export const getAllUsers = () => api.get("/admin/users");
export const toggleBlockUser = (userId, remarks) =>
  api.patch(`/admin/users/${userId}/block`, { remarks });

export const getAllGSTProfiles = () => api.get("/admin/gst");
export const verifyGSTProfile = (gstin, remarks) =>
  api.patch(`/admin/gst/${gstin}/verify`, { remarks });

export const getAllFilings = (defaultersOnly = false) =>
  api.get("/admin/filings", { params: { defaultersOnly } });
export const toggleLockFiling = (gstin) =>
  api.patch(`/admin/filings/${gstin}/lock`);

export const verifyFilingHistory = (gstin, status) =>
  api.patch(`/admin/filings/${gstin}/verify`, { status });

export const getAuditLog = () => api.get("/admin/actions");

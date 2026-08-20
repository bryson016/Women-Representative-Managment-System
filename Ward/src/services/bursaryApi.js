import api from "./api";

// Admin/Staff endpoints
export async function getAllBursaryApplications(params = {}) {
  const response = await api.get("/api/bursary/applications", { params });
  return response.data;
}

export async function getBursaryApplication(id) {
  const response = await api.get(`/api/bursary/applications/${id}`);
  return response.data;
}

export async function updateBursaryApplication(id, data) {
  const response = await api.put(`/api/bursary/applications/${id}`, data);
  return response.data;
}

export async function deleteBursaryApplication(id) {
  const response = await api.delete(`/api/bursary/applications/${id}`);
  return response.data;
}

export async function updateBursaryStatus(id, data) {
  const response = await api.put(`/api/bursary/applications/${id}/status`, data);
  return response.data;
}

export async function uploadBursaryDocument(id, formData) {
  const response = await api.post(`/api/bursary/applications/${id}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function deleteBursaryDocument(id, documentId) {
  const response = await api.delete(`/api/bursary/applications/${id}/documents/${documentId}`);
  return response.data;
}

export async function getBursaryStats() {
  const response = await api.get("/api/bursary/stats");
  return response.data;
}

export async function getBursaryReports(params = {}) {
  const response = await api.get("/api/bursary/reports", { params });
  return response.data;
}

export async function createBursaryApplication(data) {
  const response = await api.post("/api/bursary/applications", data);
  return response.data;
}

export async function exportBursaryApplications(params = {}) {
  const response = await api.get("/api/bursary/export", { params, responseType: "blob" });
  return response.data;
}

// Beneficiaries
export async function getBeneficiaries(params = {}) {
  const response = await api.get("/api/bursary/beneficiaries", { params });
  return response.data;
}

export async function getBeneficiaryById(id) {
  const response = await api.get(`/api/bursary/beneficiaries/${id}`);
  return response.data;
}

export async function createBeneficiary(data) {
  const response = await api.post("/api/bursary/beneficiaries", data);
  return response.data;
}

export async function exportBeneficiaries(params = {}) {
  const response = await api.get("/api/bursary/beneficiaries/export", {
    params,
    responseType: "blob",
  });
  return response.data;
}

export async function getBeneficiaryFilters() {
  const response = await api.get("/api/bursary/beneficiaries/filters");
  return response.data;
}

// Payments
export async function getPayments(params = {}) {
  const response = await api.get("/api/bursary/payments", { params });
  return response.data;
}

export async function createPayment(data) {
  const response = await api.post("/api/bursary/payments", data);
  return response.data;
}

// Programs
export async function getBursaryPrograms() {
  const response = await api.get("/api/bursary/programs");
  return response.data;
}

export async function createBursaryProgram(data) {
  const response = await api.post("/api/bursary/programs", data);
  return response.data;
}

export async function updateBursaryProgram(id, data) {
  const response = await api.put(`/api/bursary/programs/${id}`, data);
  return response.data;
}

export async function deleteBursaryProgram(id) {
  const response = await api.delete(`/api/bursary/programs/${id}`);
  return response.data;
}

// Notifications
export async function getBursaryNotifications() {
  const response = await api.get("/api/bursary/notifications");
  return response.data;
}

export async function markBursaryNotificationAsRead(id) {
  const response = await api.put(`/api/bursary/notifications/${id}/read`);
  return response.data;
}

// Citizen endpoints
export async function getMyBursaryApplications() {
  const response = await api.get("/api/bursary/my-applications");
  return response.data;
}

export async function getMyBursaryApplication(id) {
  const response = await api.get(`/api/bursary/my-applications/${id}`);
  return response.data;
}

export async function submitBursaryApplication(formData) {
  const response = await api.post("/api/bursary/applications", formData);
  return response.data;
}

export async function updateMyBursaryApplication(id, data) {
  const response = await api.put(`/api/bursary/my-applications/${id}`, data);
  return response.data;
}

export async function withdrawBursaryApplication(id) {
  const response = await api.put(`/api/bursary/my-applications/${id}/withdraw`);
  return response.data;
}

export async function deleteMyBursaryApplication(id) {
  const response = await api.delete(`/api/bursary/my-applications/${id}`);
  return response.data;
}
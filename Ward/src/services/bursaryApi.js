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

// Citizen endpoints
export async function getMyBursaryApplications() {
  const response = await api.get("/api/bursary/my-applications");
  return response.data;
}

export async function submitBursaryApplication(formData) {
  const response = await api.post("/api/bursary/applications", formData);
  return response.data;
}

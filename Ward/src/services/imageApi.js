import api from "./api";

// Upload images (single or multiple)
export async function uploadImages(formData) {
  const response = await api.post("/api/protected/images/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

// Get all images with filters
export async function getImages(params = {}) {
  const response = await api.get("/api/protected/images", { params });
  return response.data;
}

// Get single image by ID
export async function getImageById(id) {
  const response = await api.get(`/api/protected/images/${id}`);
  return response.data;
}

// Update image
export async function updateImage(id, data) {
  const response = await api.put(`/api/protected/images/${id}`, data);
  return response.data;
}

// Delete image
export async function deleteImage(id) {
  const response = await api.delete(`/api/protected/images/${id}`);
  return response.data;
}

// Get all categories
export async function getCategories() {
  const response = await api.get("/api/protected/categories");
  return response.data;
}

// Create category
export async function createCategory(data) {
  const response = await api.post("/api/protected/categories", data);
  return response.data;
}

// Update category
export async function updateCategory(id, data) {
  const response = await api.put(`/api/protected/categories/${id}`, data);
  return response.data;
}

// Delete category
export async function deleteCategory(id) {
  const response = await api.delete(`/api/protected/categories/${id}`);
  return response.data;
}

// Get image statistics
export async function getImageStats() {
  const response = await api.get("/api/protected/stats");
  return response.data;
}

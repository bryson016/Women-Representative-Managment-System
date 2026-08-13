import api from "./api";

export async function fetchSettings() {
  const response = await api.get("/api/protected/settings");
  return response.data;
}

export async function fetchSettingByKey(key) {
  const response = await api.get(`/api/protected/settings/${encodeURIComponent(key)}`);
  return response.data;
}

export async function updateSettings(settings) {
  const response = await api.put("/api/protected/settings", settings);
  return response.data;
}

export async function fetchSystemStatus() {
  const response = await api.get("/api/protected/system-status");
  return response.data;
}

export async function fetchActivities(page = 1, limit = 50) {
  const response = await api.get(`/api/protected/activities?page=${page}&limit=${limit}`);
  return response.data;
}

export async function logActivity(activityData) {
  const response = await api.post("/api/protected/activities", activityData);
  return response.data;
}

export async function uploadLogo(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/api/protected/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

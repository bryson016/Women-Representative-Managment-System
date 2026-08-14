import api from "./api";

export async function getCitizenProfile() {
  const response = await api.get("/api/citizen/profile");
  return response.data;
}

export async function updateCitizenProfile(data) {
  const response = await api.put("/api/citizen/profile", data);
  return response.data;
}

export async function getCitizenComplaints() {
  const response = await api.get("/api/citizen/complaints");
  return response.data;
}

export async function getCitizenComplaintDetails(id) {
  const response = await api.get(`/api/citizen/complaints/${id}`);
  return response.data;
}

export async function submitComplaint(data) {
  const response = await api.post("/api/citizen/complaints", data);
  return response.data;
}

export async function getWardProjects() {
  const response = await api.get("/api/citizen/projects");
  return response.data;
}

export async function getWardMeetings() {
  const response = await api.get("/api/citizen/meetings");
  return response.data;
}

export async function getAnnouncements() {
  const response = await api.get("/api/citizen/announcements");
  return response.data;
}

export async function getNotifications() {
  const response = await api.get("/api/citizen/notifications");
  return response.data;
}

export async function markNotificationAsRead(id) {
  const response = await api.put(`/api/citizen/notifications/${id}/read`);
  return response.data;
}

export async function markAllNotificationsAsRead() {
  const response = await api.put("/api/citizen/notifications/read-all");
  return response.data;
}

export async function submitBursaryApplication(data) {
  const response = await api.post("/api/bursary/applications", data);
  return response.data;
}

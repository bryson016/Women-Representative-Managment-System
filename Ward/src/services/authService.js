import api from "./api";

export async function loginRequest({ username, password }) {
  const response = await api.post("/api/auth/login", { username, password });
  return response.data;
}

export async function registerRequest({ username, fullName, password }) {
  const response = await api.post("/api/auth/register", { username, fullName, password });
  return response.data;
}

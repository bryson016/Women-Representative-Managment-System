import api from "./api";

export async function loginRequest({ username }) {
  const response = await api.post("/api/auth/login", { username });
  return response.data;
}

export async function registerRequest({ username, fullName }) {
  const response = await api.post("/api/auth/register", { username, fullName });
  return response.data;
}

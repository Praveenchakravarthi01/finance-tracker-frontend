const API_URL = "https://finance-tracker-backend-t6ks.onrender.com";

export const request = async (endpoint, method = "GET", body = null) => {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  const response = await fetch(`${API_URL}${endpoint}`, config);
  if (!response.ok) throw new Error("API Request Failed");
  return response.headers.get("content-type")?.includes("json")
    ? response.json()
    : response.text();
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function getToken() {
  return localStorage.getItem("eventhive_token");
}

function buildUrl(path) {
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
}

async function request(method, path, body = null, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.headers || {})
  };

  const isFormData = body instanceof FormData;

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
    ...options
  };

  if (body !== null) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path), config);

  let result = null;

  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("eventhive_token");

    if (!window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }

    throw new Error(result?.error || "Session expired. Please login again.");
  }

  if (!response.ok) {
    throw new Error(result?.error || "Something went wrong.");
  }

  if (result && Object.prototype.hasOwnProperty.call(result, "data")) {
    return result.data;
  }

  return result;
}

export const api = {
  get: (path, options = {}) => request("GET", path, null, options),
  post: (path, body, options = {}) => request("POST", path, body, options),
  put: (path, body, options = {}) => request("PUT", path, body, options),
  delete: (path, options = {}) => request("DELETE", path, null, options)
};
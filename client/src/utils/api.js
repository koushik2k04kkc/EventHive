const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = (headers = {}) => {
  const token = localStorage.getItem('token');
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
};

const request = async (endpoint, { method = 'GET', body, headers = {}, ...rest } = {}) => {
  const isFormData = body instanceof FormData;
  const config = {
    method,
    ...rest,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...getAuthHeaders(headers),
    },
  };

  if (body !== undefined && body !== null) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
};

const api = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
};

export default api;

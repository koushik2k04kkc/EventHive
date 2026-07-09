import { useEffect, useState } from 'react';

export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(url));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
        if (token) headers.Authorization = `Bearer ${token}`;
        const response = await fetch(url, { ...options, headers, signal: controller.signal });
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
        setData(await response.json());
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || 'Failed to fetch data');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [url, JSON.stringify(options)]);

  return { data, loading, error };
};

export default useFetch;

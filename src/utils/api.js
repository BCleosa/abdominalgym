const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}, token = null) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `Request gagal (${res.status})` }));
    const e = new Error(err.error || `Request gagal (${res.status})`);
    e.status = res.status;
    throw e;
  }
  return res.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};

function makeAuthApi(tokenKey) {
  const getToken = () => localStorage.getItem(tokenKey);
  const wrap = async (fn) => {
    try {
      return await fn();
    } catch (err) {
      if (err.status === 401) localStorage.removeItem(tokenKey);
      throw err;
    }
  };
  return {
    get: (path) => wrap(() => request(path, {}, getToken())),
    post: (path, body) => wrap(() => request(path, { method: "POST", body: JSON.stringify(body) }, getToken())),
    put: (path, body) => wrap(() => request(path, { method: "PUT", body: JSON.stringify(body) }, getToken())),
    delete: (path) => wrap(() => request(path, { method: "DELETE" }, getToken())),
  };
}

export const ownerApi = makeAuthApi("owner_token");
export const pelatihApi = makeAuthApi("pelatih_token");
export const memberApi = makeAuthApi("member_token");
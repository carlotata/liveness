// src/services/api.js

const API_BASE_URL = "http://localhost:3000/api";
const ADMIN_KEY = "liveness_admin";

const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const savedAdmin = localStorage.getItem(ADMIN_KEY);
  const token = savedAdmin ? JSON.parse(savedAdmin).token : null;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 204) return null;
    const error = await response.json();
    throw new Error(error.error || "Request failed");
  }

  if (response.status === 204) return null;
  return response.json();
};

export const api = {
  auth: {
    signup: (username, password, firstName, lastName, email) =>
      request("/dashboard/signup", {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
          firstName,
          lastName,
          email,
        }),
      }),
    login: async (username, password) => {
      const admin = await request("/dashboard/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
      return admin;
    },
    logout: async () => {
      localStorage.removeItem(ADMIN_KEY);
    },
    getCurrentUser: () => {
      const saved = localStorage.getItem(ADMIN_KEY);
      return saved ? JSON.parse(saved) : null;
    },
    forgotPassword: (email) =>
      request("/dashboard/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    resetPassword: (token, newPassword) =>
      request("/dashboard/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      }),
    changePassword: (currentPassword, newPassword) =>
      request("/dashboard/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
  },

  users: {
    list: () => request("/dashboard/users"),
    delete: (id) =>
      request(`/dashboard/users/${id}`, {
        method: "DELETE",
      }),
  },

  logs: {
    list: () => request("/dashboard/logs"),
  },

  apiKeys: {
    list: () => request("/dashboard/api-keys"),
    create: (name) =>
      request("/dashboard/api-keys", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    delete: (id) =>
      request(`/dashboard/api-keys/${id}`, {
        method: "DELETE",
      }),
  },

  webhooks: {
    list: () => request("/dashboard/webhooks"),
    create: (url) =>
      request("/dashboard/webhooks", {
        method: "POST",
        body: JSON.stringify({ url }),
      }),
    delete: (id) =>
      request(`/dashboard/webhooks/${id}`, {
        method: "DELETE",
      }),
    logs: () => request("/dashboard/webhooks/logs"),
  },

  stats: {
    getOverview: () => request("/dashboard/stats"),
  },

  billing: {
    getTier: () => request("/dashboard/billing"),
    upgrade: () =>
      request("/dashboard/billing/upgrade", {
        method: "POST",
      }),
  },

  system: {
    getHealth: () => {
      return fetch("http://localhost:3000/health").then((res) => res.json());
    },
  },
};


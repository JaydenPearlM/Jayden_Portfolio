// src/pages/lib/auth.js

export const isAuthed = () => Boolean(localStorage.getItem("adminToken"));

export const login = (token) => {
  localStorage.setItem("adminToken", token);
};

export const logout = () => {
  localStorage.removeItem("adminToken");
  window.location.href = "/home"; // redirect after logout
};

export const getToken = () => {
  return localStorage.getItem("adminToken");
};


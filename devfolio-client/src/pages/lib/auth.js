// src/lib/auth.js
export const isAuthed = () => Boolean(localStorage.getItem('adminToken'));
export const logout = () => {
  localStorage.removeItem('adminToken');
  window.location.href = '/home';
};

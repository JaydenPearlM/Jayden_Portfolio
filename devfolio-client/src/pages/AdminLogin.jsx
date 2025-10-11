// src/pages/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "./lib/api";


export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword]   = useState('');
  const [err, setErr]             = useState('');
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const res = await api.post('admin/login', { username, password });
      localStorage.setItem('adminToken', res.data.token);
      nav('/_/admin'); // redirect to Admin
    } catch {
      setErr('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        {err && <div className="text-red-600">{err}</div>}
        <input
          className="w-full border p-2 rounded"
          placeholder="Username"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
        />
        <input
          className="w-full border p-2 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />
        <button className="w-full bg-black text-white py-2 rounded">Sign in</button>
      </form>
    </div>
  );
}

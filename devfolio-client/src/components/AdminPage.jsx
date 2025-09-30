import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from "../pages/lib/api";
import { isAuthed, logout } from "../pages/lib/auth";

import {
  Briefcase, Eye, FileText, Clock, Timer, AlertTriangle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import TopNavbar from './TopNavbar';

export default function AdminPage() {
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    resumeClicks: 0,
    averageSessionDuration: 0,
    projectsPerDay: [],
    topProjects: [],
    avgLoadTime: 0,
    errorCount: 0,
  });

  const [rangeType, setRangeType] = useState('7');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch analytics data from server
  const fetchAnalytics = () => {
    setLoading(true);
    const params =
      rangeType === 'custom' && startDate && endDate
        ? { start: startDate, end: endDate }
        : { range: rangeType };

    // Pull token from storage (adjust key if your auth uses a different one)
    const token =
      localStorage.getItem('adminToken') ||
      localStorage.getItem('token');

    api.get('/api/analytics/admin', {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      withCredentials: true,
    })
      .then(res => {
        setAnalytics(res.data);
        setLastUpdated(new Date());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchAnalytics, [rangeType, startDate, endDate]);

  // Export analytics to CSV
  const handleExport = () => {
    const top0 = analytics.topProjects?.[0] || {};
    const topTitle = top0.title || top0.project?.title || 'N/A';

    const csvHeaders = [
      ['Metric', 'Value'],
      ['Page Views', analytics.totalViews],
      ['Resume Clicks', analytics.resumeClicks],
      ['Avg. Session (sec)', analytics.averageSessionDuration],
      ['Avg. Load Time (ms)', analytics.avgLoadTime],
      ['Error Count', analytics.errorCount],
      ['Top Project', topTitle],
      ['Top Project Clicks', top0.count || 0],
    ];

    const dailyClicks = analytics.projectsPerDay.map(d => [d._id, d.count]);
    const csvRows = [...csvHeaders, [], ['Date', 'Daily Clicks'], ...dailyClicks];
    const blob = new Blob([csvRows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'analytics.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('CSV exported!');
  };

  const configureAlerts = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success(`Alerts ${emailAlerts ? 'enabled' : 'disabled'} for last ${rangeType} days`);
      setLoading(false);
    }, 500);
  };

  // Format session duration nicely
  const formattedSession = `${Math.floor(analytics.averageSessionDuration / 60)}m ${analytics.averageSessionDuration % 60}s`;
  const topProject = analytics.topProjects[0] || null;
  const topProjectTitle = topProject ? (topProject.title || topProject.project?.title) : null;

  return (
    <>
      <TopNavbar />

      <div className="p-8 space-y-8 bg-gray-50 min-h-screen text-gray-800 border-t-4 border-blue-300">
        <h1
          className="text-4xl font-bold text-indigo-800 mb-2 flex items-center gap-2 cursor-pointer group"
          onClick={() => window.location.href = '/home'}
        >
          <Briefcase className="w-8 h-8 text-blue-500 group-hover:text-blue-600 transition" />
          Analytics
        </h1>

        {/* Export & Alerts */}
        <div className="flex flex-wrap items-center space-x-4">
          <button
            onClick={handleExport}
            className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-semibold px-4 py-2 rounded shadow-sm 
            hover:scale-105 active:scale-95 transition-transform"
          >
            Download CSV
          </button>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={e => setEmailAlerts(e.target.checked)}
            />
            <span>Email Alerts <span className="text-gray-400">(e.g. high errors)</span></span>
          </label>
          <button
            onClick={configureAlerts}
            className="bg-green-100 hover:bg-green-200 text-green-800 font-semibold px-4 py-2 rounded shadow-sm 
            hover:scale-105 active:scale-95 transition-transform"
          >
            Save Alerts
          </button>
        </div>

        <div className="h-2 rounded-full bg-pink-100 my-4"></div>

        {lastUpdated && (
          <p className="text-sm text-gray-400 mb-4">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard label="Page Views" value={analytics.totalViews} Icon={Eye} color="bg-blue-100 text-blue-800" tooltip="Portfolio views" />
          <StatCard label="Resume Clicks" value={analytics.resumeClicks} Icon={FileText} color="bg-purple-100 text-purple-800" tooltip="Resume clicks" />
          <StatCard label="Avg. Session" value={formattedSession} Icon={Clock} color="bg-green-100 text-green-800" tooltip="Avg time on site" />
          <StatCard label="Avg. Load Time" value={`${analytics.avgLoadTime} ms`} Icon={Timer} color="bg-orange-100 text-orange-800" tooltip="Page load speed" />
        </div>

        {/* Chart + Errors + Top Project */}
        <div className="flex flex-wrap gap-6">
          <div className="flex-1 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="font-semibold mb-2">📈 Clicks Per Day</h2>
            {analytics.projectsPerDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analytics.projectsPerDay}>
                  <XAxis dataKey="_id" tickFormatter={d => d?.slice(5)} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#818cf8" animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <span className="text-5xl mb-2">📊</span>
                <p>No click data available</p>
              </div>
            )}
          </div>

          <StatCard
            label="Errors (7d)"
            value={analytics.errorCount}
            Icon={AlertTriangle}
            color="bg-red-100 text-red-800"
            tooltip="Recent errors"
            className="w-1/5"
          />

          <div className="w-1/3 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center items-center">
            <h2 className="font-semibold mb-2">⭐ Top Project</h2>
            {topProject ? (
              <>
                <p className="text-lg font-semibold">{topProjectTitle}</p>
                <p className="text-sm text-gray-600">{topProject.count} clicks</p>
              </>
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <span className="text-4xl mb-2">🗂️</span>
                <p>No top project yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Range Filter */}
        <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-wrap items-center gap-4">
          <select
            value={rangeType}
            onChange={e => setRangeType(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="1">Last 24h</option>
            <option value="7">Last 7d</option>
            <option value="30">Last 30d</option>
            <option value="custom">Custom</option>
          </select>
          {rangeType === 'custom' && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="p-2 border rounded"
              />
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="p-2 border rounded"
              />
            </>
          )}
          <button
            onClick={fetchAnalytics}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded 
            hover:scale-105 active:scale-95 transition-transform"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </>
  );
}

// Subcomponent: StatCard
function StatCard({ label, value, Icon, color, className = '', tooltip }) {
  return (
    <div
      title={tooltip}
      className={`p-4 rounded-lg shadow flex items-center space-x-4 ${color} ${className}`}
    >
      <Icon className="w-6 h-6" />
      <div>
        <h3 className="text-sm font-medium">{label}</h3>
        <AnimatePresence mode="wait">
          <motion.p
            key={value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-xl font-bold"
          >
            {value}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

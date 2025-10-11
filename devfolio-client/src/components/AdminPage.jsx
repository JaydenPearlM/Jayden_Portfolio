import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import TopNavbar from './TopNavbar';

const API_BASE = process.env.REACT_APP_API_BASE || ''; // "" in dev with CRA proxy

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [analytics, setAnalytics] = useState(null);

  // UI state for range
  const [rangeType, setRangeType] = useState('7'); // '7' | '30' | 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params =
        rangeType === 'custom' && startDate && endDate
          ? { start: startDate, end: endDate }
          : { range: rangeType };

      const opts = { params };
      // only cross-origin in prod; CRA proxy in dev keeps same-origin
      if (API_BASE) opts.withCredentials = true;

      const res = await axios.get(`${API_BASE}/api/analytics/admin`, opts);
      setAnalytics(res.data);
    } catch (err) {
      const status = err.response?.status;
      const msg = status ? `Failed (${status}) at /api/analytics/admin` : 'Network error';
      console.error('fetchAnalytics failed', {
        status,
        data: err.response?.data,
        message: err.message,
      });
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [rangeType, startDate, endDate]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const topProject = analytics?.topProject ?? null;
  const topProjectTitle = topProject ? (topProject.title || topProject.project?.title) : 'N/A';

  return (
    <>
      <TopNavbar />
      <main className="mx-auto max-w-6xl p-4">
        <h1 className="text-xl font-semibold">Admin Analytics</h1>

        {/* Controls */}
        <div className="mt-4 flex items-center gap-3">
          <select
            value={rangeType}
            onChange={(e) => setRangeType(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="custom">Custom</option>
          </select>

          {rangeType === 'custom' && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded px-2 py-1"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded px-2 py-1"
              />
              <button
                onClick={fetchAnalytics}
                className="border rounded px-3 py-1"
              >
                Apply
              </button>
            </>
          )}
        </div>

        {/* Messages */}
        {error && <div className="mt-3 text-red-600">{error}</div>}
        {loading && <div className="mt-3">Loading…</div>}

        {/* Data */}
        {!loading && analytics && (
          <section className="mt-5 grid gap-3">
            <div>Total visits: {analytics.totalVisits ?? 0}</div>
            <div>Unique users: {analytics.uniqueUsers ?? 0}</div>
            <div>Top project: {topProjectTitle}</div>
          </section>
        )}
      </main>
    </>
  );
}

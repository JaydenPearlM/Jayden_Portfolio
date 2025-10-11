import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import TopNavbar from './TopNavbar';

const API_BASE = process.env.REACT_APP_API_BASE || '';

export default function AdminPage() {
  // ----- state
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const [rangeType, setRangeType] = useState('7'); // '7' | '30' | 'custom'
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate]     = useState(null);

  // ----- fetch (INSIDE component)
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params =
        rangeType === 'custom' && startDate && endDate
          ? { start: startDate, end: endDate }
          : { range: rangeType };

      const useProxy = API_BASE === '';
      const opts = { params };
      if (!useProxy) opts.withCredentials = true;

      const res = await axios.get(`${API_BASE}/api/analytics/admin`, opts);
      setAnalytics(res.data);
    } catch (err) {
      console.error('fetchAnalytics failed', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [rangeType, startDate, endDate]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  // any other helpers should end BEFORE the return
  // ------------------------------------------------

  // ----- render STARTS here. Keep this INSIDE the function.
  const topProject     = analytics?.topProject ?? null;
  const topProjectTitle = topProject ? (topProject.title || topProject.project?.title) : null;

  return (
    <>
      <TopNavbar />
      <main className="mx-auto max-w-6xl p-4">
        <h1 className="text-xl font-semibold">Admin Analytics</h1>

        {error && <div className="mt-2 text-red-600">{error}</div>}
        {loading && <div className="mt-2">Loading…</div>}

        {!loading && analytics && (
          <section className="mt-4 space-y-2">
            <div>Total visits: {analytics.totalVisits}</div>
            <div>Unique users: {analytics.uniqueUsers}</div>
            <div>Top project: {topProjectTitle ?? 'N/A'}</div>
          </section>
        )}
      </main>
    </>
  );
}

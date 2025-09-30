// server/controllers/analyticsController.js
const mongoose = require('mongoose');
const AnalyticsEvent = require('../models/AnalyticsEvent');

// -------- helpers --------
function buildTimeMatch(query) {
  const now = new Date();

  // helper to parse YYYY-MM-DD as a local date (00:00 local time)
  const parseYMD = (str) => {
    if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0); // local midnight
  };

  let start, end;

  // Custom date range ?start=YYYY-MM-DD&end=YYYY-MM-DD
  if (query?.start && query?.end) {
    const s = parseYMD(query.start);
    const e = parseYMD(query.end);
    if (!s || !e) return {};
    // inclusive end-of-day (23:59:59.999)
    start = s;
    end   = new Date(e.getTime() + 24 * 60 * 60 * 1000 - 1);
  }
  // Rolling range in days ?range=1|7|30
  else if (query?.range) {
    const days = Number(query.range);
    if (Number.isFinite(days) && days > 0) {
      end = now;
      start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    }
  }

  return (start && end) ? { timestamp: { $gte: start, $lte: end } } : {};
}

function ua(req) {
  return req.headers['user-agent'] || null;
}

// -------- write endpoints (public) --------
exports.recordPageview = async (_req, res) => {
  try {
    const ev = await AnalyticsEvent.create({ eventType: 'pageview' });
    res.status(201).json(ev);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.recordProjectClick = async (req, res) => {
  try {
    const { id } = req.params;
    const projectId = mongoose.Types.ObjectId.isValid(id) ? id : null;

    const ev = await AnalyticsEvent.create({
      eventType: 'project_click',
      projectId,
    });
    res.status(201).json(ev);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.recordResumeClick = async (_req, res) => {
  try {
    const ev = await AnalyticsEvent.create({ eventType: 'resume_click' });
    res.status(201).json(ev);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// NEW: load time (ms)
exports.recordLoadTime = async (req, res) => {
  try {
    const { loadTimeMs, path } = req.body || {};
    const ev = await AnalyticsEvent.create({
      eventType: 'load_time',
      loadTimeMs: Number(loadTimeMs) || null,
      path: path || null,
      userAgent: ua(req),
    });
    res.status(201).json(ev);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// NEW: session end (seconds)
exports.recordSessionEnd = async (req, res) => {
  try {
    const { sessionSec, path } = req.body || {};
    const ev = await AnalyticsEvent.create({
      eventType: 'session_end',
      sessionSec: Number(sessionSec) || null,
      path: path || null,
      userAgent: ua(req),
    });
    res.status(201).json(ev);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// NEW: client error
exports.recordClientError = async (req, res) => {
  try {
    const { name, message, stack, path } = req.body || {};
    const ev = await AnalyticsEvent.create({
      eventType:   'error',
      errorName:   name || null,
      errorMessage: message || null,
      errorStack:   typeof stack === 'string' ? stack.slice(0, 2000) : null,
      path:         path || null,
      userAgent:    ua(req),
    });
    res.status(201).json(ev);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------- read endpoint (admin) --------
exports.getAnalytics = async (req, res) => {
  try {
    const timeMatch = buildTimeMatch(req.query);

    // 1) counts
    const [totalViews, resumeClicks, errorCount] = await Promise.all([
      AnalyticsEvent.countDocuments({ eventType: 'pageview',     ...timeMatch }),
      AnalyticsEvent.countDocuments({ eventType: 'resume_click', ...timeMatch }),
      AnalyticsEvent.countDocuments({ eventType: 'error',        ...timeMatch }),
    ]);

    // 2) top projects (respecting timeMatch)
    const topProjects = await AnalyticsEvent.aggregate([
      { $match: { eventType: 'project_click', ...(timeMatch.timestamp ? timeMatch : {}) } },
      { $group: { _id: '$projectId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'project',
        },
      },
      { $unwind: '$project' },
      {
        $project: {
          _id: 0,
          projectId: '$_id',
          title: '$project.title',
          count: 1,
        },
      },
    ]);

    // 3) clicks per day
    const projectsPerDay = await AnalyticsEvent.aggregate([
      { $match: { eventType: 'project_click', ...(timeMatch.timestamp ? timeMatch : {}) } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 4) performance aggregates
    const [loadAgg] = await AnalyticsEvent.aggregate([
      { $match: { eventType: 'load_time', ...(timeMatch.timestamp ? timeMatch : {}) } },
      { $group: { _id: null, avg: { $avg: '$loadTimeMs' } } },
    ]);

    const [sessionAgg] = await AnalyticsEvent.aggregate([
      { $match: { eventType: 'session_end', ...(timeMatch.timestamp ? timeMatch : {}) } },
      { $group: { _id: null, avg: { $avg: '$sessionSec' } } },
    ]);

    res.json({
      totalViews,
      resumeClicks,
      topProjects,
      projectsPerDay,
      avgLoadTime: Math.round(loadAgg?.avg || 0),
      averageSessionDuration: Math.round(sessionAgg?.avg || 0),
      errorCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

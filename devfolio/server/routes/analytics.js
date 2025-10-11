// server/routes/analytics.js
const express = require('express');
const router = express.Router();
const analyticsCtrl = require('../controllers/analyticsController');
const { verifyAdmin } = require('../middleware/auth');

// ─────────────────────────────────────────────
// Debug: confirm controller exports
console.log('[analyticsCtrl keys]', Object.keys(analyticsCtrl));

// Safe wrapper: prevents crashes if a handler is missing
function ensure(fn, name) {
  if (typeof fn !== 'function') {
    console.error(`[analytics] Missing handler: ${name} (got ${typeof fn})`);
    return (_req, res) =>
      res.status(500).json({ error: `Handler ${name} is undefined` });
  }
  return fn;
}

// ─────────────────────────────────────────────
// PUBLIC (no auth)
router.post('/pageview',          ensure(analyticsCtrl.recordPageview, 'recordPageview'));
router.post('/project-click',     ensure(analyticsCtrl.recordProjectClick, 'recordProjectClick'));
router.post('/resume-click',      ensure(analyticsCtrl.recordResumeClick, 'recordResumeClick'));
router.post('/load-time',         ensure(analyticsCtrl.recordLoadTime, 'recordLoadTime'));
router.post('/session-end',       ensure(analyticsCtrl.recordSessionEnd, 'recordSessionEnd'));
router.post('/client-error',      ensure(analyticsCtrl.recordClientError, 'recordClientError'));

// ─────────────────────────────────────────────
// ADMIN (requires auth)
router.get('/admin', verifyAdmin, ensure(analyticsCtrl.getAnalytics, 'getAnalytics'));
router.get('/',      verifyAdmin, ensure(analyticsCtrl.getAnalytics, 'getAnalytics'));

// ─────────────────────────────────────────────
module.exports = router;

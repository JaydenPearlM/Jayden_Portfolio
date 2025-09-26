// server/routes/analytics.js
const express = require('express');
const router = express.Router();
const analyticsCtrl = require('../controllers/analyticsController');
const { verifyAdmin } = require('../middleware/auth');

// Debug: see what's actually exported from your controller
console.log('[analyticsCtrl keys]', Object.keys(analyticsCtrl));

// Guard: wrap handlers so Express never receives "undefined"
function ensure(fn, name) {
  if (typeof fn !== 'function') {
    console.error(`[analytics] Missing handler: ${name} (got ${typeof fn})`);
    // return a safe fallback so the server won't crash and you can see the error in responses
    return (_req, res) => res.status(500).json({ error: `Handler ${name} is undefined` });
  }
  return fn;
}

// PUBLIC writes (no auth)
router.post('/pageview',          ensure(analyticsCtrl.recordPageview, 'recordPageview'));
router.post('/project-click/:id', ensure(analyticsCtrl.recordProjectClick, 'recordProjectClick'));
router.post('/resume-click',      ensure(analyticsCtrl.recordResumeClick, 'recordResumeClick'));

// If you haven't finished adding these handlers, you can leave them commented for now.
// Uncomment only after your controller exports exist.
// router.post('/load-time',          ensure(analyticsCtrl.recordLoadTime, 'recordLoadTime'));
// router.post('/session-end',        ensure(analyticsCtrl.recordSessionEnd, 'recordSessionEnd'));
// router.post('/error',              ensure(analyticsCtrl.recordClientError, 'recordClientError'));

// ADMIN reads (auth required)
router.get('/admin', verifyAdmin, ensure(analyticsCtrl.getAnalytics, 'getAnalytics'));
router.get('/',      verifyAdmin, ensure(analyticsCtrl.getAnalytics, 'getAnalytics'));

module.exports = router;

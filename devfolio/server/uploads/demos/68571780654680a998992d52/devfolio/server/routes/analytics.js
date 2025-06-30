// server/routes/analytics.js
const express        = require('express');
const router         = express.Router();
const analyticsCtrl  = require('../controllers/analyticsController');
const { verifyAdmin } = require('../middleware/auth');

router.use(verifyAdmin); //Protecteverything below with your admin-check middleware

router.post('/pageview',        analyticsCtrl.recordPageview);
router.post('/project-click/:id', analyticsCtrl.recordProjectClick);
router.post('/resume-click',    analyticsCtrl.recordResumeClick);
router.get('/admin',            analyticsCtrl.getAnalytics);
router.get('/', analyticsCtrl.getAnalytics);
module.exports = router;

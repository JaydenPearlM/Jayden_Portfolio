// server/controllers/analyticsController.js

const AnalyticsEvent = require('../models/AnalyticsEvent');

/**
 * Record a pageview event
 */
exports.recordPageview = async (req, res) => {
  try {
    const ev = await AnalyticsEvent.create({ eventType: 'pageview' });
    res.status(201).json(ev);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Record a click on a specific project
 */
exports.recordProjectClick = async (req, res) => {
  try {
    const ev = await AnalyticsEvent.create({
      eventType: 'project_click',
      projectId: req.params.id
    });
    res.status(201).json(ev);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Record a resume-download (or click) event
 */
exports.recordResumeClick = async (req, res) => {
  try {
    const ev = await AnalyticsEvent.create({ eventType: 'resume_click' });
    res.status(201).json(ev);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/analytics or GET /api/admin/analytics
 * Returns totalViews, resumeClicks, topProjects, and projectsPerDay
 */
exports.getAnalytics = async (req, res) => {
  try {
    // 1) Your existing metrics
    const totalViews   = await AnalyticsEvent.countDocuments({ eventType: 'pageview' });
    const resumeClicks = await AnalyticsEvent.countDocuments({ eventType: 'resume_click' });
    const topProjects = await AnalyticsEvent.aggregate([    
     
    { $match: { eventType: 'project_click' } },
      { $group: { _id: '$projectId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from:       'projects',
          localField: '_id',
          foreignField: '_id',
          as:         'project'
        }
      },
      { $unwind: '$project' },
      {
        $project: {
          _id:        0,
          projectId:  '$_id',
          title:      '$project.title',
          count:      1
        }
      }
    ]);

    // 2) New: projects per day for your bar chart
    const projectsPerDay = await AnalyticsEvent.aggregate([
      { $match: { eventType: 'project_click' } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // 3) Return them all
    res.json({
      totalViews,
      resumeClicks,
      topProjects,
      projectsPerDay
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

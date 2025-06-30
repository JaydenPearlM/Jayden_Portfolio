const mongoose = require('mongoose');
const { Schema } = mongoose;

const analyticsSchema = new Schema({
  eventType: {
    type: String,
    enum: ['pageview', 'project_click', 'resume_click'],
    required: true
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: function() { return this.eventType === 'project_click'; }
  },
  timestamp: { type: Date, default: Date.now }
});

// ← Add your index here
analyticsSchema.index({ eventType: 1, timestamp: 1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsSchema);

const fs = require('fs');
const path = require('path');
const dotenvResult = require('dotenv').config({ debug: true, path: path.join(__dirname, '.env') });




console.log('⤷ dotenv load result:', dotenvResult);
console.log('⤷ Looking for .env at:', path.join(__dirname, '.env'));
console.log('⤷ Working directory (cwd):', process.cwd());
console.log('⤷ Files in this folder:', fs.readdirSync(__dirname));
console.log('⤷ MONGODB_URI env var:', process.env.MONGODB_URI);

const express = require('express');
const mongoose = require('mongoose');
const projectRoutes = require('./routes/project');
const analyticsRoutes = require('./routes/analytics');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON requests
app.use(express.json());

// Serve uploaded files statically (assuming you use 'uploads' folder for multer)
app.use('/uploads', express.static('uploads'));

// API routes

app.use('/api/projects', projectRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
// Basic root route
app.get('/', (req, res) => {
  res.send('Welcome To Devfolio backend! n/ This will be turning into a Dashboard for Admin!');
});

//POST
app.post('/api/upload', (req, res) => {
  console.log('Received at /api/upload:', req.body);
  res.json({
    message: 'Hello from /api/upload!',
    receivedPayload: req.body
  });
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("MongoDB connected");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err) => {
  console.error("MongoDB connection failed:", err.message);
});

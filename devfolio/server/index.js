const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const projectRoutes = require('./routes/project');

const app = express();
const PORT = process.env.PORT || 5000;

console.log("MONGODB_URI is:", process.env.MONGODB_URI);

// Middleware to parse JSON requests
app.use(express.json());

// Serve uploaded files statically (assuming you use 'uploads' folder for multer)
app.use('/uploads', express.static('uploads'));

// API routes
app.use('/api/projects', projectRoutes);

// Basic root route
app.get('/', (req, res) => {
  res.send('Welcome To Devfolio backend!');
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

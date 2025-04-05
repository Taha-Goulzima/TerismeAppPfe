const express = require("express");
const connection = require("./config/connectionDb");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

dotenv.config();

const app = express();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json()); 
app.use('/uploads', express.static('uploads')); // Serve uploaded files

connection();

app.use("/user", require("./routes/userRoutes"));
app.use("/voyages", require("./routes/voyageRoutes"));
app.use("/association", require("./routes/associationRoutes"));
app.use("/inscription", require("./routes/inscriptionRoutes"));
app.use("/avis", require("./routes/avisRoutes"));

// File upload endpoint
app.post('/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//אביאל מלכה ומאי גלילי 49.1
//Node-Bakc/app.js
//Import required modules
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const logger = require("./logger");

// Import route files
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const locationsRoutes = require("./routes/locationsRoutes");
const taskRoutes = require("./routes/taskRoutes");

//Import 404page
import Error404 from "../React-Front/src/pages/error404/Error404.jsx";

// Create an instance of the Express application
const app = express();

// Define the port the server will listen on
const port = 8801;

// === MIDDLEWARE SETUP ===

// Enable CORS to allow requests from the frontend (on localhost:3000)
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Configure session middleware
app.use(
  session({
    secret: "mySuperSecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

// Parse incoming requests with JSON payloads
app.use(express.json());

// Use a custom logger middleware (prints request details)
app.use(logger);

// Print every incoming request's method and URL to the console (for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// === ROUTES ===

// Set up routes for different features (modularized)
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/locations", locationsRoutes);
app.use("/api/tasks", taskRoutes);

//404 page error
app.use("/api/*", (req, res) => {
  res.status(404).send(Error404);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

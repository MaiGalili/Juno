//Node-Bakc/app.js
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const logger = require("./logger");
const travelRoutes = require("./routes/travelRoutes");

// Route files
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const locationsRoutes = require("./routes/locationsRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");
const suggestionsRouter = require("./routes/suggestionsRoutes");

// Create an instance of the Express application
const app = express();

// Define the port the server will listen on
const port = 8801;

// MIDDLEWARE SETUP

// Enable CORS to allow requests from the frontend (on localhost:3000)
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

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

// Debug route
app.get("/api/debug/ping-session", (req, res) => {
  res.json({
    ok: true,
    userEmail: req.session?.userEmail || null,
    hasSession: !!req.session?.userEmail,
  });
});

// Parse incoming requests with JSON payloads
app.use(express.json());

// Use a custom logger middleware (prints request details)
app.use(logger);

// Print every incoming request's method and URL to the console (for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ROUTES 
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/locations", locationsRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", suggestionsRouter);
app.use("/api/travel", travelRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

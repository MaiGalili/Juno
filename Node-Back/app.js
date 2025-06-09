const express = require("express");
const session = require("express-session");
const cors = require("cors");
const logger = require("./logger");

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const locationsRoutes = require("./routes/locationsRoutes");

const app = express();
const port = 8801;

// הגדרות CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// הגדרות session
app.use(
  session({
    secret: "mySuperSecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // הפוך ל-true בפרודקשן עם HTTPS
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.use(express.json());
app.use(logger);

// חיבור הנתיבים
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/locations", locationsRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

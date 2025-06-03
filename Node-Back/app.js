const express = require("express");
const app = express();
const logger = require("./logger");
const manageLogin = require("./routes/manageLogin");
const manageCategories = require("./routes/manageCategories");
const session = require("express-session");
const cors = require("cors");
const port = 8801;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(
  session({
    secret: "mySuperSecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true רק בפרודקשן עם HTTPS
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.use(express.json());
app.use(logger);

app.use("/manageLogin", manageLogin);
app.use("/manageCategories", manageCategories);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const express = require('express');
const app = express();
const logger = require('./logger')
const manageLogin = require('./routes/manageLogin')
const port = 8801;
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(logger);

app.use('/manageLogin', manageLogin)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

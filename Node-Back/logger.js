// logger.js
const logger = (req, res, next) => {
  const start = Date.now();

  // ANSI colors
  const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    gray: "\x1b[90m",
  };

  res.on("finish", () => {
    const duration = Date.now() - start;

    let statusColor = colors.green;
    if (res.statusCode >= 500) statusColor = colors.red;
    else if (res.statusCode >= 400) statusColor = colors.yellow;
    else if (res.statusCode >= 300) statusColor = colors.cyan;

    // Log format
    console.log(
      `${colors.bright}${colors.gray}========== Request Log ==========${colors.reset}`
    );
    console.log(
      `${colors.blue}Time:        ${colors.reset}${new Date().toISOString()}`
    );
    console.log(`${colors.blue}Method:      ${colors.reset}${req.method}`);
    console.log(`${colors.blue}URL:         ${colors.reset}${req.originalUrl}`);
    console.log(
      `${colors.blue}Query:       ${colors.reset}${JSON.stringify(req.query)}`
    );
    console.log(
      `${colors.blue}Body:        ${colors.reset}${JSON.stringify(req.body)}`
    );
    console.log(`${colors.blue}IP:          ${colors.reset}${req.ip}`);
    console.log(
      `${colors.blue}User-Agent:  ${colors.reset}${req.get("User-Agent")}`
    );
    console.log(
      `${colors.blue}Status:      ${statusColor}${res.statusCode}${colors.reset}`
    );
    console.log(
      `${colors.blue}ResponseTime: ${colors.reset}${colors.magenta}${duration}ms${colors.reset}`
    );
    console.log(
      `${colors.gray}==========================================${colors.reset}`
    );
  });

  next();
};

module.exports = logger;

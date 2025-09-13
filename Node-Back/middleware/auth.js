// middleware/auth.js

// Simple session-based auth guard for API routes
function requireAuth(req, res, next) {
  if (req.session && req.session.userEmail) return next();

  // Otherwise, block with 401 Unauthorized and a consistent JSON shape
  return res.status(401).json({ success: false, message: "Unauthorized" });
}

module.exports = { requireAuth };

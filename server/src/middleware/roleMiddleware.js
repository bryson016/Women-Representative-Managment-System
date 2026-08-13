function normalizeRole(role) {
  if (!role) return "citizen";
  return String(role).toLowerCase().trim();
}

function requireRole(allowedRoles) {
  const normalizedAllowed = allowedRoles.map((r) => normalizeRole(r));

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const userRole = normalizeRole(req.user.role);

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden." });
    }

    next();
  };
}

module.exports = {
  requireRole,
  normalizeRole,
};

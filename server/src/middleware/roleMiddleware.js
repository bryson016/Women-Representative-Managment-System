function normalizeRole(role) {
  if (!role) return "citizen";
  return String(role).toLowerCase().trim();
}

// Map legacy roles to new role hierarchy for backward compatibility
function getRoleLevel(role) {
  const normalized = normalizeRole(role);
  const roleLevels = {
    super_admin: 5,
    admin: 4,
    finance_officer: 3,
    officer: 3, // backward compatibility
    staff: 2,
    viewer: 1,
    citizen: 0,
  };
  return roleLevels[normalized] ?? 0;
}

function hasRoleLevel(userRole, requiredLevel) {
  return getRoleLevel(userRole) >= requiredLevel;
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

function requireMinRole(minRole) {
  const minLevel = getRoleLevel(minRole);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const userRole = normalizeRole(req.user.role);
    const userLevel = getRoleLevel(userRole);

    if (userLevel < minLevel) {
      return res.status(403).json({ message: "Forbidden." });
    }

    next();
  };
}

function isFinanceOfficer(req) {
  const role = normalizeRole(req.user?.role);
  return role === "finance_officer" || role === "officer" || role === "admin" || role === "super_admin";
}

function isAdmin(req) {
  const role = normalizeRole(req.user?.role);
  return role === "admin" || role === "super_admin";
}

module.exports = {
  requireRole,
  requireMinRole,
  hasRoleLevel,
  isFinanceOfficer,
  isAdmin,
  normalizeRole,
  getRoleLevel,
};

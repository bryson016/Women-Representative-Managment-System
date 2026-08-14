# Admin User Setup Guide

## Method 1: Direct MySQL Query (Fastest)

Run this in phpMyAdmin SQL tab or MySQL console:

```sql
USE ward_management;

INSERT INTO users (full_name, username, password_hash, role, ward, email, phone_number, is_active)
VALUES (
  'System Administrator',
  'admin',
  NULL,
  'admin',
  'Westlands',
  'admin@ward.gov.ke',
  '+254 700 000 000',
  TRUE
);
```

---

## Method 2: Node.js Script

Create `server/scripts/create-admin.js`:

```javascript
const pool = require('../config/db');

async function createAdmin() {
  await pool.execute(
    `INSERT INTO users (full_name, username, password_hash, role, ward, email, phone_number, is_active)
     VALUES (?, ?, NULL, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE role = 'admin'`,
    ['System Administrator', 'admin', 'admin', 'Westlands', 'admin@ward.gov.ke', '+254 700 000 000', true]
  );

  console.log('Admin user created/updated successfully');
  process.exit(0);
}

createAdmin().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
```

Run: `node server/scripts/create-admin.js`

---

## Method 3: Registration Endpoint + Manual Role Update

1. Register via API:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","fullName":"Admin User"}'
```

2. Update role in database:
```sql
UPDATE users SET role = 'admin' WHERE username = 'admin';
```

---

## Method 4: Add Admin Creation API Endpoint

Add to `server/src/routes/authRoutes.js`:

```javascript
const { authenticateToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const pool = require("../config/db");

router.post("/create-admin", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const { username, fullName, ward, email } = req.body;

    if (!username || !fullName) {
      return res.status(400).json({ message: "Username and full name are required." });
    }

    await pool.execute(
      `INSERT INTO users (username, full_name, password_hash, role, ward, email, is_active)
       VALUES (?, ?, NULL, 'admin', ?, ?, TRUE)`,
      [username, fullName, ward || 'Westlands', email || '']
    );

    return res.status(201).json({ message: "Admin user created successfully." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Username already exists." });
    }
    console.error("Create admin error:", error);
    return res.status(500).json({ message: "Failed to create admin user." });
  }
});
```

---

## Method 5: Prisma Client

```javascript
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { role: 'admin' },
    create: {
      username: 'admin',
      fullName: 'System Administrator',
      passwordHash: null,
      role: 'admin',
      ward: 'Westlands',
      email: 'admin@ward.gov.ke',
      isActive: true,
    },
  });

  console.log('Admin user created');
}
```

---

## Pre-configured Test Users

| Username | Role | Purpose |
|----------|------|---------|
| `admin` | admin | Full system access |
| `staff` | staff | Staff dashboard access |
| `citizen` | citizen | Citizen portal access |

> Note: Password login has been disabled. Users authenticate with username only.

---

## Verification

After creating users, verify with:
```sql
SELECT id, full_name, username, role, ward, email, is_active FROM users;
```

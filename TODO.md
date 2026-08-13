# Backend Reconfiguration: XAMPP MySQL + Prisma (MySQL)

## Steps
- [x] 1. Fix `server/prisma/schema.prisma` - replace PostgreSQL `@db.Timestamptz(6)` with MySQL-compatible types
- [x] 2. Fix `server/.env` - set `DATABASE_URL` for XAMPP MySQL (blank password)
- [x] 3. Regenerate Prisma client (`npx prisma generate`)
- [x] 4. Update `server/src/server.js` - add "Database connected successfully" log when MySQL connects
- [x] 5. Start XAMPP MySQL and verify backend connects & listens on port 5000
- [x] 6. Verify registration writes to MySQL and login reads from MySQL

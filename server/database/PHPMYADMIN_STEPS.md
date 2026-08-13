# Exact phpMyAdmin Steps to Create Admin User

## Prerequisites
- XAMPP is installed and running
- MySQL is started in XAMPP Control Panel
- The `ward_management` database exists
- The `users` table exists (created from schema.sql)

---

## Step-by-Step Instructions

### Step 1: Open phpMyAdmin
1. Open your web browser (Chrome, Firefox, etc.)
2. Type this in the address bar: `http://localhost/phpmyadmin`
3. Press Enter
4. You should see the phpMyAdmin homepage with a list of databases on the left

### Step 2: Select the Database
1. Look at the **left sidebar** in phpMyAdmin
2. Find **`ward_management`** in the list of databases
3. **Click on `ward_management`**
4. The main area will change to show "Database: ward_management"
5. You'll see a list of tables (users, citizens, complaints, projects, etc.)

### Step 3: Click the SQL Tab
1. Look at the **top of the main area** (where the tables are listed)
2. You'll see several tabs: Browse, Structure, SQL, Search, Insert, etc.
3. **Click on the `SQL` tab**
4. A new page will load with a large text box

### Step 4: Copy the SQL Query
1. Open the file `server/database/setup_admin.sql` in VS Code
2. **Copy the entire contents** of that file
   - Or copy just the admin user section below:

```sql
USE ward_management;

INSERT INTO users (full_name, username, password_hash, role, ward, email, phone_number, is_active)
VALUES (
  'System Administrator',
  'admin',
  '$2b$10$rR.yJxYNESPKppuGLUDXg.5/WMHJUQE847r79lMNtcoEEsYQE/iR6',
  'admin',
  'Westlands',
  'admin@ward.gov.ke',
  '+254 700 000 000',
  TRUE
);
```

### Step 5: Paste into phpMyAdmin
1. Go back to phpMyAdmin (the SQL tab page)
2. **Click inside the large text box** that says "Run SQL query"
3. **Paste the SQL** you copied (Ctrl+V or right-click → Paste)
4. The text box should now contain the SQL query

### Step 6: Execute the Query
1. Look at the **bottom right** of the text box
2. Click the **`Go`** button
3. Wait a moment...
4. You should see a **green success message** like:
   - "1 row affected"
   - "The query has been executed successfully"

### Step 7: Verify the User Was Created
1. Look at the **left sidebar** again
2. Find and **click on the `users` table**
3. Click the **`Browse`** tab at the top
4. You should see a row with:
   - `id`: 1 (or 2 if you already have users)
   - `full_name`: System Administrator
   - `username`: admin
   - `role`: admin
   - `ward`: Westlands
   - `email`: admin@ward.gov.ke
   - `is_active`: 1

### Step 8: Test the Login
1. Open a new browser tab
2. Go to: `http://localhost:5173/login`
3. Enter:
   - **Username:** `admin`
   - **Password:** `Admin@123`
4. Click **Login**
5. You should be redirected to `/dashboard` (the admin dashboard)

---

## If You Get Errors

### Error: "Duplicate entry 'admin' for key 'users.username'"
The admin user already exists. Update it instead:
```sql
UPDATE users SET role = 'admin' WHERE username = 'admin';
```

### Error: "Table 'ward_management.users' doesn't exist"
You need to create the database schema first:
1. Go to `http://localhost/phpmyadmin`
2. Select `ward_management` database
3. Click the **`Import`** tab
4. Choose file: `server/database/schema.sql`
5. Click **Go**

### Error: "Access denied for user 'root'@'localhost'"
This is a MySQL permission error. Check your XAMPP MySQL credentials.

---

## Creating Additional Users

### Staff User
Repeat Steps 3-6 with this SQL:
```sql
INSERT INTO users (full_name, username, password_hash, role, ward, email, phone_number, is_active)
VALUES (
  'Staff User',
  'staff',
  '$2b$10$rR.yJxYNESPKppuGLUDXg.5/WMHJUQE847r79lMNtcoEEsYQE/iR6',
  'staff',
  'Westlands',
  'staff@ward.gov.ke',
  '+254 700 000 001',
  TRUE
);
```

### Citizen User
Repeat Steps 3-6 with this SQL:
```sql
INSERT INTO users (full_name, username, password_hash, role, ward, email, phone_number, is_active)
VALUES (
  'John Citizen',
  'citizen',
  '$2b$10$rR.yJxYNESPKppuGLUDXg.5/WMHJUQE847r79lMNtcoEEsYQE/iR6',
  'citizen',
  'Westlands',
  'citizen@ward.gov.ke',
  '+254 700 000 002',
  TRUE
);
```

---

## Quick Reference: Login Credentials

| Username | Password | Role | Dashboard |
|----------|----------|------|-----------|
| admin | Admin@123 | admin | /dashboard |
| staff | Admin@123 | staff | /dashboard |
| citizen | Admin@123 | citizen | /citizen/dashboard |

---

## Visual Guide

```
phpMyAdmin Homepage
    ↓
Click "ward_management" (left sidebar)
    ↓
Click "SQL" tab (top of main area)
    ↓
Paste SQL query in text box
    ↓
Click "Go" button (bottom right)
    ↓
See "1 row affected" message
    ↓
Click "users" table (left sidebar)
    ↓
Click "Browse" tab
    ↓
Verify user exists
```

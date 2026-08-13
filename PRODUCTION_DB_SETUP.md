# 🗄️ Production Database Setup Guide

## Problem Resolved

✅ **MySQL connection working**  
❌ **Missing tables:** `products`, `blogs`, `site_settings`, `admin_users`

---

## Required Tables

The application expects **4 tables**:

| Table | Purpose | Rows Expected |
|-------|---------|---------------|
| `products` | Product catalog (tiles, adhesives, grouts, etc.) | ~27-31 rows |
| `blogs` | Blog posts about products and applications | ~3-5 rows |
| `site_settings` | Key-value configuration (catalogue PDF, etc.) | ~2 rows |
| `admin_users` | Admin authentication (future implementation) | 0-1 rows |

---

## 📋 Schema Overview

### Products Table
- **Primary Key:** `id` (CHAR(36) UUID)
- **Unique:** `slug` (VARCHAR(255))
- **Categories:** Tiles & Stone, Waterproofing, Grouts, Wall Solutions, Tools
- **JSON Columns:** `features`, `applications`, `gallery`, `application_list`
- **SEO:** `seo_title`, `seo_description`
- **Publishing:** `published` (TINYINT), `sort_order` (INT)

### Blogs Table
- **Primary Key:** `id` (CHAR(36) UUID)
- **Unique:** `slug` (VARCHAR(255))
- **JSON Column:** `sections` (array of {heading, body, list})
- **SEO:** `seo_title`, `seo_description`
- **Publishing:** `published` (TINYINT), `published_at` (DATETIME)

### Site Settings Table
- **Primary Key:** `key` (VARCHAR(255))
- **Keys Used:** `catalogue_title`, `catalogue_pdf`

### Admin Users Table
- **Primary Key:** `id` (CHAR(36) UUID)
- **Unique:** `email` (VARCHAR(255))
- **Auth:** `password_hash` (VARCHAR(255) - Argon2id when implemented)

---

## 🚀 Initialize Hostinger Production Database

### Prerequisites

- Hostinger MySQL credentials working ✅
- MySQL client installed on your Mac
- Database `u860840011_HIR_HUB` already exists ✅

### Step 1: Download the Schema File

The schema file is: `init-production-db.sql`

This file is **safe to run** on an existing database:
- Uses `CREATE TABLE IF NOT EXISTS`
- Does NOT drop tables
- Does NOT delete data
- Uses `INSERT IGNORE` for default settings

### Step 2: Run the Initialization Script

**From your Mac terminal:**

```bash
mysql -h srv1752.hstgr.io -P 3306 -u u860840011_hirhub -p u860840011_HIR_HUB < init-production-db.sql
```

**When prompted, enter your MySQL password.**

### Step 3: Verify Tables Created

After running the script, connect to verify:

```bash
mysql -h srv1752.hstgr.io -P 3306 -u u860840011_hirhub -p u860840011_HIR_HUB
```

Then run:

```sql
SHOW TABLES;
```

**Expected output:**

```
+-----------------------------------+
| Tables_in_u860840011_HIR_HUB     |
+-----------------------------------+
| admin_users                       |
| blogs                             |
| products                          |
| site_settings                     |
+-----------------------------------+
4 rows in set (0.XX sec)
```

### Step 4: Verify Table Structure

```sql
DESCRIBE products;
DESCRIBE blogs;
DESCRIBE site_settings;
SELECT * FROM site_settings;
```

**Expected site_settings:**

```
+------------------+-------------------------------+
| key              | value                         |
+------------------+-------------------------------+
| catalogue_title  | HIR Master Product Catalogue  |
| catalogue_pdf    | NULL                          |
+------------------+-------------------------------+
```

---

## 📊 Current Data Status

After initialization, tables will be **empty** except for default site settings:

- **products:** 0 rows (empty - ready for admin to add products)
- **blogs:** 0 rows (empty - ready for admin to add blogs)
- **site_settings:** 2 rows (defaults: catalogue_title, catalogue_pdf)
- **admin_users:** 0 rows (empty - auth not yet implemented)

---

## ✅ Post-Initialization Verification

### Test 1: Application Connection

After running the schema, your production application should:

1. ✅ Connect to MySQL successfully
2. ✅ Not show "missing table" errors
3. ✅ Display empty products page (no products yet)
4. ✅ Display empty blogs page (no blogs yet)
5. ✅ Admin panel accessible (using current simple token auth)

### Test 2: Admin Upload Test

1. Go to admin panel
2. Try creating a new product
3. Try uploading a catalogue PDF
4. Verify data saves to database

### Test 3: Database Query Test

From MySQL client:

```sql
-- After adding a product in admin:
SELECT COUNT(*) FROM products;
SELECT slug, name, published FROM products LIMIT 5;

-- After adding a blog in admin:
SELECT COUNT(*) FROM blogs;
SELECT slug, title, published FROM blogs LIMIT 5;

-- Check site settings:
SELECT * FROM site_settings;
```

---

## 🔄 Migrating Existing Data (Optional)

If you have existing products/blogs data from:
- Local XAMPP database
- Previous Supabase database
- CSV exports

You'll need to migrate them separately. The tables are now ready to receive data.

### Export from Local XAMPP:

```bash
# Export products
mysqldump -u root hir_industries products > products_backup.sql

# Export blogs
mysqldump -u root hir_industries blogs > blogs_backup.sql

# Import to Hostinger
mysql -h srv1752.hstgr.io -u u860840011_hirhub -p u860840011_HIR_HUB < products_backup.sql
mysql -h srv1752.hstgr.io -u u860840011_hirhub -p u860840011_HIR_HUB < blogs_backup.sql
```

---

## 🔐 Environment Variables

**No changes needed** to your Hostinger environment variables:

```
✅ DATABASE_HOST=srv1752.hstgr.io
✅ DATABASE_PORT=3306
✅ DATABASE_NAME=u860840011_HIR_HUB
✅ DATABASE_USER=u860840011_hirhub
✅ DATABASE_PASSWORD=<your-password>
✅ STORAGE_BASE_PATH=/home/u860840011/domains/hiradhesive.com/public_html/uploads
```

These are correct and working.

---

## 🐛 Troubleshooting

### Issue: "Table already exists" error

**Cause:** Tables were partially created  
**Solution:** The script uses `CREATE TABLE IF NOT EXISTS` - it's safe to re-run

### Issue: Can't connect to MySQL

**Solution:** Verify your password is correct:
```bash
mysql -h srv1752.hstgr.io -u u860840011_hirhub -p
# Enter password when prompted
# If you can connect, the credentials are correct
```

### Issue: "Access denied" error

**Cause:** Remote MySQL might have been disabled again  
**Solution:** Re-enable remote MySQL in Hostinger panel (see main documentation)

### Issue: Default JSON values error

**Cause:** MySQL 5.7 doesn't support DEFAULT ('[]') syntax  
**Solution:** The script uses `('[]')` which works on both MySQL 5.7 and 8.0

### Issue: Application still shows errors

**Cause:** Application needs restart to pick up new tables  
**Solution:** 
1. In Hostinger, restart your Node.js application
2. Or wait for automatic reload (if enabled)
3. Check logs for new errors

---

## 📝 Summary

| Task | File | Command |
|------|------|---------|
| **Initialize Production DB** | `init-production-db.sql` | `mysql -h srv1752.hstgr.io -u u860840011_hirhub -p u860840011_HIR_HUB < init-production-db.sql` |
| **Verify Tables** | - | `mysql -h srv1752.hstgr.io -u u860840011_hirhub -p -e "SHOW TABLES" u860840011_HIR_HUB` |
| **Check Schema** | `src/lib/db/schema.sql` | Reference for local development |
| **Local Setup** | `setup-db.sh` | For XAMPP local development only |

---

## ✨ Next Steps After Initialization

1. **Verify** tables created successfully
2. **Restart** Node.js application on Hostinger
3. **Test** application loads without database errors
4. **Add** products and blogs via admin panel
5. **Migrate** existing data (if needed)
6. **Implement** proper authentication (future enhancement)

---

**🎉 After running the initialization script, your production database will be ready for the application!**

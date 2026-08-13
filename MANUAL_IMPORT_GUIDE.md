# 🔧 Manual Data Import Guide - Hostinger phpMyAdmin

## ⚠️ Issue Encountered

Your Mac's MySQL 9.5 client cannot connect to Hostinger's MySQL server due to authentication plugin incompatibility:
```
ERROR 2059: Authentication plugin 'mysql_native_password' cannot be loaded
```

This is a **client-side issue**, not a password or credential problem. The data export is ready and valid.

---

## ✅ Solution: Import via Hostinger phpMyAdmin

### **Method 1: phpMyAdmin Import (Recommended)**

#### Step 1: Access phpMyAdmin

1. Log into **Hostinger hPanel**: https://hpanel.hostinger.com
2. Navigate to: **Databases** → **MySQL Databases**
3. Find database: `u860840011_HIR_HUB`
4. Click **"phpMyAdmin"** button

#### Step 2: Select Database

1. In phpMyAdmin left sidebar, click: `u860840011_HIR_HUB`
2. You should see 4 tables: `admin_users`, `blogs`, `products`, `site_settings`

#### Step 3: Import Data

1. Click the **"Import"** tab at the top
2. Click **"Choose File"** button
3. Navigate to: `/Applications/XAMPP/xamppfiles/htdocs/hir-hub-main 2/`
4. Select file: **`local_production_data.sql`**
5. **Format:** Auto-detect (should show "SQL")
6. **Partial import:** Leave unchecked
7. **Other options:** Leave as default
8. Click **"Import"** button at the bottom

#### Step 4: Wait for Completion

**Expected result:**
```
Import has been successfully finished, 34 queries executed.
```

If you see any errors, **STOP** and report them immediately.

#### Step 5: Verify Import

In phpMyAdmin, click **"SQL"** tab and run these queries one by one:

```sql
SELECT COUNT(*) as products_count FROM products;
```
**Expected:** 27

```sql
SELECT COUNT(*) as blogs_count FROM blogs;
```
**Expected:** 5

```sql
SELECT COUNT(*) as settings_count FROM site_settings;
```
**Expected:** 2

```sql
SELECT id, slug, name, category FROM products LIMIT 3;
```
**Expected:** Shows prod-001, prod-002, prod-003 with HIR ALPHA, BETA, GAMMA

```sql
SELECT `key`, LEFT(value, 50) as value_preview FROM site_settings;
```
**Expected:** Shows catalogue_title and catalogue_pdf

---

### **Method 2: Alternative MySQL Client**

If phpMyAdmin doesn't work, try using an older MySQL client or MySQL Workbench:

#### Option A: MySQL Workbench (GUI Tool)

1. Download: https://dev.mysql.com/downloads/workbench/
2. Create new connection:
   - Hostname: `srv1752.hstgr.io`
   - Port: `3306`
   - Username: `u860840011_hirhub`
   - Password: (click "Store in Keychain" and enter)
   - Database: `u860840011_HIR_HUB`
3. Connect and run: **"Server" → "Data Import"**
4. Select: `local_production_data.sql`
5. Start Import

#### Option B: Install Older MySQL Client

```bash
# Install MySQL 8.0 client (compatible with mysql_native_password)
brew install mysql-client@8.0

# Use the 8.0 client
/opt/homebrew/opt/mysql-client@8.0/bin/mysql -h srv1752.hstgr.io -P 3306 -u u860840011_hirhub -p u860840011_HIR_HUB < local_production_data.sql
```

---

### **Method 3: Manual SQL Execution (Last Resort)**

If file import doesn't work, you can execute INSERT statements manually:

1. Open `local_production_data.sql` in a text editor
2. Copy all INSERT statements for products (27 statements)
3. Paste into phpMyAdmin SQL tab
4. Click "Go"
5. Repeat for blogs (5 statements)
6. Repeat for site_settings (2 statements)

---

## 📋 Post-Import Verification

After successful import, run these verification queries in phpMyAdmin:

### Check All Counts
```sql
SELECT 
  'products' as table_name, COUNT(*) as row_count FROM products
UNION ALL
SELECT 
  'blogs' as table_name, COUNT(*) as row_count FROM blogs
UNION ALL
SELECT 
  'site_settings' as table_name, COUNT(*) as row_count FROM site_settings
UNION ALL
SELECT 
  'admin_users' as table_name, COUNT(*) as row_count FROM admin_users;
```

**Expected Output:**
```
+--------------+-----------+
| table_name   | row_count |
+--------------+-----------+
| products     |        27 |
| blogs        |         5 |
| site_settings|         2 |
| admin_users  |         0 |
+--------------+-----------+
```

### Verify Sample Product
```sql
SELECT id, slug, name, category, published 
FROM products 
WHERE slug = 'hir-alpha-tiles';
```

**Expected:**
- id: `prod-001`
- slug: `hir-alpha-tiles`
- name: `HIR ALPHA Tiles`
- category: `Tiles & Stone Solutions`
- published: `1`

### Verify Sample Blog
```sql
SELECT id, slug, title, published 
FROM blogs 
WHERE id = 'blog-001';
```

**Expected:**
- id: `blog-001`
- slug: `complete-guide-choosing-right-tile-adhesive`
- title: `Complete Guide to Choosing the Right Tile Adhesive`
- published: `1`

### Verify Site Settings
```sql
SELECT `key`, value FROM site_settings ORDER BY `key`;
```

**Expected:**
```
+-----------------+-------------------------------------------------------------+
| key             | value                                                       |
+-----------------+-------------------------------------------------------------+
| catalogue_pdf   | /storage/product-pdfs/hir-main-catlouge-1-1786542410758.pdf |
| catalogue_title | HIR Master Product Catalogue                                |
+-----------------+-------------------------------------------------------------+
```

### Verify JSON Data
```sql
SELECT 
  slug, 
  JSON_LENGTH(features) as feature_count,
  JSON_LENGTH(gallery) as gallery_count
FROM products 
WHERE id = 'prod-001';
```

**Expected:** Feature count > 0, gallery count >= 0

---

## 🚀 After Successful Import

### 1. Restart Hostinger Application

1. Go to Hostinger hPanel
2. Navigate to: **Website** → **Node.js**
3. Click **"Restart Application"**

### 2. Test Production Website

Visit: https://hiradhesive.com/products

**Expected Result:** Page loads showing 27 products

Visit: https://hiradhesive.com/blogs

**Expected Result:** Page loads showing 5 blog posts

### 3. Test Admin Panel

Visit: https://hiradhesive.com/admin

**Expected Result:** Can access admin and see products/blogs in CMS

---

## ⚠️ If Import Fails

**DO NOT:**
- Run TRUNCATE or DELETE commands
- Drop and recreate tables
- Modify the SQL file

**DO:**
- Note the exact error message
- Check which INSERT statement failed
- Report the error for troubleshooting
- The database will remain in a safe state

---

## 📝 Files Created

| File | Purpose |
|------|---------|
| `local_production_data.sql` | **Data export (ready to import)** |
| `DATA_MIGRATION_REPORT.md` | Complete pre-import analysis |
| `MANUAL_IMPORT_GUIDE.md` | This guide |

---

## ✅ Summary

**Data Ready:** ✅ 27 products, 5 blogs, 2 settings  
**Schema Match:** ✅ 100% compatible  
**Import Method:** phpMyAdmin (Hostinger hPanel)  
**Safety:** ✅ No destructive commands  

**Recommendation:** Use phpMyAdmin import - it's the most reliable method for Hostinger.

Good luck! 🚀

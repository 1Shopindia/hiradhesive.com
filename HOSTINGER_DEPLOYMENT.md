# 🚀 Hostinger Deployment Guide - HIR Industries

Complete step-by-step guide to deploy this application on Hostinger.

---

## ⚠️ PRODUCTION DATABASE INITIALIZATION REQUIRED

**🔴 CRITICAL:** Before deploying, you must initialize the production database with required tables.

**See:** `PRODUCTION_DB_SETUP.md` for detailed instructions.

**Quick Command:**
```bash
mysql -h srv1752.hstgr.io -P 3306 -u u860840011_hirhub -p u860840011_HIR_HUB < init-production-db.sql
```

**Required Tables:** `products`, `blogs`, `site_settings`, `admin_users`

---

## 📋 Pre-Deployment Checklist

### ✅ What You Need:

1. **Hostinger Account** with Node.js hosting enabled
2. **MySQL Database** credentials from Hostinger
3. **SSH/FTP Access** to Hostinger
4. **Domain** configured (hiradhesive.com)

### ✅ Database Information:

```
Host: srv1752.hstgr.io
Port: 3306
Database Name: u860840011_HIR_HUB
Username: u860840011_hirhub
Password: <your-password-from-hostinger>
```

---

## 🏗️ Step 1: Prepare Application for Deployment

### 1.1 Build the Application

```bash
cd "/Applications/XAMPP/xamppfiles/htdocs/hir-hub-main 2"

# Install dependencies (if not already done)
npm install

# Build for production
npm run build
```

**Expected Output:**
- `.output/` directory will be created
- Contains server and client bundles
- Check for any build errors

### 1.2 Verify Build Output

```bash
ls -la .output/
```

You should see:
- `server/` - Server-side code
- `public/` - Static assets
- `nitro.json` - Nitro configuration

---

## 📤 Step 2: Upload to Hostinger

### Option A: Using FTP/SFTP (Recommended)

1. **Connect to Hostinger via FTP:**
   - Host: `ftp.hiradhesive.com` (or provided by Hostinger)
   - Username: Your hosting username
   - Password: Your hosting password
   - Port: 21 (FTP) or 22 (SFTP)

2. **Upload Files:**
   ```
   Upload to: /home/u860840011/domains/hiradhesive.com/public_html/
   
   Upload these directories/files:
   ✓ .output/          (entire directory)
   ✓ node_modules/     (entire directory)
   ✓ package.json
   ✓ package-lock.json
   ```

### Option B: Using SSH + Git

1. **SSH into Hostinger:**
   ```bash
   ssh u860840011@hiradhesive.com
   ```

2. **Clone/Upload Code:**
   ```bash
   cd ~/domains/hiradhesive.com/public_html
   
   # If using Git
   git clone <your-repo-url> .
   
   # Install dependencies
   npm install
   
   # Build
   npm run build
   ```

---

## ⚙️ Step 3: Configure Environment Variables in Hostinger

### 3.1 Access Hostinger Node.js App Panel

1. Log into Hostinger hPanel
2. Navigate to: **Website** → **Node.js**
3. Select your application
4. Click **Environment Variables**

### 3.2 Set Required Environment Variables

**Add these EXACT variables:**

```env
DATABASE_HOST=srv1752.hstgr.io
DATABASE_PORT=3306
DATABASE_NAME=u860840011_HIR_HUB
DATABASE_USER=u860840011_hirhub
DATABASE_PASSWORD=<your-actual-password-from-hostinger>
STORAGE_BASE_PATH=/home/u860840011/domains/hiradhesive.com/public_html/uploads
NODE_ENV=production
```

**⚠️ CRITICAL:**
- Use the ACTUAL password from Hostinger MySQL
- Do NOT include quotes around values
- Do NOT add spaces around `=`
- Double-check for typos

---

## 📁 Step 4: Create Storage Directory

### 4.1 Create uploads directory via SSH or File Manager

```bash
# Via SSH:
ssh u860840011@hiradhesive.com
cd ~/domains/hiradhesive.com/public_html
mkdir -p uploads/product-pdfs
mkdir -p uploads/product-images
mkdir -p uploads/blog-images
chmod 755 uploads
chmod 755 uploads/*
```

### 4.2 Verify Directory Structure

```
public_html/
├── .output/
├── node_modules/
├── uploads/
│   ├── product-pdfs/
│   ├── product-images/
│   └── blog-images/
├── package.json
└── package-lock.json
```

---

## 🗄️ Step 5: Initialize Database Tables

**⚠️ MOST IMPORTANT STEP**

### 5.1 Run Database Initialization Script

**From your Mac terminal:**

```bash
mysql -h srv1752.hstgr.io -P 3306 -u u860840011_hirhub -p u860840011_HIR_HUB < init-production-db.sql
```

**When prompted, enter your MySQL password.**

This creates:
- ✅ `products` table (27 columns, JSON support, indexes)
- ✅ `blogs` table (13 columns, JSON support, indexes)  
- ✅ `site_settings` table (key-value configuration)
- ✅ `admin_users` table (for future auth)
- ✅ Default site settings (catalogue title)

**The script is safe:** Uses `CREATE TABLE IF NOT EXISTS`, won't delete existing data.

### 5.2 Verify Tables Created

```bash
mysql -h srv1752.hstgr.io -P 3306 -u u860840011_hirhub -p u860840011_HIR_HUB -e "SHOW TABLES"
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
```

### 5.3 Alternative: Via phpMyAdmin

1. Go to Hostinger hPanel → Databases → phpMyAdmin
2. Select database: `u860840011_HIR_HUB`
3. Click **Import** tab
4. Upload `init-production-db.sql`
5. Click **Go**

**📖 For detailed schema documentation, see:** `PRODUCTION_DB_SETUP.md`

---

## 🗄️ Step 6: Verify Database Tables (LEGACY - Use Step 5 Instead)

### 6.1 Connect to MySQL via Hostinger phpMyAdmin

1. Go to Hostinger hPanel
2. Navigate to **Databases** → **phpMyAdmin**
3. Select database: `u860840011_HIR_HUB`

### 5.2 Required Tables

Verify these tables exist:

```sql
- products
- blogs  
- site_settings
```

### 5.3 If Tables Missing, Import Schema

```sql
-- Run this in phpMyAdmin SQL tab:

CREATE TABLE IF NOT EXISTS products (
  id CHAR(36) PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  image TEXT,
  category VARCHAR(100) NOT NULL,
  short TEXT,
  description TEXT,
  category_label VARCHAR(100),
  application_area VARCHAR(100),
  pack VARCHAR(100),
  coverage VARCHAR(255),
  surface VARCHAR(100),
  color VARCHAR(100),
  features JSON,
  applications JSON,
  gallery JSON NOT NULL DEFAULT '[]',
  video_url TEXT,
  published TINYINT(1) NOT NULL DEFAULT 1,
  seo_title VARCHAR(70),
  seo_description VARCHAR(170),
  pdf TEXT,
  shades_image TEXT,
  application_list JSON,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blogs (
  id CHAR(36) PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  image TEXT,
  excerpt TEXT,
  sections JSON NOT NULL DEFAULT '[]',
  author VARCHAR(255),
  category VARCHAR(100),
  published TINYINT(1) NOT NULL DEFAULT 1,
  published_at DATETIME,
  seo_title VARCHAR(70),
  seo_description VARCHAR(170),
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_settings (
  `key` VARCHAR(255) PRIMARY KEY,
  value TEXT,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🚀 Step 7: Configure Node.js Application in Hostinger

### 7.1 Set Application Entry Point

In Hostinger Node.js panel:

1. **Application Root**: `/home/u860840011/domains/hiradhesive.com/public_html`
2. **Application Startup File**: `.output/server/index.mjs`
3. **Node.js Version**: Select 18.x or higher

### 7.2 Start the Application

Click **Start Application** or **Restart Application**

---

## 🔍 Step 8: Verify Deployment

### 8.1 Check Application Status

In Hostinger Node.js panel:
- Status should be: **Running** ✅
- View logs for any errors

### 8.2 Test Website

1. **Visit:** https://hiradhesive.com
2. **Check Homepage:** Should load without errors
3. **Test Admin:** https://hiradhesive.com/admin
4. **Test Products:** https://hiradhesive.com/products
5. **Test Blogs:** https://hiradhesive.com/blogs

### 8.3 Test Database Connection

Visit: https://hiradhesive.com/products

- Should show products from database
- If "Database request failed" → check environment variables

### 8.4 Test File Upload

1. Login to admin: https://hiradhesive.com/admin
2. Go to Catalogue page
3. Try uploading a PDF
4. Should save successfully

---

## 🐛 Troubleshooting

### Issue 1: "Database request failed"

**Symptoms:**
- Products page shows error
- Admin panels don't load data

**Solutions:**

1. **Verify Environment Variables:**
   ```bash
   # SSH into server
   ssh u860840011@hiradhesive.com
   cd ~/domains/hiradhesive.com/public_html
   
   # Check if Node.js can access variables
   node -e "console.log(process.env.DATABASE_HOST)"
   ```

2. **Check Hostinger Environment Panel:**
   - Go to Node.js → Environment Variables
   - Verify ALL variables are set
   - NO typos in variable names
   - NO extra spaces

3. **Verify MySQL Connection:**
   ```bash
   mysql -h srv1752.hstgr.io -u u860840011_hirhub -p u860840011_HIR_HUB
   # Enter password when prompted
   # Should connect successfully
   ```

4. **Check Application Logs:**
   - Hostinger Node.js panel → View Logs
   - Look for: `[db:config]` messages
   - Should show: "Database configuration loaded"

### Issue 2: "Access denied for user"

**Root Cause:** Wrong password or user doesn't have permissions

**Solutions:**

1. **Reset MySQL Password in Hostinger:**
   - Go to Databases → MySQL
   - Find user: `u860840011_hirhub`
   - Change password
   - Update environment variable immediately

2. **Grant Permissions:**
   ```sql
   -- Run in phpMyAdmin:
   GRANT ALL PRIVILEGES ON u860840011_HIR_HUB.* TO 'u860840011_hirhub'@'%';
   FLUSH PRIVILEGES;
   ```

### Issue 3: File Upload Fails

**Symptoms:**
- PDF upload shows error
- "Failed to save file"

**Solutions:**

1. **Check Directory Permissions:**
   ```bash
   ssh u860840011@hiradhesive.com
   cd ~/domains/hiradhesive.com/public_html
   ls -la uploads/
   
   # Should show: drwxr-xr-x
   
   # Fix if needed:
   chmod 755 uploads
   chmod 755 uploads/*
   ```

2. **Verify Storage Path:**
   ```bash
   # Check environment variable
   echo $STORAGE_BASE_PATH
   
   # Should be: /home/u860840011/domains/hiradhesive.com/public_html/uploads
   ```

3. **Check Disk Space:**
   ```bash
   df -h
   ```

### Issue 4: Application Won't Start

**Symptoms:**
- Status: Stopped or Error
- "Module not found" errors

**Solutions:**

1. **Reinstall Dependencies:**
   ```bash
   ssh u860840011@hiradhesive.com
   cd ~/domains/hiradhesive.com/public_html
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Rebuild Application:**
   ```bash
   npm run build
   ```

3. **Check Node.js Version:**
   - Hostinger panel → Node.js Version
   - Should be 18.x or higher

4. **Verify Entry Point:**
   - Should be: `.output/server/index.mjs`
   - File should exist after build

### Issue 5: Static Files Not Loading

**Symptoms:**
- CSS/JS not loading
- Images broken

**Solutions:**

1. **Check .output/public/ directory:**
   ```bash
   ls -la .output/public/
   ```

2. **Verify Build Completed:**
   ```bash
   npm run build
   ```

3. **Check Hostinger Static Files Settings:**
   - Public directory should point to `.output/public`

---

## 📊 Monitoring & Maintenance

### Daily Checks

1. **Application Status:** Hostinger Node.js panel
2. **Error Logs:** Check for MySQL errors
3. **Disk Space:** Monitor uploads directory size
4. **Database Size:** Check in phpMyAdmin

### Weekly Tasks

1. **Backup Database:** Export from phpMyAdmin
2. **Backup Uploads:** Download uploads directory
3. **Review Logs:** Check for unusual errors

### Monthly Updates

1. **Update Dependencies:**
   ```bash
   npm update
   npm audit fix
   ```

2. **Rebuild:**
   ```bash
   npm run build
   ```

3. **Restart Application:** In Hostinger panel

---

## 🔐 Security Best Practices

### ✅ DO:
- Keep DATABASE_PASSWORD secret
- Use strong passwords (20+ characters)
- Regular backups
- Monitor logs for suspicious activity
- Keep Node.js and packages updated

### ❌ DON'T:
- Commit .env to Git
- Share database credentials
- Use weak passwords
- Expose phpMyAdmin publicly
- Leave debug mode enabled in production

---

## 📞 Support

### Hostinger Support
- **Knowledge Base:** https://support.hostinger.com
- **Chat:** Available 24/7 in hPanel
- **Email:** Use support ticket system

### Application Issues
- Check logs first
- Review this guide
- Verify environment variables
- Test database connection

---

## ✅ Deployment Success Checklist

- [ ] Build completed without errors
- [ ] Files uploaded to Hostinger
- [ ] Environment variables set in Hostinger panel
- [ ] Database tables verified
- [ ] Storage directory created with correct permissions
- [ ] Node.js application started successfully
- [ ] Homepage loads correctly
- [ ] Products page shows data from database
- [ ] Admin panel accessible
- [ ] File upload works
- [ ] No errors in application logs

---

🎉 **Congratulations!** Your application is now live on Hostinger!

Visit: https://hiradhesive.com

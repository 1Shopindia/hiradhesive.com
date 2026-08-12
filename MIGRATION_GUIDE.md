# Supabase to MySQL Migration - Implementation Complete

## ✅ IMPLEMENTATION STATUS

**All Supabase dependencies have been removed and replaced with MySQL + filesystem storage.**

### What Was Implemented

1. **MySQL Database Layer** (`src/lib/db/index.server.ts`)
   - Connection pool management with mysql2/promise
   - Complete CRUD operations for products, blogs, and site_settings
   - JSON column parsing for features, applications, gallery, sections
   - Parameterized queries for SQL injection protection
   - Proper error handling

2. **Filesystem Storage Service** (`src/lib/storage/index.server.ts`)
   - File upload with MIME type validation
   - Size limit enforcement (10MB images, 25MB PDFs)
   - Path traversal protection
   - Safe filename generation with timestamps
   - File serving with proper caching headers

3. **API Routes**
   - `/api/public/pdf/$` - PDF serving (already existed)
   - `/api/public/images/$bucket/$filename` - Image serving (newly created)

4. **MySQL Schema** (`schema.sql`)
   - Products table with all fields
   - Blogs table with all fields
   - Site settings table
   - Admin users table (for future auth)
   - Proper indexes for performance

5. **Removed Dependencies**
   - Deleted `src/integrations/supabase/` directory
   - Uninstalled `@supabase/supabase-js` package
   - Updated environment variables

## 🚀 DEPLOYMENT STEPS

### 1. Database Setup

```bash
# Connect to your MySQL database
mysql -h your-host -u your-user -p

# Create database
CREATE DATABASE hir_industries CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Import schema
mysql -h your-host -u your-user -p hir_industries < schema.sql
```

### 2. Environment Variables

Update your `.env` file on the server:

```env
# MySQL Database Configuration
DATABASE_HOST="your-mysql-host"
DATABASE_PORT="3306"
DATABASE_NAME="hir_industries"
DATABASE_USER="your-mysql-user"
DATABASE_PASSWORD="your-mysql-password"

# Storage Configuration
STORAGE_BASE_PATH="/var/www/hir-storage"
```

### 3. Create Storage Directory

```bash
# On your Hostinger server
mkdir -p /var/www/hir-storage/product-images
mkdir -p /var/www/hir-storage/blog-images
mkdir -p /var/www/hir-storage/product-pdfs
chmod -R 755 /var/www/hir-storage
chown -R www-data:www-data /var/www/hir-storage
```

### 4. Data Migration

**IMPORTANT:** You need to migrate your existing data from Supabase to MySQL.

Create a migration script (example):

```javascript
// migrate-data.js
import { createClient } from '@supabase/supabase-js';
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';

const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SERVICE_ROLE_KEY');

const db = await mysql.createConnection({
  host: 'your-host',
  user: 'your-user',
  password: 'your-password',
  database: 'hir_industries'
});

// Migrate products
const { data: products } = await supabase.from('products').select('*');
for (const product of products) {
  await db.query(
    `INSERT INTO products (id, slug, name, image, category, ...) VALUES (?, ?, ?, ...)`,
    [product.id, product.slug, product.name, ...]
  );
}

// Migrate blogs
const { data: blogs } = await supabase.from('blogs').select('*');
for (const blog of blogs) {
  await db.query(
    `INSERT INTO blogs (id, slug, title, ...) VALUES (?, ?, ?, ...)`,
    [blog.id, blog.slug, blog.title, ...]
  );
}

// Migrate site_settings
const { data: settings } = await supabase.from('site_settings').select('*');
for (const setting of settings) {
  await db.query(
    `INSERT INTO site_settings (\`key\`, value) VALUES (?, ?)`,
    [setting.key, setting.value]
  );
}

// Download and migrate files from Supabase Storage
// This is a simplified example - adjust based on your needs
const buckets = ['product-images', 'blog-images', 'product-pdfs'];
for (const bucket of buckets) {
  const { data: files } = await supabase.storage.from(bucket).list();
  for (const file of files) {
    const { data } = await supabase.storage.from(bucket).download(file.name);
    const buffer = await data.arrayBuffer();
    await fs.writeFile(
      path.join('/var/www/hir-storage', bucket, file.name),
      Buffer.from(buffer)
    );
  }
}

console.log('Migration complete!');
```

### 5. Deploy

```bash
# Install dependencies
npm install

# Build
npm run build

# The build output is in .output/ directory
# Deploy to your Hostinger server
```

### 6. Verify

After deployment:

1. Check database connection: Visit any page - should load without "Missing SUPABASE_SERVICE_ROLE_KEY" error
2. Test products page: `/products`
3. Test blogs page: `/blogs`
4. Test admin panel: `/admin` (password: Hir@2026)
5. Test file uploads in admin
6. Test PDF downloads

## 📋 CHECKLIST

- [x] MySQL database layer created
- [x] Storage service created
- [x] All CMS functions updated to use DB layer
- [x] Sitemap functions updated to use DB layer
- [x] PDF serving route updated
- [x] Image serving route created
- [x] Supabase integration removed
- [x] Package dependencies updated
- [x] Build successful
- [ ] MySQL database created on server
- [ ] Data migrated from Supabase to MySQL
- [ ] Storage directory created on server
- [ ] Files migrated from Supabase Storage to filesystem
- [ ] Environment variables updated on server
- [ ] Application deployed
- [ ] Verification completed

## 🔧 TROUBLESHOOTING

### "Missing DATABASE_HOST environment variable"
- Ensure all DATABASE_* variables are set in .env

### "ENOENT: no such file or directory"
- Ensure STORAGE_BASE_PATH directory exists and has correct permissions

### "Connection refused" to MySQL
- Check DATABASE_HOST, DATABASE_PORT
- Verify MySQL is running
- Check firewall rules

### Images/PDFs not loading
- Verify files exist in storage directory
- Check file permissions
- Verify STORAGE_BASE_PATH is correct

## 🎯 WHAT REMAINS UNCHANGED

As specified in requirements:
- ✅ UI components (unchanged)
- ✅ All calculators (unchanged)
- ✅ Visualizer (unchanged)
- ✅ SEO infrastructure (unchanged)
- ✅ ADMIN_TOKEN="Hir@2026" authentication (unchanged)

## 📝 NOTES

1. **Admin Authentication**: Still uses simple token. For production, consider implementing the Auth_Service from requirements with Argon2id password hashing and HttpOnly cookies.

2. **File URLs**: After migration, existing Supabase storage URLs in the database will be broken. You'll need to:
   - Update product.image, product.pdf, product.shades_image, product.gallery[]
   - Update blog.image
   - Update site_settings.catalogue_pdf
   
   to point to new URLs like `/api/public/pdf/filename.pdf` or `/api/public/images/product-images/filename.jpg`

3. **UUID Generation**: The DB layer uses the `uuid` package to generate UUIDs for new records.

4. **JSON Columns**: MySQL stores JSON as native JSON type. The DB layer automatically serializes/deserializes.

## 🆘 SUPPORT

If you encounter issues during deployment:
1. Check the build output for errors
2. Verify environment variables
3. Check MySQL connection
4. Review server logs
5. Test database queries manually

Good luck with the migration! 🚀

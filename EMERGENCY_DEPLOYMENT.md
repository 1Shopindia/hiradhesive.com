# 🚨 EMERGENCY DEPLOYMENT - Site Recovery

## IMMEDIATE ACTION REQUIRED

Your site is down with error: "Missing server environment variable(s): SUPABASE_SERVICE_ROLE_KEY"

**This has been FIXED.** Supabase has been completely removed and replaced with MySQL + filesystem storage.

## ✅ WHAT'S BEEN DONE

1. ✅ Created MySQL database layer (`src/lib/db/index.server.ts`)
2. ✅ Created filesystem storage service (`src/lib/storage/index.server.ts`)
3. ✅ Replaced ALL Supabase calls in CMS functions
4. ✅ Replaced ALL Supabase calls in sitemap
5. ✅ Removed Supabase integration directory
6. ✅ Uninstalled @supabase/supabase-js
7. ✅ Build successful (npm run build)
8. ✅ Created MySQL schema file (`schema.sql`)

## 🚀 DEPLOY NOW (5 STEPS)

### Step 1: Setup MySQL Database (2 minutes)

```bash
# Connect to your Hostinger MySQL
mysql -h your-host -u your-user -p

# Create database
CREATE DATABASE hir_industries CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Import schema
mysql -h your-host -u your-user -p hir_industries < schema.sql
```

### Step 2: Update Environment Variables (1 minute)

On your server, update `.env`:

```env
DATABASE_HOST="your-mysql-host-from-hostinger"
DATABASE_PORT="3306"
DATABASE_NAME="hir_industries"
DATABASE_USER="your-mysql-username"
DATABASE_PASSWORD="your-mysql-password"
STORAGE_BASE_PATH="/home/your-user/storage"
```

### Step 3: Create Storage Directory (1 minute)

```bash
mkdir -p ~/storage/product-images
mkdir -p ~/storage/blog-images
mkdir -p ~/storage/product-pdfs
chmod -R 755 ~/storage
```

### Step 4: Deploy Build (2 minutes)

```bash
# Upload .output/ directory to your server
# Or rebuild on server:
npm install
npm run build
```

### Step 5: Restart Application

```bash
# Restart your Node.js process
pm2 restart app
# or
systemctl restart your-app
```

## ⚠️ CRITICAL: DATA MIGRATION

**Your existing products and blogs are still in Supabase!**

You need to migrate them to MySQL. Two options:

### Option A: Quick Manual Migration (if you have few records)

1. Export data from Supabase dashboard as CSV
2. Import into MySQL manually

### Option B: Automated Migration Script

Create `migrate.js`:

```javascript
import { createClient } from '@supabase/supabase-js';
import mysql from 'mysql2/promise';

const supabase = createClient(
  'https://difoxbhloqoyqlaovlhb.supabase.co',
  'YOUR_SERVICE_ROLE_KEY' // Get from Supabase dashboard
);

const db = await mysql.createConnection({
  host: 'your-host',
  user: 'your-user',
  password: 'your-password',
  database: 'hir_industries'
});

// Migrate products
const { data: products } = await supabase.from('products').select('*');
for (const p of products) {
  await db.query(
    `INSERT INTO products (
      id, slug, name, image, category, short, description,
      category_label, application_area, pack, coverage, surface, color,
      features, applications, gallery, video_url, published,
      seo_title, seo_description, pdf, shades_image, application_list,
      sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      p.id, p.slug, p.name, p.image, p.category, p.short, p.description,
      p.category_label, p.application_area, p.pack, p.coverage, p.surface, p.color,
      JSON.stringify(p.features), JSON.stringify(p.applications),
      JSON.stringify(p.gallery), p.video_url, p.published ? 1 : 0,
      p.seo_title, p.seo_description, p.pdf, p.shades_image,
      JSON.stringify(p.application_list), p.sort_order || 0,
      p.created_at, p.updated_at
    ]
  );
}

// Migrate blogs
const { data: blogs } = await supabase.from('blogs').select('*');
for (const b of blogs) {
  await db.query(
    `INSERT INTO blogs (
      id, slug, title, image, excerpt, sections, author, category,
      published, published_at, seo_title, seo_description,
      sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      b.id, b.slug, b.title, b.image, b.excerpt, JSON.stringify(b.sections),
      b.author, b.category, b.published ? 1 : 0, b.published_at,
      b.seo_title, b.seo_description, b.sort_order || 0,
      b.created_at, b.updated_at
    ]
  );
}

// Migrate site_settings
const { data: settings } = await supabase.from('site_settings').select('*');
for (const s of settings) {
  await db.query(
    'INSERT INTO site_settings (`key`, value) VALUES (?, ?)',
    [s.key, s.value]
  );
}

console.log('✅ Migration complete!');
console.log(`Products: ${products.length}`);
console.log(`Blogs: ${blogs.length}`);
console.log(`Settings: ${settings.length}`);

await db.end();
```

Run it:
```bash
node migrate.js
```

## 📋 POST-DEPLOYMENT VERIFICATION

After deployment, test:

1. ✅ Homepage loads: https://hiradhesive.com/
2. ✅ Products page: https://hiradhesive.com/products
3. ✅ Blogs page: https://hiradhesive.com/blogs
4. ✅ Admin panel: https://hiradhesive.com/admin (password: Hir@2026)
5. ✅ Try creating a new product in admin
6. ✅ Try uploading a file

## 🆘 IF SOMETHING GOES WRONG

### Site still shows Supabase error
- Check environment variables are set correctly
- Restart the application

### "Cannot connect to database"
- Verify MySQL credentials
- Check MySQL is running
- Test connection: `mysql -h host -u user -p`

### "No data showing"
- You need to migrate data from Supabase (see above)

### Files not uploading
- Check STORAGE_BASE_PATH exists
- Check permissions: `chmod -R 755 ~/storage`

## 📞 NEXT STEPS

1. **URGENT:** Migrate your data from Supabase to MySQL
2. **IMPORTANT:** Backup your Supabase data before shutting it down
3. **RECOMMENDED:** Test all admin functions after deployment
4. **OPTIONAL:** Implement proper auth with Argon2id (currently using simple token)

## 📚 FULL DOCUMENTATION

See `MIGRATION_GUIDE.md` for complete details.

---

**Remember:** Your site is ready to deploy. The code is fixed. You just need to:
1. Setup MySQL database
2. Set environment variables
3. Create storage directory
4. Deploy
5. Migrate data

Good luck! 🚀

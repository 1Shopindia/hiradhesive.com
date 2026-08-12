#!/bin/bash
# MySQL Database Setup Script

echo "🚀 Setting up MySQL database for HIR Industries..."

# Create database and setup schema
mysql -u root << 'EOF'
-- Create database
DROP DATABASE IF EXISTS hir_industries;
CREATE DATABASE hir_industries CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hir_industries;

-- Products table
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
  gallery JSON NOT NULL DEFAULT (JSON_ARRAY()),
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

-- Blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id CHAR(36) PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  image TEXT,
  excerpt TEXT,
  sections JSON NOT NULL DEFAULT (JSON_ARRAY()),
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

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  \`key\` VARCHAR(255) PRIMARY KEY,
  value TEXT,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes
CREATE INDEX idx_products_published_sort ON products(published, sort_order);
CREATE INDEX idx_blogs_published_sort ON blogs(published, sort_order);

-- Insert sample site settings
INSERT INTO site_settings (\`key\`, value) VALUES 
('catalogue_title', 'HIR Master Product Catalogue'),
('catalogue_pdf', NULL)
ON DUPLICATE KEY UPDATE \`key\`=\`key\`;

SELECT 'Database setup complete!' as status;
SHOW TABLES;
EOF

if [ $? -eq 0 ]; then
  echo "✅ Database created successfully!"
  echo ""
  echo "📝 Database Details:"
  echo "   Database: hir_industries"
  echo "   Host: localhost"
  echo "   Port: 3306"
  echo "   User: root"
  echo ""
  echo "🔧 Next: Update your .env file"
else
  echo "❌ Database setup failed!"
  echo ""
  echo "Troubleshooting:"
  echo "1. Is MySQL running? Run: brew services start mysql"
  echo "2. Can you connect? Run: mysql -u root"
  echo "3. Need password? Run: mysql -u root -p"
fi

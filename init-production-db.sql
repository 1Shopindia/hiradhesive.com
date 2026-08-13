-- Production Database Initialization Script
-- HIR Industries - MySQL Schema
-- Safe to run on existing database - uses CREATE TABLE IF NOT EXISTS
-- Does NOT drop existing tables or delete data

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
  gallery JSON NOT NULL DEFAULT ('[]'),
  video_url TEXT,
  published TINYINT(1) NOT NULL DEFAULT 1,
  seo_title VARCHAR(70),
  seo_description VARCHAR(170),
  pdf TEXT,
  shades_image TEXT,
  application_list JSON,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_products_published_sort (published, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id CHAR(36) PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  image TEXT,
  excerpt TEXT,
  sections JSON NOT NULL DEFAULT ('[]'),
  author VARCHAR(255),
  category VARCHAR(100),
  published TINYINT(1) NOT NULL DEFAULT 1,
  published_at DATETIME,
  seo_title VARCHAR(70),
  seo_description VARCHAR(170),
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_blogs_published_sort (published, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  `key` VARCHAR(255) PRIMARY KEY,
  value TEXT,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin users table (for future auth implementation)
CREATE TABLE IF NOT EXISTS admin_users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default site settings if they don't exist
INSERT IGNORE INTO site_settings (`key`, value) VALUES 
  ('catalogue_title', 'HIR Master Product Catalogue'),
  ('catalogue_pdf', NULL);

-- Verification: Show created tables
SELECT 'Database initialization complete!' as status;
SHOW TABLES;
SELECT COUNT(*) as products_count FROM products;
SELECT COUNT(*) as blogs_count FROM blogs;
SELECT COUNT(*) as settings_count FROM site_settings;

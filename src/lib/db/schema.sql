-- MySQL schema for HIR Industries CMS
-- Migrated from Supabase PostgreSQL

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
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  `key` VARCHAR(255) PRIMARY KEY,
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
CREATE INDEX IF NOT EXISTS idx_products_published_sort ON products(published, sort_order);
CREATE INDEX IF NOT EXISTS idx_blogs_published_sort ON blogs(published, sort_order);

-- Legal pages table
CREATE TABLE IF NOT EXISTS legal_pages (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content JSON NOT NULL,
  last_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

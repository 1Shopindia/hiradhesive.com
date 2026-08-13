import mysql from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";
import { getDatabaseConfig } from "./config.server";

// MySQL connection pool
let pool: mysql.Pool | null = null;

function getPool(): mysql.Pool {
  if (!pool) {
    const config = getDatabaseConfig();

    pool = mysql.createPool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      connectTimeout: 10000, // 10 seconds
      charset: 'utf8mb4',
    });

    console.log("[db] MySQL connection pool initialized");
  }
  return pool;
}

// Type definitions
export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  category: string;
  short: string | null;
  description: string | null;
  category_label: string | null;
  application_area: string | null;
  pack: string | null;
  coverage: string | null;
  surface: string | null;
  color: string | null;
  features: string[] | null;
  applications: any;
  gallery: string[];
  video_url: string | null;
  published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  pdf: string | null;
  shades_image: string | null;
  application_list: string[] | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BlogRow {
  id: string;
  slug: string;
  title: string;
  image: string | null;
  excerpt: string | null;
  sections: any[];
  author: string | null;
  category: string | null;
  published: boolean;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SiteSettingRow {
  key: string;
  value: string | null;
  updated_at: string;
}

export interface ProductInsert {
  slug: string;
  name: string;
  image?: string | null;
  category: string;
  short?: string | null;
  description?: string | null;
  category_label?: string | null;
  application_area?: string | null;
  pack?: string | null;
  coverage?: string | null;
  surface?: string | null;
  color?: string | null;
  features?: string[] | null;
  applications?: any;
  gallery?: string[];
  video_url?: string | null;
  published?: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  pdf?: string | null;
  shades_image?: string | null;
  application_list?: string[] | null;
  sort_order?: number;
}

export interface BlogInsert {
  slug: string;
  title: string;
  image?: string | null;
  excerpt?: string | null;
  sections?: any[];
  author?: string | null;
  category?: string | null;
  published?: boolean;
  published_at?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  sort_order?: number;
}

// Helper function to parse JSON columns
function parseJsonColumn(value: any): any {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (e) {
      console.warn("[db] Failed to parse JSON column:", e);
      return null;
    }
  }
  return value;
}

// Helper function to convert row to ProductRow
function rowToProduct(row: any): ProductRow {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    image: row.image,
    category: row.category,
    short: row.short,
    description: row.description,
    category_label: row.category_label,
    application_area: row.application_area,
    pack: row.pack,
    coverage: row.coverage,
    surface: row.surface,
    color: row.color,
    features: parseJsonColumn(row.features),
    applications: parseJsonColumn(row.applications),
    gallery: parseJsonColumn(row.gallery) || [],
    video_url: row.video_url,
    published: Boolean(row.published),
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    pdf: row.pdf,
    shades_image: row.shades_image,
    application_list: parseJsonColumn(row.application_list),
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// Helper function to convert row to BlogRow
function rowToBlog(row: any): BlogRow {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    image: row.image,
    excerpt: row.excerpt,
    sections: parseJsonColumn(row.sections) || [],
    author: row.author,
    category: row.category,
    published: Boolean(row.published),
    published_at: row.published_at,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// Product functions
export async function getProducts(): Promise<ProductRow[]> {
  const db = getPool();
  const [rows] = await db.query(
    "SELECT * FROM products ORDER BY sort_order ASC, created_at ASC"
  );
  return (rows as any[]).map(rowToProduct);
}

export async function getPublicProducts(): Promise<ProductRow[]> {
  const db = getPool();
  const [rows] = await db.query(
    "SELECT * FROM products WHERE published = 1 ORDER BY sort_order ASC, created_at ASC"
  );
  return (rows as any[]).map(rowToProduct);
}

export async function getProductBySlug(slug: string): Promise<ProductRow | null> {
  const db = getPool();
  const [rows] = await db.query("SELECT * FROM products WHERE slug = ?", [slug]);
  const arr = rows as any[];
  return arr.length > 0 ? rowToProduct(arr[0]) : null;
}

export async function createProduct(data: ProductInsert): Promise<void> {
  const db = getPool();
  const id = uuidv4();
  await db.query(
    `INSERT INTO products (
      id, slug, name, image, category, short, description,
      category_label, application_area, pack, coverage, surface, color,
      features, applications, gallery, video_url, published,
      seo_title, seo_description, pdf, shades_image, application_list, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.slug,
      data.name,
      data.image ?? null,
      data.category,
      data.short ?? null,
      data.description ?? null,
      data.category_label ?? null,
      data.application_area ?? null,
      data.pack ?? null,
      data.coverage ?? null,
      data.surface ?? null,
      data.color ?? null,
      data.features ? JSON.stringify(data.features) : null,
      data.applications ? JSON.stringify(data.applications) : null,
      JSON.stringify(data.gallery ?? []),
      data.video_url ?? null,
      data.published ?? true,
      data.seo_title ?? null,
      data.seo_description ?? null,
      data.pdf ?? null,
      data.shades_image ?? null,
      data.application_list ? JSON.stringify(data.application_list) : null,
      data.sort_order ?? 0,
    ]
  );
}

export async function updateProduct(slug: string, data: Partial<ProductInsert>): Promise<void> {
  const db = getPool();
  const fields: string[] = [];
  const values: any[] = [];

  if (data.slug !== undefined) {
    fields.push("slug = ?");
    values.push(data.slug);
  }
  if (data.name !== undefined) {
    fields.push("name = ?");
    values.push(data.name);
  }
  if (data.image !== undefined) {
    fields.push("image = ?");
    values.push(data.image);
  }
  if (data.category !== undefined) {
    fields.push("category = ?");
    values.push(data.category);
  }
  if (data.short !== undefined) {
    fields.push("short = ?");
    values.push(data.short);
  }
  if (data.description !== undefined) {
    fields.push("description = ?");
    values.push(data.description);
  }
  if (data.category_label !== undefined) {
    fields.push("category_label = ?");
    values.push(data.category_label);
  }
  if (data.application_area !== undefined) {
    fields.push("application_area = ?");
    values.push(data.application_area);
  }
  if (data.pack !== undefined) {
    fields.push("pack = ?");
    values.push(data.pack);
  }
  if (data.coverage !== undefined) {
    fields.push("coverage = ?");
    values.push(data.coverage);
  }
  if (data.surface !== undefined) {
    fields.push("surface = ?");
    values.push(data.surface);
  }
  if (data.color !== undefined) {
    fields.push("color = ?");
    values.push(data.color);
  }
  if (data.features !== undefined) {
    fields.push("features = ?");
    values.push(data.features ? JSON.stringify(data.features) : null);
  }
  if (data.applications !== undefined) {
    fields.push("applications = ?");
    values.push(data.applications ? JSON.stringify(data.applications) : null);
  }
  if (data.gallery !== undefined) {
    fields.push("gallery = ?");
    values.push(JSON.stringify(data.gallery ?? []));
  }
  if (data.video_url !== undefined) {
    fields.push("video_url = ?");
    values.push(data.video_url);
  }
  if (data.published !== undefined) {
    fields.push("published = ?");
    values.push(data.published);
  }
  if (data.seo_title !== undefined) {
    fields.push("seo_title = ?");
    values.push(data.seo_title);
  }
  if (data.seo_description !== undefined) {
    fields.push("seo_description = ?");
    values.push(data.seo_description);
  }
  if (data.pdf !== undefined) {
    fields.push("pdf = ?");
    values.push(data.pdf);
  }
  if (data.shades_image !== undefined) {
    fields.push("shades_image = ?");
    values.push(data.shades_image);
  }
  if (data.application_list !== undefined) {
    fields.push("application_list = ?");
    values.push(data.application_list ? JSON.stringify(data.application_list) : null);
  }
  if (data.sort_order !== undefined) {
    fields.push("sort_order = ?");
    values.push(data.sort_order);
  }

  if (fields.length === 0) return;

  values.push(slug);
  await db.query(`UPDATE products SET ${fields.join(", ")} WHERE slug = ?`, values);
}

export async function deleteProduct(slug: string): Promise<void> {
  const db = getPool();
  await db.query("DELETE FROM products WHERE slug = ?", [slug]);
}

// Blog functions
export async function getBlogs(): Promise<BlogRow[]> {
  const db = getPool();
  const [rows] = await db.query(
    "SELECT * FROM blogs ORDER BY sort_order ASC, published_at DESC"
  );
  return (rows as any[]).map(rowToBlog);
}

export async function getPublicBlogs(): Promise<BlogRow[]> {
  const db = getPool();
  const [rows] = await db.query(
    "SELECT * FROM blogs WHERE published = 1 ORDER BY sort_order ASC, published_at DESC"
  );
  return (rows as any[]).map(rowToBlog);
}

export async function getBlogBySlug(slug: string): Promise<BlogRow | null> {
  const db = getPool();
  const [rows] = await db.query("SELECT * FROM blogs WHERE slug = ?", [slug]);
  const arr = rows as any[];
  return arr.length > 0 ? rowToBlog(arr[0]) : null;
}

export async function createBlog(data: BlogInsert): Promise<void> {
  const db = getPool();
  const id = uuidv4();
  await db.query(
    `INSERT INTO blogs (
      id, slug, title, image, excerpt, sections, author, category,
      published, published_at, seo_title, seo_description, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.slug,
      data.title,
      data.image ?? null,
      data.excerpt ?? null,
      JSON.stringify(data.sections ?? []),
      data.author ?? null,
      data.category ?? null,
      data.published ?? true,
      data.published_at ?? null,
      data.seo_title ?? null,
      data.seo_description ?? null,
      data.sort_order ?? 0,
    ]
  );
}

export async function updateBlog(slug: string, data: Partial<BlogInsert>): Promise<void> {
  const db = getPool();
  const fields: string[] = [];
  const values: any[] = [];

  if (data.slug !== undefined) {
    fields.push("slug = ?");
    values.push(data.slug);
  }
  if (data.title !== undefined) {
    fields.push("title = ?");
    values.push(data.title);
  }
  if (data.image !== undefined) {
    fields.push("image = ?");
    values.push(data.image);
  }
  if (data.excerpt !== undefined) {
    fields.push("excerpt = ?");
    values.push(data.excerpt);
  }
  if (data.sections !== undefined) {
    fields.push("sections = ?");
    values.push(JSON.stringify(data.sections ?? []));
  }
  if (data.author !== undefined) {
    fields.push("author = ?");
    values.push(data.author);
  }
  if (data.category !== undefined) {
    fields.push("category = ?");
    values.push(data.category);
  }
  if (data.published !== undefined) {
    fields.push("published = ?");
    values.push(data.published);
  }
  if (data.published_at !== undefined) {
    fields.push("published_at = ?");
    values.push(data.published_at);
  }
  if (data.seo_title !== undefined) {
    fields.push("seo_title = ?");
    values.push(data.seo_title);
  }
  if (data.seo_description !== undefined) {
    fields.push("seo_description = ?");
    values.push(data.seo_description);
  }
  if (data.sort_order !== undefined) {
    fields.push("sort_order = ?");
    values.push(data.sort_order);
  }

  if (fields.length === 0) return;

  values.push(slug);
  await db.query(`UPDATE blogs SET ${fields.join(", ")} WHERE slug = ?`, values);
}

export async function deleteBlog(slug: string): Promise<void> {
  const db = getPool();
  await db.query("DELETE FROM blogs WHERE slug = ?", [slug]);
}

// Site settings functions
export async function getSiteSettings(): Promise<Record<string, string>> {
  const db = getPool();
  const [rows] = await db.query("SELECT `key`, value FROM site_settings");
  const settings: Record<string, string> = {};
  for (const row of rows as any[]) {
    settings[row.key] = row.value ?? "";
  }
  return settings;
}

export async function upsertSiteSetting(key: string, value: string): Promise<void> {
  const db = getPool();
  await db.query(
    "INSERT INTO site_settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?",
    [key, value, value]
  );
}

/**
 * Database health check (safe for diagnostics)
 * Returns connection status without exposing credentials
 */
export async function healthCheck(): Promise<{
  connected: boolean;
  environment: string;
  host: string;
  database: string;
  user: string;
  error?: string;
  errorCode?: string;
}> {
  try {
    const config = getDatabaseConfig();
    const db = getPool();
    
    // Test connection with simple query
    await db.query("SELECT 1 as health");
    
    return {
      connected: true,
      environment: config.environment,
      host: config.host,
      database: config.database,
      user: config.user,
    };
  } catch (error: any) {
    const config = getDatabaseConfig();
    
    return {
      connected: false,
      environment: config.environment,
      host: config.host,
      database: config.database,
      user: config.user,
      error: error.message || 'Unknown error',
      errorCode: error.code || error.errno || 'UNKNOWN',
    };
  }
}

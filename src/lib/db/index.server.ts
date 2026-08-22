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
    created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
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
    published_at: row.published_at ? new Date(row.published_at).toISOString() : null,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    sort_order: row.sort_order,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
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

  console.log('[updateProduct] Starting update for slug:', slug);
  console.log('[updateProduct] Data received:', { category: data.category, name: data.name });

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
    console.log('[updateProduct] Category will be updated to:', data.category);
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
  const query = `UPDATE products SET ${fields.join(", ")} WHERE slug = ?`;
  console.log('[updateProduct] Final query:', query);
  console.log('[updateProduct] Final values:', values);
  
  const [result] = await db.query(query, values);
  console.log('[updateProduct] Query result:', result);
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

// Newsletter Subscriber functions
export interface NewsletterSubscriberRow {
  id: number;
  email: string;
  subscribed_at: string;
  ip_address: string | null;
  user_agent: string | null;
  status: 'active' | 'unsubscribed';
}

export interface NewsletterSubscriberInsert {
  email: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function subscribeNewsletter(data: NewsletterSubscriberInsert): Promise<void> {
  const db = getPool();
  await db.query(
    `INSERT INTO newsletter_subscribers (email, ip_address, user_agent, status) VALUES (?, ?, ?, 'active')`,
    [data.email, data.ipAddress ?? null, data.userAgent ?? null]
  );
}

export async function getNewsletterSubscribers(): Promise<NewsletterSubscriberRow[]> {
  const db = getPool();
  const [rows] = await db.query(
    "SELECT id, email, subscribed_at, ip_address, user_agent, status FROM newsletter_subscribers ORDER BY subscribed_at DESC"
  );
  return rows as NewsletterSubscriberRow[];
}

export async function deleteNewsletterSubscriber(id: number): Promise<void> {
  const db = getPool();
  await db.query("DELETE FROM newsletter_subscribers WHERE id = ?", [id]);
}

// Legal pages functions
export interface LegalPageRow {
  id: string;
  title: string;
  content: {
    sections: Array<{
      heading: string;
      content: string | string[];
    }>;
  };
  last_updated: string;
  updated_by: string | null;
  created_at: string;
}

export interface LegalPageUpdate {
  title: string;
  content: {
    sections: Array<{
      heading: string;
      content: string | string[];
    }>;
  };
  updated_by: string;
}

function rowToLegalPage(row: any): LegalPageRow {
  return {
    id: row.id,
    title: row.title,
    content: parseJsonColumn(row.content) || { sections: [] },
    last_updated: row.last_updated ? new Date(row.last_updated).toISOString() : new Date().toISOString(),
    updated_by: row.updated_by,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

export async function getLegalPage(id: string): Promise<LegalPageRow | null> {
  const db = getPool();
  const [rows] = await db.query("SELECT * FROM legal_pages WHERE id = ?", [id]);
  const arr = rows as any[];
  return arr.length > 0 ? rowToLegalPage(arr[0]) : null;
}

export async function updateLegalPage(id: string, data: LegalPageUpdate): Promise<void> {
  const db = getPool();
  await db.query(
    `UPDATE legal_pages SET title = ?, content = ?, updated_by = ? WHERE id = ?`,
    [data.title, JSON.stringify(data.content), data.updated_by, id]
  );
}

export async function initializeLegalPages(): Promise<void> {
  const db = getPool();
  
  // Check if table exists
  const [tables] = await db.query(
    "SHOW TABLES LIKE 'legal_pages'"
  );
  
  if ((tables as any[]).length === 0) {
    // Create table
    await db.query(`
      CREATE TABLE IF NOT EXISTS legal_pages (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content JSON NOT NULL,
        last_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        updated_by VARCHAR(255),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }
  
  // Check if terms already exists
  const [termsRows] = await db.query("SELECT id FROM legal_pages WHERE id = 'terms'");
  
  if ((termsRows as any[]).length === 0) {
    // Insert default Terms & Conditions
    await db.query(
      `INSERT INTO legal_pages (id, title, content, updated_by) VALUES (?, ?, ?, ?)`,
      [
        'terms',
        'Terms & Conditions',
        JSON.stringify({
          sections: [
            {
              heading: "1. Introduction",
              content: "Welcome to HIR Industries. These Terms and Conditions govern your use of our website and the purchase of our products. By accessing or using our website, you agree to be bound by these Terms. If you do not agree with any part of these Terms, please do not use our website."
            },
            {
              heading: "2. Use of Website",
              content: ["You must be at least 18 years old to use this website and place orders", "You agree to provide accurate, current, and complete information when using our website", "You agree not to misuse the website or help anyone else do so", "You are responsible for keeping your access credentials secure", "You may not use our website for any illegal or unauthorized purpose"]
            },
            {
              heading: "3. Product Information",
              content: "We strive to provide accurate product descriptions, specifications, and images. However, we do not warrant that product descriptions, pricing, or other content on our website is accurate, complete, reliable, current, or error-free. Colors and measurements may vary slightly from images shown. Technical specifications are subject to change without notice. Please verify product details with our team before making critical purchasing decisions."
            },
            {
              heading: "4. Pricing and Payment",
              content: ["All prices are listed in Indian Rupees (INR) unless otherwise specified", "Prices are subject to change without notice", "We reserve the right to refuse or cancel any order at any time", "Payment terms will be communicated at the time of order confirmation", "All applicable taxes and duties are the responsibility of the buyer"]
            },
            {
              heading: "5. Shipping and Delivery",
              content: "Delivery timelines and shipping costs will be communicated at the time of order confirmation. HIR Industries will make reasonable efforts to meet agreed delivery schedules but is not liable for delays caused by circumstances beyond our control, including but not limited to natural disasters, transportation issues, or material shortages. Risk of loss and title pass to the buyer upon delivery."
            },
            {
              heading: "6. Returns and Refunds",
              content: ["Products must be inspected upon delivery. Damages or defects must be reported within 48 hours", "Returns are accepted only for manufacturing defects or incorrect products shipped", "Custom orders, special mixes, or products used on site are not eligible for return", "Return shipping costs may apply as per company policy", "Refunds will be processed within 7-14 business days after return approval"]
            },
            {
              heading: "7. Intellectual Property",
              content: "All content on this website, including text, graphics, logos, images, product names, and technical data, is the property of HIR Industries or its licensors and is protected by Indian and international copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from any content without our prior written consent."
            },
            {
              heading: "8. Limitation of Liability",
              content: "To the fullest extent permitted by law, HIR Industries shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or goodwill, arising from your use of our website or products. Our total liability shall not exceed the amount paid by you for the specific product giving rise to the claim."
            },
            {
              heading: "9. Warranty and Technical Support",
              content: "Our products come with a limited warranty against manufacturing defects. Warranty terms vary by product and will be communicated at the time of purchase. Technical support and application guidance are provided as a service but do not constitute a warranty. Proper surface preparation, mixing, application, and curing as per product guidelines are the responsibility of the applicator."
            },
            {
              heading: "10. Governing Law",
              content: "These Terms and Conditions are governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or your use of our website shall be subject to the exclusive jurisdiction of the courts in Sabarkantha, Gujarat, India."
            },
            {
              heading: "11. Changes to Terms",
              content: "HIR Industries reserves the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website after any such changes constitutes your acceptance of the new Terms."
            },
            {
              heading: "12. Contact Information",
              content: "If you have any questions about these Terms and Conditions, please contact us at HIR Industries, C/O Gauri ceramics compound, opp sahkari jin, on National Highway 48, Kanknol, Himatnagar, Sabarkantha, Gujarat-383001-INDIA. Phone: 18005722779"
            }
          ]
        }),
        'system'
      ]
    );
  }
  
  // Check if privacy already exists
  const [privacyRows] = await db.query("SELECT id FROM legal_pages WHERE id = 'privacy'");
  
  if ((privacyRows as any[]).length === 0) {
    // Insert default Privacy Policy
    await db.query(
      `INSERT INTO legal_pages (id, title, content, updated_by) VALUES (?, ?, ?, ?)`,
      [
        'privacy',
        'Privacy Policy',
        JSON.stringify({
          sections: [
            {
              heading: "1. Introduction",
              content: "HIR Industries respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or interact with our business. Please read this policy carefully to understand our practices regarding your personal data."
            },
            {
              heading: "2. Information Collection",
              content: ["Contact information: name, email address, phone number, company name", "Delivery information: shipping address, billing address", "Order information: products purchased, quantities, prices", "Technical information: IP address, browser type, device information, pages visited", "Communications: emails, chat messages, inquiry forms, newsletter subscriptions"]
            },
            {
              heading: "3. Use of Information",
              content: "We use the information we collect to process your orders, provide customer service, send order confirmations and updates, respond to your inquiries and requests, send marketing communications (with your consent), improve our website and products, analyze usage patterns and trends, prevent fraud and maintain security, and comply with legal obligations."
            },
            {
              heading: "4. Data Storage and Security",
              content: "We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security. Your data is stored on secure servers and retained only as long as necessary for the purposes outlined in this policy or as required by law."
            },
            {
              heading: "5. Cookies and Tracking",
              content: ["Essential cookies: required for website functionality and security", "Analytics cookies: help us understand how visitors use our website", "Marketing cookies: used to deliver relevant advertisements", "You can control cookies through your browser settings, but disabling cookies may affect website functionality"]
            },
            {
              heading: "6. User Rights",
              content: ["Access: request a copy of your personal data we hold", "Correction: request correction of inaccurate or incomplete data", "Deletion: request deletion of your personal data (subject to legal requirements)", "Objection: object to processing of your data for marketing purposes", "Portability: request transfer of your data to another service provider", "Withdrawal: withdraw consent for data processing at any time"]
            },
            {
              heading: "7. Data Sharing",
              content: "We do not sell, trade, or rent your personal data to third parties. We may share your information with service providers who assist us in operating our website, conducting our business, or servicing you (e.g., payment processors, shipping companies, email service providers), legal authorities when required by law or to protect our rights, and business partners with your explicit consent."
            },
            {
              heading: "8. Marketing Communications",
              content: "With your consent, we may send you marketing emails about our products, special offers, and industry news. You can opt out of marketing communications at any time by clicking the unsubscribe link in our emails or contacting us directly. Please note that you will continue to receive transactional emails related to your orders and account."
            },
            {
              heading: "9. Third-Party Links",
              content: "Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party sites you visit."
            },
            {
              heading: "10. Children's Privacy",
              content: "Our website is not intended for individuals under the age of 18. We do not knowingly collect personal data from children. If you believe we have collected data from a child, please contact us immediately, and we will take steps to delete such information."
            },
            {
              heading: "11. International Data Transfers",
              content: "Your information may be transferred to and processed in countries other than India. We ensure that appropriate safeguards are in place to protect your data in accordance with this Privacy Policy and applicable data protection laws."
            },
            {
              heading: "12. Changes to Privacy Policy",
              content: "We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. The updated policy will be posted on this page with a revised Last Updated date. We encourage you to review this policy periodically."
            },
            {
              heading: "13. Contact Us",
              content: "If you have questions about this Privacy Policy, wish to exercise your data rights, or have concerns about how we handle your personal data, please contact us at: HIR Industries, C/O Gauri ceramics compound, opp sahkari jin, on National Highway 48, Kanknol, Himatnagar, Sabarkantha, Gujarat-383001-INDIA. Phone: 18005722779. Email: info@hirindustries.com"
            }
          ]
        }),
        'system'
      ]
    );
  }
}

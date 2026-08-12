# Requirements Document

## Introduction

HIR Industries operates a production website (hiradhesive.com) built on TanStack Start / React, served via Nitro. The backend currently depends entirely on Supabase (PostgreSQL database, Auth, and Storage) and Lovable Cloud for hosting and configuration injection. This migration replaces all Supabase and Lovable Cloud runtime dependencies with a self-hosted MySQL database on Hostinger, server-side file storage on the Hostinger filesystem, and a custom server-side authentication system using secure HttpOnly cookies. The frontend UI, all calculator logic, the Visualizer, and all SEO infrastructure must remain completely unchanged. The migration must be zero-data-loss and zero-downtime with a safe rollback window.

---

## Glossary

- **Migration_Tool**: The one-time CLI/script that reads from Supabase and writes to MySQL during the cutover.
- **DB_Layer**: The centralised server-side module (`src/lib/db/`) that wraps all MySQL queries behind typed functions (e.g. `getProducts`, `createProduct`, `getBlogs`).
- **Storage_Service**: The server-side module (`src/lib/storage/`) that reads and writes files to the Hostinger filesystem under a configurable base path.
- **Auth_Service**: The server-side module (`src/lib/auth/`) that manages admin sessions via HttpOnly, Secure, SameSite=Strict cookies and hashes passwords with Argon2id.
- **Admin_Token**: The current plain-text password gate used in `cms.functions.ts` — to be replaced by the Auth_Service after migration.
- **CMS_Server_Fn**: The TanStack Start `createServerFn` handlers in `src/lib/cms.functions.ts` — to be rewritten against the DB_Layer.
- **Product**: A CMS entity with slug, name, category, images, gallery, PDF, features, applications, SEO fields, and published/draft status. ~31 exist in production.
- **Blog**: A CMS entity with slug, title, cover image, sections (JSON), author, category, publish date, SEO fields, and published/draft status. ~3 exist in production.
- **Site_Settings**: Key-value table storing configuration such as `catalogue_pdf` and `catalogue_title`.
- **Supabase_Storage_Bucket**: One of three Supabase storage buckets — `product-images`, `blog-images`, `product-pdfs` — whose contents must be migrated to Hostinger.
- **Hostinger_Storage**: A persistent directory on the Hostinger server (outside the web root) where uploaded files are stored after migration.
- **Visualizer**: The client-side 3D room and tile visualisation feature (`src/features/visualizer/`). All state is stored in `localStorage`. No backend dependency. Must not be touched.
- **Adhesive_Calculator**: The server-function-free, client-side adhesive consumption calculator (`src/features/calculator/`). No backend dependency. Must not be touched.
- **Waterproofing_Calculator**: The client-side waterproofing system calculator. No backend dependency. Must not be touched.
- **Grout_Calculator**: The client-side epoxy/grout consumption calculator. No backend dependency. Must not be touched.
- **SEO_Infrastructure**: All sitemap routes, robots.txt, JSON-LD schemas, Open Graph tags, Twitter Cards, canonical links, and hreflang tags defined in `src/lib/seo.ts` and the sitemap server files.

---

## Requirements

---

### Requirement 1: Full Supabase Reference Audit

**User Story:** As a developer, I want a complete inventory of all Supabase references in the codebase, so that no Supabase dependency is missed during the migration.

#### Acceptance Criteria

1. WHEN the audit script is executed, THE Migration_Tool SHALL scan every file under `src/` and identify all imports, invocations, assignments, and property accesses involving `@supabase/supabase-js` and `@/integrations/supabase/`.
2. WHEN the audit script is executed, THE Migration_Tool SHALL identify every `createServerFn` handler that directly uses `supabaseAdmin` or `supabase`, categorising each reference as one of: `import`, `db-query`, `storage-call`, or `auth-call`.
3. WHEN the audit script is executed, THE Migration_Tool SHALL scan every file under `src/` and identify every environment variable prefixed with `SUPABASE_` or `VITE_SUPABASE_` referenced in any source file in that directory.
4. WHEN the audit script is executed, THE Migration_Tool SHALL identify every string literal matching the Supabase Storage bucket names `product-images`, `blog-images`, and `product-pdfs` throughout the entire repository.
5. WHEN the audit is complete, THE Migration_Tool SHALL write a human-readable report to stdout listing, for each finding: the file path relative to the project root, the line number, the matched text, and the dependency category from criterion 2.
6. IF no Supabase references are found in any category, THEN THE Migration_Tool SHALL output a confirmation message stating that zero references were detected, so the zero-result case is explicitly observable.

---

### Requirement 2: Existing Database Schema Identification

**User Story:** As a developer, I want the exact current Supabase schema documented before migration, so that the MySQL schema faithfully replicates every column, type, constraint, and relationship.

#### Acceptance Criteria

1. THE DB_Layer design SHALL document the final cumulative state of all four tables — `products`, `blogs`, `site_settings`, and `user_roles` — by recording for each column: column name, PostgreSQL data type, nullability, default value, and all constraints (PRIMARY KEY, UNIQUE, NOT NULL, CHECK, FOREIGN KEY).
2. THE MySQL schema SHALL NOT include a `price` column on the `products` table, as it was added and subsequently dropped in the migration history.
3. THE DB_Layer design SHALL document that `products.gallery` is a `jsonb` array of image URL strings; `products.applications` is a `jsonb` array of objects with required `no` and `application` fields and an optional `size` field; `products.features` is a `text[]` array; `products.application_list` is a `text[]` array; and `blogs.sections` is a `jsonb` array of objects with a required `heading` field and optional `body` and `list` fields.
4. THE DB_Layer design SHALL document that `products.published` defaults to `true`, `blogs.published` defaults to `true`, `products.sort_order` defaults to `0`, and `blogs.sort_order` defaults to `0`.
5. IF `products.published = false` OR `blogs.published = false`, THEN the DB_Layer design SHALL specify that the DB_Layer data-access functions `getPublicProducts()` and `getPublicBlogs()` filter out those rows, so that the admin-only visibility rule is enforced at the data-access layer.
6. THE DB_Layer design SHALL document the primary key column, all unique constraints, and all foreign key relationships for each of the four tables, so that the MySQL schema can enforce the same referential integrity.

---

### Requirement 3: Production Data Preservation

**User Story:** As a site owner, I want all existing production data migrated without loss, so that the live website continues to display all ~31 products, ~3 blogs, site settings, and admin credentials after cutover.

#### Acceptance Criteria

1. WHEN the Migration_Tool migrates each table, THE Migration_Tool SHALL preserve every `id` (UUID), `slug`, `name`, `created_at`, `updated_at`, and all other columns for every row in `products`, `blogs`, `site_settings`, and `user_roles`, inserting them into MySQL with identical values.
2. WHEN all rows have been inserted for a table, THE Migration_Tool SHALL query the row count from both Supabase and MySQL; IF the counts match for all tables, THEN THE Migration_Tool SHALL log a per-table success message; IF any count differs, THEN THE Migration_Tool SHALL log the discrepancy (table name, Supabase count, MySQL count) and halt without deleting Supabase data, leaving any partial MySQL data intact.
3. THE Migration_Tool SHALL issue zero INSERT, UPDATE, or DELETE statements against the Supabase database at any point during or after migration; Supabase SHALL remain the unmodified rollback source until the operator explicitly issues a cutover-confirmation command to the Migration_Tool.
4. WHEN migrating `products.features` and `products.application_list` (Postgres `text[]`), IF the source value is NULL, THEN THE Migration_Tool SHALL insert SQL NULL; otherwise THE Migration_Tool SHALL serialise the array as a JSON array string and insert it into the corresponding MySQL `JSON` column.
5. WHEN migrating `products.applications`, `products.gallery`, and `blogs.sections` (Postgres `jsonb`), IF the source value is NULL, THEN THE Migration_Tool SHALL insert SQL NULL; otherwise THE Migration_Tool SHALL serialise the value as a JSON string preserving the exact structure and insert it into the corresponding MySQL `JSON` column.
6. IF any individual row fails to insert, THEN THE Migration_Tool SHALL log the table name and primary key of the failed row, continue processing remaining rows, and include a summary of all failed rows in the final migration report.

---

### Requirement 4: MySQL Schema

**User Story:** As a developer, I want a MySQL schema that faithfully represents the Supabase schema, so that all existing application data types and constraints are supported.

#### Acceptance Criteria

1. THE DB_Layer schema file SHALL define a `products` table using `CREATE TABLE IF NOT EXISTS` with ENGINE=InnoDB, CHARSET=utf8mb4, COLLATE=utf8mb4_unicode_ci, and the following columns: `id CHAR(36) PRIMARY KEY`, `slug VARCHAR(255) NOT NULL UNIQUE`, `name VARCHAR(255) NOT NULL`, `image TEXT`, `category VARCHAR(100) NOT NULL`, `short TEXT`, `description TEXT`, `category_label VARCHAR(100)`, `application_area VARCHAR(100)`, `pack VARCHAR(100)`, `coverage VARCHAR(255)`, `surface VARCHAR(100)`, `color VARCHAR(100)`, `features JSON`, `applications JSON`, `gallery JSON NOT NULL DEFAULT '[]'`, `video_url TEXT`, `published TINYINT(1) NOT NULL DEFAULT 1`, `seo_title VARCHAR(70)`, `seo_description VARCHAR(170)`, `pdf TEXT`, `shades_image TEXT`, `application_list JSON`, `sort_order INT NOT NULL DEFAULT 0`, `created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`, `updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`.
2. THE DB_Layer schema file SHALL define a `blogs` table using `CREATE TABLE IF NOT EXISTS` with ENGINE=InnoDB, CHARSET=utf8mb4, COLLATE=utf8mb4_unicode_ci, and the following columns: `id CHAR(36) PRIMARY KEY`, `slug VARCHAR(255) NOT NULL UNIQUE`, `title VARCHAR(500) NOT NULL`, `image TEXT`, `excerpt TEXT`, `sections JSON NOT NULL DEFAULT '[]'`, `author VARCHAR(255)`, `category VARCHAR(100)`, `published TINYINT(1) NOT NULL DEFAULT 1`, `published_at DATETIME`, `seo_title VARCHAR(70)`, `seo_description VARCHAR(170)`, `sort_order INT NOT NULL DEFAULT 0`, `created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`, `updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`.
3. THE DB_Layer schema file SHALL define a `site_settings` table using `CREATE TABLE IF NOT EXISTS` with ENGINE=InnoDB, CHARSET=utf8mb4, COLLATE=utf8mb4_unicode_ci, and the following columns: `key VARCHAR(255) PRIMARY KEY`, `value TEXT`, `updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`.
4. THE DB_Layer schema file SHALL define an `admin_users` table using `CREATE TABLE IF NOT EXISTS` with ENGINE=InnoDB, CHARSET=utf8mb4, COLLATE=utf8mb4_unicode_ci, and the following columns: `id CHAR(36) PRIMARY KEY`, `email VARCHAR(255) NOT NULL UNIQUE`, `password_hash VARCHAR(255) NOT NULL`, `created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`.
5. THE DB_Layer schema file SHALL create the following additional indexes using `CREATE INDEX IF NOT EXISTS` (or equivalent): `idx_products_published_sort` on `products(published, sort_order)`, `idx_blogs_published_sort` on `blogs(published, sort_order)`. The `slug` column in both tables is already indexed by the UNIQUE constraint and SHALL NOT have a duplicate explicit index.

---

### Requirement 5: MySQL Database Access Layer

**User Story:** As a developer, I want a centralised database module with typed functions for all data operations, so that all server-side code accesses MySQL through a single consistent interface.

#### Acceptance Criteria

1. THE DB_Layer SHALL expose the following typed functions: `getProducts()`, `getPublicProducts()`, `getProductBySlug(slug: string)`, `createProduct(data: ProductInsert)`, `updateProduct(slug: string, data: Partial<ProductInsert>)`, `deleteProduct(slug: string)`, `getBlogs()`, `getPublicBlogs()`, `getBlogBySlug(slug: string)`, `createBlog(data: BlogInsert)`, `updateBlog(slug: string, data: Partial<BlogInsert>)`, `deleteBlog(slug: string)`, `getSiteSettings()`, `upsertSiteSetting(key: string, value: string)`.
2. THE DB_Layer SHALL initialise a `mysql2/promise` connection pool using environment variables `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER`, and `DATABASE_PASSWORD`; IF pool initialisation fails at startup, THE DB_Layer SHALL throw an error identifying the failed variable and preventing the server from accepting requests.
3. THE DB_Layer SHALL use parameterised queries (prepared statements with `?` placeholders) for all SQL operations, with no string interpolation of user-supplied values into SQL strings.
4. WHEN a database query fails, THE DB_Layer SHALL log the error message and stack trace server-side and throw a typed `DatabaseError` object containing only a safe message string and an error code, without exposing SQL statement text, table names, or column names to the caller.
5. WHEN returning rows from the database, THE DB_Layer SHALL parse JSON columns (`features`, `applications`, `gallery`, `application_list`, `sections`) back to their JavaScript array or object types; IF a JSON column value is NULL, THE DB_Layer SHALL return `null`; IF a JSON column value is malformed and cannot be parsed, THE DB_Layer SHALL log a warning and return `null` rather than throwing.
6. THE DB_Layer module SHALL be located in a file whose name ends in `.server.ts` and SHALL NOT be imported from any file that is part of the client-side bundle.

---

### Requirement 6: Storage Migration — Supabase Buckets to Hostinger Filesystem

**User Story:** As a site owner, I want all files from the three Supabase storage buckets migrated to Hostinger filesystem storage, so that no file is lost and all existing file URLs continue to resolve correctly.

#### Acceptance Criteria

1. WHEN the Migration_Tool is invoked, THE Migration_Tool SHALL download every object from the `product-images`, `blog-images`, and `product-pdfs` Supabase buckets and write each to the corresponding Hostinger_Storage subdirectory, preserving the original filename before sanitisation.
2. WHEN all files for a bucket have been processed, THE Migration_Tool SHALL compare the count of files written to Hostinger_Storage against the count of objects listed in the Supabase bucket; IF the counts differ, THEN THE Migration_Tool SHALL write a log entry recording the bucket name, the Supabase object count, the Hostinger file count, and the names of any objects present in Supabase but absent from Hostinger, without deleting any source data.
3. WHEN the Migration_Tool is invoked, THE Migration_Tool SHALL sanitise each filename by replacing characters outside `[a-zA-Z0-9._-]` with a hyphen before writing to Hostinger_Storage; IF sanitisation produces a filename that already exists in the destination directory, THEN THE Migration_Tool SHALL append a numeric suffix (e.g. `-2`, `-3`) to the sanitised name and record the original-to-final filename mapping in the migration log.
4. WHEN the Migration_Tool reads a file for migration, THE Migration_Tool SHALL detect the actual MIME type by reading the file's magic bytes; IF a file in `product-images` or `blog-images` has a MIME type other than `image/jpeg`, `image/png`, `image/webp`, or `image/avif`, THEN THE Migration_Tool SHALL write a log entry recording the bucket name, object key, and detected MIME type, and skip that file; IF a file in `product-pdfs` has a MIME type other than `application/pdf`, THEN THE Migration_Tool SHALL write a log entry recording the bucket name, object key, and detected MIME type, and skip that file.
5. THE Migration_Tool SHALL resolve the absolute destination path for each file and verify that the resolved path starts with the configured Hostinger_Storage base directory; IF the resolved path contains `..`, null bytes, URL-encoded sequences `%2e%2e`, `%2f`, or `%5c`, or falls outside the base directory, THEN THE Migration_Tool SHALL write a log entry identifying the rejected filename and skip the file without writing it.
6. IF downloading or writing a single file fails, THEN THE Migration_Tool SHALL write a log entry recording the bucket name, object key, and the error message, continue processing remaining files, and include a count of failed files per bucket in the final summary report.

---

### Requirement 7: Storage Service — Hostinger Filesystem

**User Story:** As a developer, I want a server-side storage service for reading and writing files on Hostinger, so that admin uploads and public file serving work correctly without any Supabase dependency.

#### Acceptance Criteria

1. THE Storage_Service SHALL resolve all file write destinations relative to the `STORAGE_BASE_PATH` environment variable; IF the sanitised filename resolves to a path outside `STORAGE_BASE_PATH`, THEN THE Storage_Service SHALL reject the upload with an HTTP 400 response.
2. THE Storage_Service SHALL enforce file size limits on upload: IF an uploaded file exceeds 25 MB (for `application/pdf`) or 10 MB (for image MIME types), THEN THE Storage_Service SHALL reject the upload with an HTTP 413 response whose body includes the applicable size limit.
3. THE Storage_Service SHALL validate MIME type on upload against the target bucket's allowed types: `application/pdf` for the PDF bucket; `image/jpeg`, `image/png`, `image/webp`, and `image/svg+xml` for image buckets; IF the MIME type does not match, THEN THE Storage_Service SHALL reject the upload with an HTTP 415 response.
4. THE Storage_Service SHALL generate a safe stored filename by: lowercasing the original name, replacing all characters outside `[a-z0-9.-]` with a hyphen, collapsing consecutive hyphens into one, and appending a millisecond-precision Unix timestamp suffix separated by a hyphen before the file extension.
5. WHEN a file is requested via `/api/public/pdf/{filename}` or `/api/public/images/{filename}`, THE Storage_Service SHALL serve the file from the Hostinger_Storage directory without including any filesystem path information in response headers or body.
6. IF a requested file does not exist on the filesystem, THE Storage_Service SHALL return HTTP 404; IF a filename contains `..`, null bytes, or URL-encoded traversal sequences (`%2e%2e`, `%2f`, `%5c`) that would resolve outside `STORAGE_BASE_PATH`, THE Storage_Service SHALL return HTTP 400.
7. WHEN serving a file that exists, THE Storage_Service SHALL set the response header `Cache-Control: public, max-age=3600`.
8. IF the filesystem write fails during upload, THEN THE Storage_Service SHALL return an HTTP 500 response with a storage-failure error message and SHALL NOT persist any partial file to the Hostinger_Storage directory.

---

### Requirement 8: Admin Catalogue Upload

**User Story:** As an admin, I want to upload the HIR master catalogue PDF through the admin panel, so that visitors can download it from the website without requiring Supabase Storage.

#### Acceptance Criteria

1. WHEN an admin uploads a file via the catalogue upload endpoint, THE Storage_Service SHALL validate the MIME type as `application/pdf`; IF the MIME type is not `application/pdf` or the file exceeds 25 MB, THEN THE Storage_Service SHALL return an error response without writing any file to Hostinger_Storage.
2. WHEN the upload succeeds, THE Storage_Service SHALL return the public URL in the form `/api/public/pdf/{safe-filename}` where `safe-filename` contains only lowercase alphanumeric characters and hyphens, and THE DB_Layer SHALL update the `site_settings` row with key `catalogue_pdf` to the returned URL.
3. IF the DB_Layer update in criterion 2 fails after a successful file write, THEN THE Storage_Service SHALL log the partial-failure state (file written, DB not updated) and return an HTTP 500 response; THE Admin_Console SHALL display the error to the admin within 3 seconds.
4. THE Admin_Console SHALL display the current catalogue title and PDF URL sourced from `site_settings` and allow the admin to edit and save those values; WHEN the admin saves, THE Admin_Console SHALL show a success or error notification without full page reload.
5. IF the `catalogue_pdf` key in `site_settings` is absent or empty, THEN THE Admin_Console SHALL display a notice stating that download buttons are hidden on the public site.

---

### Requirement 9: Product CMS

**User Story:** As an admin, I want to create, edit, publish, draft, and delete products through the admin panel, so that the product catalogue on the public website stays up to date.

#### Acceptance Criteria

1. THE Admin_Console SHALL present form fields for all product properties: `slug`, `name`, `category`, `category_label`, `application_area`, `pack`, `coverage`, `surface`, `color`, `short`, `description`, `features` (one per line), `applications` (JSON), `gallery` (one URL per line), `shades_image`, `video_url`, `pdf`, `seo_title` (max 70 characters), `seo_description` (max 170 characters), `sort_order`, and `published`.
2. WHEN saving a product, THE CMS_Server_Fn SHALL validate that `slug` and `name` are non-empty strings and that `slug` does not already exist for a different product row; IF either validation fails, THEN THE CMS_Server_Fn SHALL return a validation error identifying the failing field without writing to the DB_Layer.
3. WHEN a product's `slug` is changed during edit, THE CMS_Server_Fn SHALL execute the delete of the old slug row and the insert of the new slug row within a single database transaction; IF the transaction fails, THEN THE CMS_Server_Fn SHALL roll back and return an error without leaving partial data.
4. WHEN an admin uploads a product main image or gallery image, THE Storage_Service SHALL accept only files with MIME type `image/jpeg`, `image/png`, `image/webp`, or `image/avif` and size not exceeding 10 MB; IF the file fails validation, THE Storage_Service SHALL return an error before writing.
5. WHEN an admin uploads a product PDF, THE Storage_Service SHALL accept only files with MIME type `application/pdf` and size not exceeding 25 MB and SHALL return the URL in the form `/api/public/pdf/{safe-filename}`; IF the file fails validation, THE Storage_Service SHALL return an error before writing.
6. WHEN an admin deletes a product, THE CMS_Server_Fn SHALL remove the product row from the DB_Layer and return a success response; associated files in Hostinger_Storage SHALL be retained and not deleted automatically.
7. WHEN the public products API is queried, THE DB_Layer SHALL return only rows where `published = 1`, ordered by `sort_order` ascending, with ties broken by `created_at` ascending.

---

### Requirement 10: Blog CMS

**User Story:** As an admin, I want to create, edit, publish, draft, and delete blog posts through the admin panel, so that the HIR blog stays up to date.

#### Acceptance Criteria

1. THE Admin_Console SHALL present form fields for all blog properties: `slug`, `title` (max 500 characters), `image`, `excerpt`, `sections` (JSON), `author`, `category`, `published_at`, `published`, `seo_title` (max 70 characters), `seo_description` (max 170 characters), and `sort_order`.
2. WHEN saving a blog post, THE CMS_Server_Fn SHALL validate that `slug` is a non-empty string that does not already exist for a different blog row, that `title` is a non-empty string, and that `sections` is parseable as a JSON array; IF any validation fails, THEN THE CMS_Server_Fn SHALL return a validation error identifying the failing field without writing to the DB_Layer.
3. WHEN a blog post's `slug` is changed during edit, THE CMS_Server_Fn SHALL execute the delete of the old slug row and the insert of the new slug row within a single database transaction; IF the transaction fails, THE CMS_Server_Fn SHALL roll back and return an error without leaving partial data.
4. WHEN an admin uploads a blog cover image, THE Storage_Service SHALL accept only files with MIME type `image/jpeg`, `image/png`, or `image/webp` and size not exceeding 10 MB and SHALL store the image via the Storage_Service; IF validation fails, THE Storage_Service SHALL return an error before writing.
5. WHEN an admin deletes a blog post, THE CMS_Server_Fn SHALL remove the blog row from the DB_Layer and return a success response.
6. WHEN the public blogs API is queried, THE DB_Layer SHALL return only rows where `published = 1`, ordered by `sort_order` ascending, with ties broken by `published_at` descending.
7. IF a blog cover image upload fails, THEN THE Storage_Service SHALL return an HTTP 500 error and THE Admin_Console SHALL display an upload-failure message to the admin.

---

### Requirement 11: Authentication — Replace Supabase Auth

**User Story:** As an admin, I want a secure login system that does not depend on Supabase Auth, so that I can access the admin panel after Supabase is removed.

#### Acceptance Criteria

1. THE Auth_Service SHALL hash admin passwords using Argon2id before storing them in `admin_users.password_hash`; the stored value SHALL begin with the Argon2id identifier prefix (`$argon2id$`) so that the hash format is verifiable without decoding the password.
2. WHEN an admin submits credentials to the login endpoint, THE Auth_Service SHALL verify the submitted password against the stored Argon2id hash; IF the credentials are correct, THEN THE Auth_Service SHALL create a cryptographically random session token, store a server-side hash of it, set an HttpOnly, Secure, SameSite=Strict session cookie, and return HTTP 200.
3. IF an admin submits incorrect credentials, THEN THE Auth_Service SHALL return HTTP 401 with a generic message that does not distinguish between an incorrect email and an incorrect password.
4. IF an admin account has 5 or more consecutive failed login attempts within a 15-minute window, THEN THE Auth_Service SHALL refuse further login attempts for that account for 15 minutes and return HTTP 429.
5. THE Auth_Service SHALL enforce a session lifetime of 8 hours; WHEN a session token that has exceeded 8 hours is presented, THE Auth_Service SHALL treat it as invalid and return HTTP 401, requiring re-authentication.
6. WHEN an admin's session expires or is invalidated, THE Auth_Service SHALL redirect the admin to the login form; THE Admin_Console SHALL display the login form and not render any admin content.
7. WHEN an admin clicks sign out, THE Auth_Service SHALL invalidate the session server-side and clear the session cookie from the response.
8. THE Auth_Service SHALL protect all `/admin/*` routes and all CMS_Server_Fn write operations; IF a request arrives without a valid session cookie, THEN THE Auth_Service SHALL return HTTP 401 without executing the protected handler.
9. THE Auth_Service SHALL NOT store any session identifier or auth state in `localStorage` or any client-accessible JavaScript variable.
10. IF no valid session cookie is present, THEN THE Admin_Console SHALL display the login form; IF a valid session cookie is present, THEN THE Admin_Console SHALL display the admin dashboard.

---

### Requirement 12: Remove All Supabase Runtime Queries

**User Story:** As a developer, I want every Supabase runtime call replaced with DB_Layer calls, so that the running application makes zero requests to Supabase after migration.

#### Acceptance Criteria

1. THE CMS_Server_Fn handlers and `src/lib/sitemap.server.ts` SHALL replace all `supabaseAdmin.from("products")` calls with the equivalent `getProducts()`, `getPublicProducts()`, `getProductBySlug()`, `createProduct()`, `updateProduct()`, or `deleteProduct()` DB_Layer functions.
2. THE CMS_Server_Fn handlers and `src/lib/sitemap.server.ts` SHALL replace all `supabaseAdmin.from("blogs")` calls with the equivalent `getBlogs()`, `getPublicBlogs()`, `getBlogBySlug()`, `createBlog()`, `updateBlog()`, or `deleteBlog()` DB_Layer functions.
3. THE CMS_Server_Fn handlers SHALL replace all `supabaseAdmin.from("site_settings")` calls with the equivalent `getSiteSettings()` or `upsertSiteSetting()` DB_Layer functions.
4. THE CMS_Server_Fn handlers SHALL replace all `supabaseAdmin.storage.from(bucket)` calls with the equivalent `uploadFile()`, `deleteFile()`, or `getFileUrl()` Storage_Service functions.
5. IF the `src/integrations/supabase/` directory still exists after all references are replaced, THEN it SHALL be deleted; IF any file outside that directory still imports from `@/integrations/supabase/` or `@supabase/supabase-js`, THEN the migration SHALL be considered incomplete.
6. THE `src/start.ts` global function middleware SHALL no longer contain any reference to `attachSupabaseAuth` or any other Supabase auth helper.
7. IF `@supabase/supabase-js` remains listed in `package.json` dependencies or devDependencies after all code references are removed and all tests pass, THEN it SHALL be removed via `npm uninstall`.
8. WHEN the application starts after migration, a network-level audit (e.g. intercepting `fetch`/`https` calls) SHALL confirm zero outbound connections to any hostname matching `*.supabase.co`.

---

### Requirement 13: Environment Variables

**User Story:** As a developer, I want all sensitive credentials managed exclusively through server-side environment variables, so that no secrets are exposed in the client-side JavaScript bundle.

#### Acceptance Criteria

1. THE Application SHALL read MySQL credentials exclusively from the server-side environment variables `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER`, and `DATABASE_PASSWORD`.
2. THE Application SHALL read the filesystem storage path from the server-side environment variable `STORAGE_BASE_PATH`.
3. THE Application SHALL read the session secret from the server-side environment variable `SESSION_SECRET`; the value SHALL be at least 32 bytes of cryptographically random data encoded as base64 or hex.
4. NONE of the variables `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`, `STORAGE_BASE_PATH`, or `SESSION_SECRET` SHALL be prefixed with `VITE_`, and none of their resolved values SHALL appear in any client-side JavaScript asset file produced by `npm run build`.
5. THE Application source code SHALL contain no hardcoded credential strings, connection strings, or secret values.
6. IF any required server-side environment variable is absent at startup OR if `SESSION_SECRET` is present but is fewer than 32 bytes when decoded, THEN THE Application SHALL log one error message per missing or invalid variable identifying the variable name and the nature of the problem, and SHALL exit without completing startup.
7. THE `.env.example` file SHALL contain one commented entry per required variable with a descriptive, non-secret placeholder value, covering all seven of: `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`, `STORAGE_BASE_PATH`, and `SESSION_SECRET`.

---

### Requirement 14: Calculator Preservation

**User Story:** As a user, I want all three calculators (Adhesive, Grout/Epoxy, Waterproofing) to produce identical results after migration, so that material estimates are not affected.

#### Acceptance Criteria

1. THE Adhesive_Calculator SHALL retain the exact formula `consumptionKgPerSqft = grade.coverageKgPerSqft * (bedThicknessMm / grade.referenceThicknessMm)` with wastage applied as `wasteKg = baseKg * WASTAGE_FACTOR`, and bed thickness computed by `autoBedThickness()` using the existing tile-type, longest-edge, tileThickness, surface, and location rules unchanged.
2. THE Grout_Calculator SHALL retain the exact formula `consumptionKgPerM2 = ((L + W) * T * J) / ((L + J) * (W + J)) * specificGravity` with wastage applied as `wasteKg = baseKg * GROUT_WASTAGE_FACTOR`, where all tile dimensions are in mm.
3. THE Waterproofing_Calculator SHALL retain the formula `baseKg = (areaSqft * product.coats) / product.coverageSqftPerKg` applied independently for each product in the selected system, with wastage applied as `wasteKg = baseKg * WATERPROOFING_WASTAGE_FACTOR`.
4. THE Calculator config files (`adhesive.ts`, `grout.ts`, `waterproofing.ts`) SHALL NOT have any numeric constant, array entry, object key, or string value changed; the only permitted edits are TypeScript type annotation corrections required for build compatibility.
5. THE Calculator SHALL NOT make any server-side function call or network request; all calculator logic SHALL remain within client-side module boundaries and SHALL NOT import from any `.server.ts` file.

---

### Requirement 15: Visualizer Preservation

**User Story:** As a user, I want the Tile Visualizer to function identically after migration, so that room, tile, grout, and epoxy selection, perspective view, design saving, and export all continue to work.

#### Acceptance Criteria

1. THE Visualizer SHALL retain the Zustand store at `src/features/visualizer/store.ts` managing the following state fields without server-side calls: `step`, `roomId`, `customRoomKey`, `tileSize`, `customTileSizeMm`, `tilePresetId`, `customTile`, `epoxyId`, `groutMm`, `groutFinish`, and `savedDesigns`.
2. WHEN the user saves a design, THE Visualizer SHALL serialise the updated `savedDesigns` array (capped at 50 entries) to `localStorage` under the key `hir.designs`; WHEN the Visualizer panel mounts, THE Visualizer SHALL read up to 50 designs from `localStorage["hir.designs"]` and populate the store, displaying at most 6 designs in the saved-designs panel.
3. WHEN room images, tile textures, or web font files are requested by the browser, THE Visualizer SHALL serve them from paths under `/public/` (e.g. `/fonts/`, `/images/`) and the browser SHALL receive an HTTP 200 response for each asset.
4. WHEN the user exports a design as PNG or JPEG, THE Visualizer SHALL call `canvas.toDataURL()` on the rendered `PreviewCanvas` element and trigger a file download; WHEN the user exports as PDF, THE Visualizer SHALL use `jsPDF` to embed the canvas image and call `doc.save()` to trigger the PDF download; WHEN the user uses the before/after compare slider, THE Visualizer SHALL render the "after" state full-width and the "before" state (no tiles) clipped to the slider position.
5. IF no file in `src/features/visualizer/` currently imports from `@supabase/supabase-js` or `@/integrations/supabase/`, THEN NO file in that directory SHALL be modified; IF any such import exists, THEN the only permitted change is removal of that import.

---

### Requirement 16: SEO Preservation

**User Story:** As a site owner, I want all SEO metadata, sitemaps, structured data, and canonical URLs to function identically after migration, so that search engine rankings are not disrupted.

#### Acceptance Criteria

1. THE SEO_Infrastructure SHALL retain all sitemap server routes responding at `/sitemap.xml` (index), `/sitemap-products.xml`, `/sitemap-blogs.xml`, `/sitemap-images.xml`, and `/sitemap-pages.xml`.
2. WHEN generating sitemaps, THE `fetchSitemapProducts()` and `fetchSitemapBlogs()` functions in `src/lib/sitemap.server.ts` SHALL query the DB_Layer (`getPublicProducts()` and `getPublicBlogs()`) instead of `supabaseAdmin`.
3. THE `SITE_URL`, `SITE_URL_ALT`, `SITE_NAME`, and `BRAND` constants in `src/lib/seo.ts` SHALL remain byte-for-byte identical after migration.
4. On product detail routes, the Product and VideoObject JSON-LD schemas SHALL be emitted; on blog detail routes, the Article schema SHALL be emitted; on the home page, the Organization, LocalBusiness, and WebSite schemas SHALL be emitted; on listing pages, the ItemList schema SHALL be emitted; on the calculator page, the HowTo and FAQ schemas SHALL be emitted — all via the existing `jsonLdScript()` helper.
5. THE `public/robots.txt` and `public/llms.txt` files SHALL remain byte-for-byte identical after migration.
6. WHEN any route's `head()` function is called, THE `buildMeta()` helper SHALL produce `og:title`, `og:description`, `og:url`, `og:image`, `twitter:card`, `twitter:title`, `twitter:description`, and `twitter:image` meta tags in the page head.
7. WHEN any route's `head()` function is called, THE `canonicalLinks()` helper SHALL produce one `<link rel="canonical">`, one `<link rel="alternate" hreflang="en">`, and one `<link rel="alternate" hreflang="x-default">` link tag in the page head.
8. WHEN sitemap generation fails due to a DB_Layer error, THE `safeSitemap()` wrapper SHALL return a valid empty `<urlset>` XML document with `Cache-Control: public, max-age=60`.

---

### Requirement 17: Remove Lovable Cloud Runtime Dependencies

**User Story:** As a developer, I want all Lovable Cloud build and runtime dependencies removed, so that the application builds and runs on Hostinger without requiring a Lovable Cloud account.

#### Acceptance Criteria

1. WHEN `npm run build` is executed, THE `vite.config.ts` file SHALL NOT import `@lovable.dev/vite-tanstack-config`; instead it SHALL configure the build using `@tanstack/react-start/vite`, `vite-plugin-nitro`, `@vitejs/plugin-react`, `@tailwindcss/vite`, and `vite-tsconfig-paths` directly, preserving the existing `manualChunks` SSR optimisation options.
2. IF the `@lovable.dev/vite-tanstack-config` package has been confirmed removed from criterion 1 (zero exit code, zero compilation errors), THEN `@lovable.dev/vite-tanstack-config` SHALL be absent from `devDependencies` in `package.json`.
3. THE Application SHALL NOT rely on Lovable Cloud to inject `VITE_SUPABASE_*` environment variables at build time; those variables SHALL be resolvable from the project's own `.env` file or Hostinger's hosting environment configuration without Lovable Cloud involvement.
4. THE `.lovable/` directory and its contents SHALL remain present in the repository and SHALL NOT be deleted.
5. WHEN `npm run build` is executed on a machine with no Lovable Cloud credentials or network access to Lovable Cloud, THE build process SHALL exit with code 0 and report zero errors.

---

### Requirement 18: Hostinger Compatibility

**User Story:** As a developer, I want the application to run correctly on Hostinger's Node.js hosting, so that TanStack Start, Nitro, and server functions all work in production.

#### Acceptance Criteria

1. THE Nitro configuration in `vite.config.ts` or `nitro.config.ts` SHALL specify `preset: "node"` or `preset: "node-server"` and SHALL NOT specify `preset: "cloudflare"` or any edge-runtime preset.
2. THE Application SHALL write uploaded files to the path defined by `STORAGE_BASE_PATH`; that path SHALL be outside the build output directory (e.g. not inside `.output/` or `dist/`) so that files survive application restarts and redeployments.
3. THE Application SHALL use `mysql2/promise` for all MySQL connections, initialised as a connection pool via `mysql2/promise.createPool()`.
4. THE Application entry point SHALL remain `src/server.ts` as the Nitro server entry file.
5. WHEN the application is deployed on Hostinger and a request is made to an SSR page route, a server function route, a static asset, a file download route, or a sitemap route, THE Application SHALL return HTTP 2xx with a non-empty body and the correct `Content-Type` header.
6. IF `STORAGE_BASE_PATH` is not set in the environment at server startup, THEN THE Application SHALL log a diagnostic error identifying the missing variable and SHALL exit without accepting any HTTP requests.

---

### Requirement 19: Build Verification

**User Story:** As a developer, I want the application to build and run without TypeScript or SSR errors after migration, so that the production deployment is stable.

#### Acceptance Criteria

1. WHEN `npm run build` is executed with all required environment variables set, THE build process SHALL exit with code 0 and the TypeScript compiler SHALL report zero type errors.
2. WHEN `npm run dev` is executed with all required environment variables set, THE development server SHALL start and log a ready message without any uncaught runtime error related to missing Supabase modules or unresolved environment variables.
3. WHEN `npm run build` completes, THE build output SHALL contain zero instances of the string `Cannot find module '@/integrations/supabase/` in compiler output or build logs.
4. WHEN `npm run build` completes, THE build output SHALL contain zero instances of `import.meta.env.VITE_SUPABASE_` in any generated SSR bundle file.
5. WHEN the Nitro server starts, THE DB_Layer connection pool SHALL successfully connect to MySQL and log a message confirming the connection, observable in the server startup output.

---

### Requirement 20: End-to-End Feature Testing

**User Story:** As a developer, I want every public page and admin flow tested after migration, so that no functionality is broken for visitors or the admin.

#### Acceptance Criteria

1. WHEN a GET request is made to the home page, products index, any individual product page, blogs index, any individual blog page, calculator page, visualizer page, about page, and contact page, THE Public_Site SHALL return HTTP 2xx with a non-empty body and no uncaught server-side exceptions.
2. WHEN the products index page is rendered, THE Public_Site SHALL display the same count of published products as are present in the MySQL `products` table with `published = 1`, ordered by `sort_order` ascending.
3. WHEN the blogs index page is rendered, THE Public_Site SHALL display the same count of published blog posts as are present in the MySQL `blogs` table with `published = 1`, ordered by `sort_order` ascending.
4. WHEN an admin performs login, logout, create product, edit product, delete product, create blog, edit blog, delete blog, upload catalogue PDF, and update site settings, each operation SHALL complete without an HTTP 5xx response or uncaught server exception.
5. WHEN a GET request is made to `/api/public/pdf/{filename}` for a file present in Hostinger_Storage, THE Public_Site SHALL return HTTP 200 with `Content-Type: application/pdf`.
6. WHEN a GET request is made to `/api/public/images/{filename}` for an image file present in Hostinger_Storage, THE Public_Site SHALL return HTTP 200 with an image MIME type (`image/jpeg`, `image/png`, `image/webp`, or `image/avif`).
7. WHEN GET requests are made to `/sitemap.xml`, `/sitemap-products.xml`, `/sitemap-blogs.xml`, `/sitemap-images.xml`, and `/sitemap-pages.xml`, each SHALL return HTTP 200 with `Content-Type: application/xml` and a response body that is parseable as well-formed XML.

---

### Requirement 21: Data Validation After Migration

**User Story:** As a developer, I want a post-migration validation report confirming row counts and key field integrity, so that I can confirm no data was lost or corrupted.

#### Acceptance Criteria

1. WHEN migration completes, THE Migration_Tool SHALL query the row count of `products` in both Supabase and MySQL; IF the counts are equal, THE Migration_Tool SHALL log a pass result; IF they differ, THE Migration_Tool SHALL log the table name, the Supabase count, and the MySQL count as a failure.
2. WHEN migration completes, THE Migration_Tool SHALL query the row count of `blogs` in both Supabase and MySQL; IF the counts are equal, THE Migration_Tool SHALL log a pass result; IF they differ, THE Migration_Tool SHALL log the table name, the Supabase count, and the MySQL count as a failure.
3. WHEN migration completes, THE Migration_Tool SHALL query all key-value pairs from Supabase `site_settings` and verify that each key exists in MySQL `site_settings` with an identical value; IF any key is missing or has a different value, THE Migration_Tool SHALL log the key name, the Supabase value, and the MySQL value as a failure.
4. WHEN migration completes, THE Migration_Tool SHALL query all `slug` values from Supabase `products` and verify that each slug exists as a row in MySQL `products`; IF any slug is absent, THE Migration_Tool SHALL log the missing slug as a failure.
5. WHEN migration completes, THE Migration_Tool SHALL query all `slug` values from Supabase `blogs` and verify that each slug exists as a row in MySQL `blogs`; IF any slug is absent, THE Migration_Tool SHALL log the missing slug as a failure.
6. WHEN migration completes, THE Migration_Tool SHALL execute a `SELECT` on each JSON column (`gallery`, `features`, `applications`, `application_list`, `sections`) across all non-NULL rows and verify that MySQL can parse each value without error; IF any value fails to parse, THE Migration_Tool SHALL log the table name, row id, column name, and raw value as a failure.
7. IF any validation check in criteria 1–6 produces a failure, THEN THE Migration_Tool SHALL output a report listing each failure with the table name, check type, and specific row identifier or value that failed, and SHALL exit without performing the cutover, leaving Supabase unchanged.

---

### Requirement 22: Safe Cutover and Rollback

**User Story:** As a developer, I want to switch production traffic from the Supabase-backed deployment to the MySQL-backed deployment safely, so that I can roll back without data loss if any issue is detected.

#### Acceptance Criteria

1. THE Supabase database, storage buckets, and Auth configuration SHALL remain intact and unmodified until the new deployment has operated in production for 48 continuous hours with zero HTTP 5xx errors, zero health-check failures, and zero data-consistency failures detected by the validation checks in Requirement 21.
2. WHEN the Migration_Tool is invoked with the `--dry-run` flag, THE Migration_Tool SHALL connect to both Supabase and MySQL, perform all validation checks (row counts, primary key integrity, duplicate key detection, null constraint checks, JSON column parseability), report the expected outcome of a live migration, and exit without writing, updating, or deleting any data in either database.
3. WHEN the new deployment has been confirmed stable per criterion 1, THE Operations team SHALL be instructed to remove the Supabase service role key from the server environment to disable write access — not to delete any Supabase data.
4. IF a critical issue (any HTTP 5xx error rate above 0%, any health-check failure, or any data record unreachable compared to the Supabase baseline) is detected within the 48-hour window, THEN THE team SHALL be able to complete rollback to Supabase by updating environment variables only — without a code deployment — within 15 minutes of initiating rollback.
5. THE `.env.example` file SHALL be committed to the repository with one entry per required environment variable, each set to a descriptive non-secret placeholder value.
6. WHEN the 48-hour stability window expires without a critical issue, THE team SHALL retain rollback availability for an additional 48 hours before any Supabase decommission steps are considered.

---

### Requirement 23: Credential and Secret Security

**User Story:** As a developer, I want all credentials and secrets to remain server-side only, so that no database passwords, session secrets, or API keys are leaked to the browser.

#### Acceptance Criteria

1. NONE of the environment variable names `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`, `STORAGE_BASE_PATH`, or `SESSION_SECRET` SHALL be prefixed with `VITE_`, and none of their resolved runtime values SHALL appear as literal strings in any JavaScript asset file in the client-side bundle produced by `npm run build`.
2. THE DB_Layer and Auth_Service modules SHALL be located in files whose names end in `.server.ts`; IF any client-side bundle produced by `npm run build` contains an import reference to those files, THE build SHALL be considered to have failed the security requirement.
3. WHEN `npm run build` completes, THE client-side JavaScript bundle files SHALL contain no string matching the resolved value of `STORAGE_BASE_PATH` as set in the build environment.
4. THE `admin_users.password_hash` column SHALL store only values beginning with the Argon2id identifier prefix `$argon2id$`; the plaintext password SHALL NOT appear in any database row, log file, or server response.
5. THE hardcoded credential strings `ADMIN_TOKEN = "Hir@2026"` and `ADMIN_PASSWORD = "Hir@2026"` in `cms.functions.ts`, `content-store.ts`, `settings-store.ts`, and `admin.tsx` SHALL be removed and replaced by the Auth_Service cookie-based session check before any admin route or CMS operation is accessible.

import fs from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { getStorageConfig } from "../db/config.server";

const getStorageBasePath = () => getStorageConfig().basePath;

// Allowed MIME types per bucket
const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  "product-images": ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/avif"],
  "blog-images": ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/avif"],
  "product-pdfs": ["application/pdf"],
};

// Size limits in bytes
const SIZE_LIMITS: Record<string, number> = {
  "product-images": 10 * 1024 * 1024, // 10 MB
  "blog-images": 10 * 1024 * 1024, // 10 MB
  "product-pdfs": 25 * 1024 * 1024, // 25 MB
};

class StorageError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = "StorageError";
  }
}

// Initialize storage directories
async function ensureStorageDirectories() {
  const STORAGE_BASE_PATH = getStorageBasePath();
  const buckets = ["product-images", "blog-images", "product-pdfs"];
  for (const bucket of buckets) {
    const bucketPath = path.join(STORAGE_BASE_PATH, bucket);
    if (!existsSync(bucketPath)) {
      await fs.mkdir(bucketPath, { recursive: true });
      console.log(`[storage] Created directory: ${bucketPath}`);
    }
  }
}

// Sanitize filename: lowercase, replace unsafe chars with hyphen, collapse multiple hyphens
function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Generate safe stored filename with timestamp
function generateSafeFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const base = path.basename(originalName, ext);
  const sanitized = sanitizeFilename(base);
  const timestamp = Date.now();
  return `${sanitized}-${timestamp}${ext.toLowerCase()}`;
}

// Validate path is within base directory
function validatePath(filePath: string): void {
  const STORAGE_BASE_PATH = getStorageBasePath();
  const resolved = path.resolve(filePath);
  const base = path.resolve(STORAGE_BASE_PATH);

  // Check for path traversal
  if (!resolved.startsWith(base)) {
    throw new StorageError("Invalid file path", 400);
  }

  // Check for dangerous sequences
  if (
    filePath.includes("..") ||
    filePath.includes("\0") ||
    filePath.includes("%2e%2e") ||
    filePath.includes("%2f") ||
    filePath.includes("%5c")
  ) {
    throw new StorageError("Invalid file path", 400);
  }
}

// Detect MIME type from file buffer (basic magic byte detection)
function detectMimeType(buffer: Uint8Array): string {
  // PDF
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return "application/pdf";
  }
  // JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  // PNG
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  // WebP
  if (
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }
  // SVG (basic check for "<svg")
  const text = Buffer.from(buffer.slice(0, 100)).toString("utf8");
  if (text.includes("<svg")) {
    return "image/svg+xml";
  }

  return "application/octet-stream";
}

/**
 * Upload a file to storage
 * @param bucket - Storage bucket name (product-images, blog-images, product-pdfs)
 * @param filename - Original filename
 * @param data - File data as Uint8Array
 * @returns Public URL for the uploaded file
 */
export async function uploadFile(
  bucket: string,
  filename: string,
  data: Uint8Array
): Promise<string> {
  await ensureStorageDirectories();

  // Validate bucket
  if (!ALLOWED_MIME_TYPES[bucket]) {
    throw new StorageError("Invalid bucket", 400);
  }

  // Detect MIME type
  const mimeType = detectMimeType(data);

  // Validate MIME type
  const allowed = ALLOWED_MIME_TYPES[bucket];
  if (!allowed.includes(mimeType)) {
    throw new StorageError(
      `Invalid file type. Allowed types: ${allowed.join(", ")}`,
      415
    );
  }

  // Validate size
  const sizeLimit = SIZE_LIMITS[bucket];
  if (data.length > sizeLimit) {
    throw new StorageError(
      `File size exceeds limit of ${sizeLimit / (1024 * 1024)} MB`,
      413
    );
  }

  // Generate safe filename
  const safeFilename = generateSafeFilename(filename);
  const STORAGE_BASE_PATH = getStorageBasePath();
  const filePath = path.join(STORAGE_BASE_PATH, bucket, safeFilename);

  // Validate path
  validatePath(filePath);

  // Write file
  try {
    await fs.writeFile(filePath, data);
    console.log(`[storage] Uploaded file: ${filePath}`);
  } catch (error) {
    console.error("[storage] Failed to write file:", error);
    throw new StorageError("Failed to save file", 500);
  }

  // Return public URL based on bucket
  if (bucket === "product-pdfs") {
    // PDFs are served via API route for security and validation
    return `/api/public/pdf/${safeFilename}`;
  } else {
    // Images are served directly from public folder
    return `/storage/${bucket}/${safeFilename}`;
  }
}

/**
 * Get a file from storage
 * @param bucket - Storage bucket name
 * @param filename - Filename to retrieve
 * @returns File data as Buffer
 */
export async function getFile(bucket: string, filename: string): Promise<Buffer> {
  // Validate bucket
  if (!ALLOWED_MIME_TYPES[bucket]) {
    throw new StorageError("Invalid bucket", 400);
  }

  const STORAGE_BASE_PATH = getStorageBasePath();
  const filePath = path.join(STORAGE_BASE_PATH, bucket, filename);

  // Validate path
  validatePath(filePath);

  // Check if file exists
  if (!existsSync(filePath)) {
    throw new StorageError("File not found", 404);
  }

  // Read file
  try {
    const data = await fs.readFile(filePath);
    return data;
  } catch (error) {
    console.error("[storage] Failed to read file:", error);
    throw new StorageError("Failed to read file", 500);
  }
}

/**
 * Delete a file from storage
 * @param bucket - Storage bucket name
 * @param filename - Filename to delete
 */
export async function deleteFile(bucket: string, filename: string): Promise<void> {
  // Validate bucket
  if (!ALLOWED_MIME_TYPES[bucket]) {
    throw new StorageError("Invalid bucket", 400);
  }

  const STORAGE_BASE_PATH = getStorageBasePath();
  const filePath = path.join(STORAGE_BASE_PATH, bucket, filename);

  // Validate path
  validatePath(filePath);

  // Delete file if it exists
  try {
    if (existsSync(filePath)) {
      await fs.unlink(filePath);
      console.log(`[storage] Deleted file: ${filePath}`);
    }
  } catch (error) {
    console.error("[storage] Failed to delete file:", error);
    throw new StorageError("Failed to delete file", 500);
  }
}

/**
 * Get public URL for a file
 * @param bucket - Storage bucket name
 * @param filename - Filename
 * @returns Public URL
 */
export function getFileUrl(bucket: string, filename: string): string {
  if (bucket === "product-pdfs") {
    // PDFs are served via API route for security and validation
    return `/api/public/pdf/${filename}`;
  } else {
    // Images are served directly from public folder
    return `/storage/${bucket}/${filename}`;
  }
}

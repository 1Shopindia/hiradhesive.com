/**
 * Database Configuration Module (Server-Side Only)
 * 
 * This module resolves database configuration from environment variables
 * and provides environment-aware defaults for local development.
 * 
 * SECURITY: This file must NEVER be imported in client-side code.
 */

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  environment: 'development' | 'production';
}

export interface StorageConfig {
  basePath: string;
}

/**
 * Detect current environment
 */
function detectEnvironment(): 'development' | 'production' {
  // Check NODE_ENV first
  if (process.env.NODE_ENV === 'production') {
    return 'production';
  }
  
  // Check for Hostinger-specific indicators
  if (process.env.DATABASE_HOST?.includes('hstgr.io')) {
    return 'production';
  }
  
  // Check for production database name
  if (process.env.DATABASE_NAME?.startsWith('u860840011_')) {
    return 'production';
  }
  
  // Default to development
  return 'development';
}

/**
 * Get database configuration with environment-aware validation
 */
export function getDatabaseConfig(): DatabaseConfig {
  const env = detectEnvironment();
  
  const host = process.env.DATABASE_HOST;
  const portStr = process.env.DATABASE_PORT;
  const database = process.env.DATABASE_NAME;
  const user = process.env.DATABASE_USER;
  const password = process.env.DATABASE_PASSWORD;
  
  // Validate required variables
  const missing: string[] = [];
  
  if (!host) missing.push('DATABASE_HOST');
  if (!database) missing.push('DATABASE_NAME');
  if (!user) missing.push('DATABASE_USER');
  if (password === undefined) missing.push('DATABASE_PASSWORD');
  
  if (missing.length > 0) {
    const error = `[db:config] Missing required environment variables: ${missing.join(', ')}`;
    console.error(error);
    console.error('[db:config] Current environment:', env);
    console.error('[db:config] Available DATABASE_* variables:', {
      DATABASE_HOST: host ? '(set)' : '(missing)',
      DATABASE_PORT: portStr ? '(set)' : '(missing)',
      DATABASE_NAME: database ? '(set)' : '(missing)',
      DATABASE_USER: user ? '(set)' : '(missing)',
      DATABASE_PASSWORD: password !== undefined ? '(set)' : '(missing)',
    });
    throw new Error(error);
  }
  
  // Parse port
  const port = portStr ? parseInt(portStr, 10) : 3306;
  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new Error(`[db:config] Invalid DATABASE_PORT: ${portStr}`);
  }
  
  // Production-specific validation
  if (env === 'production') {
    if (host === 'localhost' || host === '127.0.0.1') {
      console.warn('[db:config] WARNING: Using localhost in production environment!');
    }
    
    if (user === 'root') {
      console.warn('[db:config] WARNING: Using root user in production environment!');
    }
    
    if (!password || password === '') {
      console.warn('[db:config] WARNING: Empty password in production environment!');
    }
  }
  
  // Log safe connection info (never log password)
  console.log('[db:config] Database configuration loaded:', {
    environment: env,
    host,
    port,
    database,
    user,
    passwordSet: !!password,
  });
  
  return {
    host: host!,
    port,
    database: database!,
    user: user!,
    password: password!,
    environment: env,
  };
}

/**
 * Get storage configuration
 */
export function getStorageConfig(): StorageConfig {
  const env = detectEnvironment();
  const basePath = process.env.STORAGE_BASE_PATH;
  
  if (!basePath) {
    const error = '[storage:config] Missing STORAGE_BASE_PATH environment variable';
    console.error(error);
    console.error('[storage:config] Environment:', env);
    console.error('[storage:config] STORAGE_BASE_PATH configured:', !!basePath);
    console.error('[storage:config] Available env vars with STORAGE or PATH:', 
      Object.keys(process.env).filter(k => k.includes('STORAGE') || k.includes('BASE')));
    console.error('[storage:config] Node.js process.env keys count:', Object.keys(process.env).length);
    
    // Production must have this configured in Hostinger environment panel
    if (env === 'production') {
      console.error('[storage:config] PRODUCTION ERROR: STORAGE_BASE_PATH must be set in Hostinger Node.js App environment variables panel');
      console.error('[storage:config] Expected value: /home/u860840011/domains/hiradhesive.com/public_html/uploads');
    }
    
    throw new Error(error);
  }
  
  console.log('[storage:config] Storage configuration loaded:', {
    environment: env,
    configured: true, // Never log the actual path for security
  });
  
  return {
    basePath,
  };
}

/**
 * Validate all required environment variables on startup
 * Call this early in server initialization
 */
export function validateEnvironment(): void {
  try {
    getDatabaseConfig();
    getStorageConfig();
    console.log('[config] Environment validation successful');
  } catch (error) {
    console.error('[config] Environment validation failed:', error);
    throw error;
  }
}

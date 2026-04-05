/**
 * ================================================
 * 🔧 CENTRAL CONFIGURATION FILE
 * ================================================
 * 
 * সব configuration .env থেকে আসে।
 * Secrets (Supabase, Google, JWT) কখনো code-এ hardcode থাকবে না।
 * 
 * ✅ .env → config.ts → সব জায়গায়
 * ✅ Secrets কোথাও থেকে এনে হবে না, শুধু .env থেকে
 * ================================================
 */

// ===========================================
// 🔐 ENVIRONMENT VARIABLES
// ===========================================
// সব sensitive values .env থেকে আসে — কোনো fallback নেই

const env = {
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',

  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || '',

  // App
  appName: process.env.APP_NAME || 'Dokan Enterprise',
  appVersion: process.env.APP_VERSION || 'v6.2.0',
  productionDomain: process.env.PRODUCTION_DOMAIN || '',

  // Security
  jwtSecret: process.env.JWT_SECRET || '',
  backupApiKey: process.env.BACKUP_API_KEY || '',
};

// Default config for non-sensitive fallbacks only
const DEFAULT_CONFIG = {
  supabase: {
    url: env.supabaseUrl,
    anonKey: env.supabaseAnonKey,
  },
  google: {
    clientId: env.googleClientId,
    clientSecret: env.googleClientSecret,
    redirectUri: env.googleRedirectUri,
  },
  app: {
    name: env.appName,
    version: env.appVersion,
    productionDomain: env.productionDomain,
  },
};

// Runtime config cache
let cachedConfig: typeof DEFAULT_CONFIG | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minute cache

/**
 * Validate required environment variables
 */
export function validateEnv(): { valid: boolean; missing: string[] } {
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  const missing = required.filter(key => !process.env[key]);
  return { valid: missing.length === 0, missing };
}

/**
 * Get all raw env values (for server-side only)
 */
export function getEnv() {
  return env;
}

/**
 * Get config value from database or fallback to default
 * Call this on server side only!
 */
export async function getConfig(): Promise<typeof DEFAULT_CONFIG> {
  // Return cached config if still valid
  if (cachedConfig && Date.now() - lastFetchTime < CACHE_DURATION) {
    return cachedConfig;
  }

  try {
    // Dynamic import to avoid issues on client side
    const { supabase } = await import('./db');
    
    const { data, error } = await supabase
      .from('app_config')
      .select('key, value');
    
    if (error || !data || data.length === 0) {
      console.log('Using env config (DB not available)');
      return DEFAULT_CONFIG;
    }

    // Build config from database — only non-sensitive keys from DB
    const dbConfig: Record<string, string> = {};
    data.forEach(item => {
      dbConfig[item.key] = item.value;
    });

    cachedConfig = {
      supabase: {
        // Secrets always come from env, never from DB
        url: env.supabaseUrl,
        anonKey: env.supabaseAnonKey,
      },
      google: {
        // Secrets always come from env, never from DB
        clientId: env.googleClientId,
        clientSecret: env.googleClientSecret,
        redirectUri: env.googleRedirectUri,
      },
      app: {
        // Non-sensitive app config can come from DB
        name: dbConfig.app_name || env.appName,
        version: dbConfig.app_version || env.appVersion,
        productionDomain: dbConfig.production_domain || env.productionDomain,
      },
    };

    lastFetchTime = Date.now();
    return cachedConfig;
  } catch (error) {
    console.log('Using env config (error):', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Clear config cache (call after updating config)
 */
export function clearConfigCache() {
  cachedConfig = null;
  lastFetchTime = 0;
}

// Synchronous config for immediate use (uses .env values)
// For async with DB values, use getConfig() instead
export const CONFIG = DEFAULT_CONFIG;

// Export default for backward compatibility
export default CONFIG;

/*
┌─────────────────────────────────────────────────────────────────┐
│ 📋 ENVIRONMENT VARIABLES (.env)                                  │
├──────────────────────────────────────────────────────────────────┤
│ Variable              │ Description                              │
├───────────────────────┼──────────────────────────────────────────┤
│ SUPABASE_URL          │ Supabase Project URL (Required)           │
│ SUPABASE_ANON_KEY     │ Supabase Key (Required)                   │
│ GOOGLE_CLIENT_ID      │ Google OAuth Client ID                    │
│ GOOGLE_CLIENT_SECRET  │ Google OAuth Client Secret                │
│ GOOGLE_REDIRECT_URI   │ Google OAuth Redirect URI                 │
│ APP_NAME              │ Application Name                          │
│ APP_VERSION           │ Application Version                       │
│ PRODUCTION_DOMAIN     │ Production Domain URL                     │
│ JWT_SECRET            │ JWT signing secret (Required)              │
│ BACKUP_API_KEY        │ Backup API auth key (Required)             │
└───────────────────────┴──────────────────────────────────────────┘

⚠️ Secrets (.env) পরিবর্তন করলে dev server restart দিতে হবে!
*/

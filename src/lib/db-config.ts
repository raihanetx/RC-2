// Database configuration
export const databaseConfig = {
  // Check if we should use PostgreSQL (Neon) or SQLite
  isProduction: process.env.NODE_ENV === 'production',
  usePostgres: process.env.POSTGRES_URL?.includes('postgres') || false,
  
  // Get the appropriate database URL
  getDatabaseUrl: () => {
    // If PostgreSQL URL is available, use it
    if (process.env.POSTGRES_URL) {
      return process.env.POSTGRES_URL;
    }
    
    // Otherwise use the default DATABASE_URL (SQLite fallback)
    return process.env.DATABASE_URL;
  },
  
  // Get current database provider
  getProvider: () => {
    if (process.env.POSTGRES_URL?.includes('postgres')) {
      return 'postgresql';
    }
    return 'sqlite';
  }
};
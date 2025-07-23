import { Pool as PgPool } from 'pg';
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Determine if using Neon (serverless) or local PostgreSQL
const isNeonDatabase = process.env.DATABASE_URL.includes('neon.tech') || process.env.DATABASE_URL.includes('neon.database');

let pool: any;
let db: any;

if (isNeonDatabase) {
  // Use Neon serverless for cloud deployment
  neonConfig.webSocketConstructor = ws;
  
  pool = new NeonPool({ 
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  
  db = drizzleNeon({ client: pool, schema });
  console.log('🌐 Connected to Neon PostgreSQL (serverless)');
} else {
  // Use regular PostgreSQL for local development
  pool = new PgPool({ 
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  db = drizzlePg(pool, { schema });
  console.log('🗄️  Connected to local PostgreSQL database');
}

// Handle pool errors
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
});

export { pool, db };
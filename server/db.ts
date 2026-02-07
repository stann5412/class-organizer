import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@shared/schema";

// Optimisation pour Vercel : garde la connexion active entre les requêtes
neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in Environment Variables");
}

// Initialisation du client Neon
const sql = neon(process.env.DATABASE_URL);

// Liaison de Drizzle avec ton schéma (Semestres, Cours, etc.)
export const db = drizzle(sql, { schema });
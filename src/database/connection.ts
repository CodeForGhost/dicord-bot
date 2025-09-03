import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import type { Database as DatabaseType } from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: DatabaseType | null = null;

export const initDatabase = async (): Promise<void> => {
  try {
    const dbPath = path.join(__dirname, '..', '..', 'data', 'bot.db');

    // Create data directory if it doesn't exist
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    db = new Database(dbPath);
    db!.pragma('journal_mode = WAL');
    console.warn(`Database connected at ${dbPath}`);
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

export const getDatabase = (): DatabaseType => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

export const closeDatabase = (): void => {
  if (db) {
    db.close();
    db = null;
  }
};

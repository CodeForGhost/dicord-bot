import { getDatabase } from './connection';

export const runMigrations = async (): Promise<void> => {
  const db = getDatabase();

  // Create guild_settings table (idempotent - won't break if run twice)
  db.exec(`
    CREATE TABLE IF NOT EXISTS guild_settings (
      guild_id TEXT PRIMARY KEY,
      stats_channel_id TEXT,
      leaderboard_channel_id TEXT,
      admin_role_id TEXT,
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  console.warn('Database migrations completed');
};

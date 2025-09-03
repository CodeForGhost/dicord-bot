import { getDatabase } from './connection';

export interface GuildSettings {
  guild_id: string;
  stats_channel_id: string | null;
  leaderboard_channel_id: string | null;
  admin_role_id: string | null;
  updated_at: number;
}

export class GuildSettingsModel {
  static get(guildId: string): GuildSettings | undefined {
    const db = getDatabase();
    return db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?').get(guildId) as
      | GuildSettings
      | undefined;
  }

  static upsert(
    guildId: string,
    settings: Partial<Omit<GuildSettings, 'guild_id' | 'updated_at'>>
  ): void {
    const db = getDatabase();
    const existing = this.get(guildId);

    if (existing) {
      const updates: string[] = [];
      const values: any[] = [];

      if (settings.stats_channel_id !== undefined) {
        updates.push('stats_channel_id = ?');
        values.push(settings.stats_channel_id);
      }
      if (settings.leaderboard_channel_id !== undefined) {
        updates.push('leaderboard_channel_id = ?');
        values.push(settings.leaderboard_channel_id);
      }
      if (settings.admin_role_id !== undefined) {
        updates.push('admin_role_id = ?');
        values.push(settings.admin_role_id);
      }

      if (updates.length > 0) {
        updates.push('updated_at = ?');
        values.push(Math.floor(Date.now() / 1000));
        values.push(guildId);

        const sql = `UPDATE guild_settings SET ${updates.join(', ')} WHERE guild_id = ?`;
        db.prepare(sql).run(...values);
      }
    } else {
      db.prepare(
        `
        INSERT INTO guild_settings (guild_id, stats_channel_id, leaderboard_channel_id, admin_role_id, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `
      ).run(
        guildId,
        settings.stats_channel_id || null,
        settings.leaderboard_channel_id || null,
        settings.admin_role_id || null,
        Math.floor(Date.now() / 1000)
      );
    }
  }

  static delete(guildId: string): void {
    const db = getDatabase();
    db.prepare('DELETE FROM guild_settings WHERE guild_id = ?').run(guildId);
  }
}

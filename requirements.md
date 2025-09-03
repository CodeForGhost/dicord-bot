## What you’ll build

A tiny Discord bot skeleton that proves you can:

- Split code into neat folders
- Handle channels by **ID**, not by name
- Give admins simple slash commands to bind/unbind
- Keep the bot alive even when stuff goes missing
- Store settings somewhere
- Show you know how to handle secrets + linting

## Requirements

1. **Commands + Events in folders**
   - Commands go in `/discord/commands` (each command its own file)
   - Events go in `/discord/events`
   - On startup, the bot autoloads them
2. **Binding + Status commands**
   - `/bind <resource> <#channel|@role>` → saves the ID (not the name)
   - `/status` → shows current bindings + if they’re healthy/missing

   Resources to support: `stats_channel`, `leaderboard_channel`, `admin_role`

3. **Guild Settings**
   - Store per-guild: `stats_channel_id`, `leaderboard_channel_id`, `admin_role_id`, `updated_at`
   - Just use SQLite (local file DB) so setup is simple

4. **Graceful Degradation**
   - If a bound channel/role is deleted, the bot should log a warning and skip that feature
   - Don’t crash the whole thing

5. **Config & Secrets**
   - Use `.env` for `DISCORD_TOKEN` and `DISCORD_CLIENT_ID`
   - Validate on startup — if missing, exit with a clear error

6. **Repo Hygiene**
   - Add ESLint + Prettier
   - Add a simple GitHub Action that runs `npm ci && npm run lint` on PRs

7. **Mini Feature Using Bindings**
   - Implement a `/leaderboard` command that posts a fake leaderboard into the bound `leaderboard_channel`
   - Data can be mocked (e.g. `[user1: 100 pts, user2: 80 pts]`)
   - If no leaderboard_channel bound, it should politely tell the admin

8. **Simple Migration**
   - Write one migration file that creates the `guild_settings` table
   - Migration should be idempotent (running it twice doesn’t break)

## Bonus (not required but nice)

A fake command `/ping-stats` that posts “pong” to the bound stats channel if it exists, otherwise warns.

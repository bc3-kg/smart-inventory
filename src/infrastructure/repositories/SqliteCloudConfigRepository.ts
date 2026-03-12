/* file:///d:/smart-inventory/src/infrastructure/repositories/SqliteCloudConfigRepository.ts */
import { Database } from 'better-sqlite3';
import { CloudConfig } from '../../domain/entities/CloudConfig';
import { ICloudConfigRepository } from '../../domain/repositories/ICloudConfigRepository';

export class SqliteCloudConfigRepository implements ICloudConfigRepository {
    constructor(private db: Database) { }

    async getConfig(): Promise<CloudConfig> {
        const row = this.db.prepare('SELECT isEnabled, apiToken, lastSyncedAt FROM cloud_config WHERE id = 1').get() as any;
        
        if (!row) {
            // Return default config if not initialized
            return {
                isEnabled: false,
                apiToken: ''
            };
        }

        return {
            isEnabled: row.isEnabled === 1,
            apiToken: row.apiToken || '',
            lastSyncedAt: row.lastSyncedAt ? new Date(row.lastSyncedAt) : undefined
        };
    }

    async updateConfig(config: CloudConfig): Promise<void> {
        const stmt = this.db.prepare(`
            INSERT INTO cloud_config (id, isEnabled, apiToken, lastSyncedAt)
            VALUES (1, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET 
                isEnabled = excluded.isEnabled,
                apiToken = excluded.apiToken,
                lastSyncedAt = excluded.lastSyncedAt
        `);
        stmt.run(
            config.isEnabled ? 1 : 0,
            config.apiToken,
            config.lastSyncedAt ? config.lastSyncedAt.getTime() : null
        );
    }
}

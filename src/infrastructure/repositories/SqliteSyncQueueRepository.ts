/* file:///d:/smart-inventory/src/infrastructure/repositories/SqliteSyncQueueRepository.ts */
import { Database } from 'better-sqlite3';
import { SyncQueueItem, SyncStatus } from '../../domain/entities/SyncQueue';
import { ISyncQueueRepository } from '../../domain/repositories/ISyncQueueRepository';

export class SqliteSyncQueueRepository implements ISyncQueueRepository {
    constructor(private db: Database) { }

    async push(item: SyncQueueItem): Promise<void> {
        const stmt = this.db.prepare(`
            INSERT INTO sync_queue (id, operationType, payload, sku, retryCount, status, errorMessage, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            item.id,
            item.operationType,
            item.payload,
            item.sku,
            item.retryCount,
            item.status,
            item.errorMessage || null,
            item.timestamp.getTime()
        );
    }

    async popPending(): Promise<SyncQueueItem | null> {
        const row = this.db.prepare(`
            SELECT * FROM sync_queue 
            WHERE status = 'PENDING' OR (status = 'FAILED' AND retryCount < 5)
            ORDER BY timestamp ASC LIMIT 1
        `).get() as any;

        if (!row) return null;

        return {
            ...row,
            timestamp: new Date(row.timestamp)
        } as SyncQueueItem;
    }

    async updateStatus(id: string, status: SyncStatus, errorMessage?: string): Promise<void> {
        const stmt = this.db.prepare(`
            UPDATE sync_queue SET status = ?, errorMessage = ? WHERE id = ?
        `);
        stmt.run(status, errorMessage || null, id);
    }

    async incrementRetry(id: string): Promise<void> {
        const stmt = this.db.prepare(`
            UPDATE sync_queue SET retryCount = retryCount + 1 WHERE id = ?
        `);
        stmt.run(id);
    }

    async getFailedItems(): Promise<SyncQueueItem[]> {
        const rows = this.db.prepare(`
            SELECT * FROM sync_queue WHERE status = 'FAILED' ORDER BY timestamp DESC
        `).all() as any[];

        return rows.map(row => ({
            ...row,
            timestamp: new Date(row.timestamp)
        }));
    }

    async getPendingCount(): Promise<number> {
        const result = this.db.prepare(`
            SELECT COUNT(*) as count FROM sync_queue 
            WHERE status = 'PENDING' OR (status = 'FAILED' AND retryCount < 5)
        `).get() as any;
        return result?.count || 0;
    }

    async clearCompleted(): Promise<void> {
        this.db.prepare(`DELETE FROM sync_queue WHERE status = 'COMPLETED'`).run();
    }
}

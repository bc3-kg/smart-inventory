/* file:///d:/smart-inventory/src/infrastructure/repositories/InMemorySyncQueueRepository.ts */
import { SyncQueueItem, SyncStatus } from '../../domain/entities/SyncQueue';
import { ISyncQueueRepository } from '../../domain/repositories/ISyncQueueRepository';

export class InMemorySyncQueueRepository implements ISyncQueueRepository {
    private queue: SyncQueueItem[] = [];

    constructor() {
        this.loadFromStorage();
    }

    private saveToStorage() {
        localStorage.setItem('inventory_sync_queue', JSON.stringify(this.queue));
    }

    private loadFromStorage() {
        const stored = localStorage.getItem('inventory_sync_queue');
        if (stored) {
            this.queue = JSON.parse(stored).map((item: any) => ({
                ...item,
                timestamp: new Date(item.timestamp)
            }));
        }
    }

    async push(item: SyncQueueItem): Promise<void> {
        this.queue.push(item);
        this.saveToStorage();
    }

    async popPending(): Promise<SyncQueueItem | null> {
        const item = this.queue.find(i => i.status === 'PENDING' || (i.status === 'FAILED' && i.retryCount < 5));
        return item || null;
    }

    async updateStatus(id: string, status: SyncStatus, errorMessage?: string): Promise<void> {
        const item = this.queue.find(i => i.id === id);
        if (item) {
            item.status = status;
            if (errorMessage) item.errorMessage = errorMessage;
            this.saveToStorage();
        }
    }

    async incrementRetry(id: string): Promise<void> {
        const item = this.queue.find(i => i.id === id);
        if (item) {
            item.retryCount++;
            this.saveToStorage();
        }
    }

    async getFailedItems(): Promise<SyncQueueItem[]> {
        return this.queue.filter(i => i.status === 'FAILED');
    }

    async getPendingCount(): Promise<number> {
        return this.queue.filter(i => i.status === 'PENDING' || (i.status === 'FAILED' && i.retryCount < 5)).length;
    }

    async clearCompleted(): Promise<void> {
        this.queue = this.queue.filter(i => i.status !== 'COMPLETED');
        this.saveToStorage();
    }
}

/* file:///d:/smart-inventory/src/domain/repositories/ISyncQueueRepository.ts */
import { SyncQueueItem } from '../entities/SyncQueue';

export interface ISyncQueueRepository {
    push(item: SyncQueueItem): Promise<void>;
    popPending(): Promise<SyncQueueItem | null>;
    updateStatus(id: string, status: SyncQueueItem['status'], errorMessage?: string): Promise<void>;
    incrementRetry(id: string): Promise<void>;
    getFailedItems(): Promise<SyncQueueItem[]>;
    getPendingCount(): Promise<number>;
    clearCompleted(): Promise<void>;
}

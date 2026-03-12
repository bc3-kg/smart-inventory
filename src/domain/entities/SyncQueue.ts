/* file:///d:/smart-inventory/src/domain/entities/SyncQueue.ts */

export type SyncOperationType = 
    | 'CREATE_PRODUCT' 
    | 'UPDATE_PRODUCT' 
    | 'STOCK_IN' 
    | 'STOCK_OUT' 
    | 'RETURN' 
    | 'CANCEL' 
    | 'STOCKTAKE';

export type SyncStatus = 'PENDING' | 'PROCESSING' | 'FAILED' | 'COMPLETED';

export interface SyncQueueItem {
    id: string;
    operationType: SyncOperationType;
    payload: string; // JSON string of the API body
    sku: string;
    retryCount: number;
    status: SyncStatus;
    errorMessage?: string;
    timestamp: Date;
}

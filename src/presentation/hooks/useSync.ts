import { useState, useEffect, useCallback, useRef } from 'react';
import { SyncQueueUseCase } from '../../application/usecases/SyncQueueUseCase';
import { InMemorySyncQueueRepository } from '../../infrastructure/repositories/InMemorySyncQueueRepository';
import { InMemoryCloudConfigRepository } from '../../infrastructure/repositories/InMemoryCloudConfigRepository';
import { InMemoryProductRepository } from '../../infrastructure/repositories/InMemoryProductRepository';
import { ZaicoSyncUploader } from '../../infrastructure/services/SyncUploader';

const syncRepo = new InMemorySyncQueueRepository();
const configRepo = new InMemoryCloudConfigRepository();
const productRepo = new InMemoryProductRepository();
const uploader = new ZaicoSyncUploader();
const syncQueueUseCase = new SyncQueueUseCase(syncRepo, configRepo, productRepo, uploader);

export const useSync = () => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    const updatePendingCount = useCallback(async () => {
        const count = await syncRepo.getPendingCount();
        setPendingCount(count);
    }, []);

    const processSync = useCallback(async () => {
        if (isSyncing) return;
        if (!navigator.onLine) {
            updatePendingCount();
            return;
        }

        setIsSyncing(true);
        try {
            await syncQueueUseCase.processAll();
        } catch (error) {
            console.error('Background sync failed:', error);
        } finally {
            setIsSyncing(false);
            updatePendingCount();
        }
    }, [isSyncing, updatePendingCount]);

    useEffect(() => {
        updatePendingCount();
        
        // Initial sync on mount
        processSync();

        // Set up interval for background sync
        const interval = setInterval(processSync, 30000); // Every 30 seconds

        // Listen for online status
        window.addEventListener('online', processSync);

        return () => {
            clearInterval(interval);
            window.removeEventListener('online', processSync);
        };
    }, [processSync, updatePendingCount]);

    const clearCompletedSyncs = useCallback(async () => {
        await syncRepo.clearCompleted();
        await updatePendingCount();
    }, [updatePendingCount]);

    return {
        isSyncing,
        pendingCount,
        triggerSync: processSync,
        refreshPendingCount: updatePendingCount,
        clearCompletedSyncs
    };
};

import { ISyncQueueRepository } from '../../domain/repositories/ISyncQueueRepository';
import { ICloudConfigRepository } from '../../domain/repositories/ICloudConfigRepository';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { ISyncUploader } from '../../infrastructure/services/SyncUploader';

export class SyncQueueUseCase {
    constructor(
        private syncRepo: ISyncQueueRepository,
        private cloudConfigRepo: ICloudConfigRepository,
        private productRepo: IProductRepository,
        private uploader: ISyncUploader
    ) { }

    async processNext(): Promise<boolean> {
        const config = await this.cloudConfigRepo.getConfig();
        if (!config.isEnabled || !config.apiToken) {
            return false;
        }

        const item = await this.syncRepo.popPending();
        if (!item) return false;

        await this.syncRepo.updateStatus(item.id, 'PROCESSING');

        try {
            let finalPayload = JSON.parse(item.payload);

            // Re-check and patch missing zaicoId for stock operations
            const stockOps = ['STOCK_IN', 'STOCK_OUT', 'RETURN', 'CANCEL', 'STOCKTAKE'];
            if (stockOps.includes(item.operationType) && item.sku) {
                const product = await this.productRepo.findBySku(item.sku);
                const zaicoId = product?.metadata?.zaicoId;

                if (zaicoId) {
                    if (item.operationType === 'STOCKTAKE') {
                        if (!finalPayload.zaico_id) finalPayload.zaico_id = zaicoId;
                    } else if (item.operationType === 'STOCK_IN' || item.operationType === 'RETURN') {
                        if (finalPayload.purchase_items?.[0] && !finalPayload.purchase_items[0].inventory_id) {
                            finalPayload.purchase_items[0].inventory_id = zaicoId;
                        }
                    } else if (item.operationType === 'STOCK_OUT' || item.operationType === 'CANCEL') {
                        if (finalPayload.deliveries?.[0] && !finalPayload.deliveries[0].inventory_id) {
                            finalPayload.deliveries[0].inventory_id = zaicoId;
                        }
                    }
                }
            }

            // SyncItem payload is immutable in DB, but we pass modified payload to uploader
            const responseData = await this.uploader.upload({ ...item, payload: JSON.stringify(finalPayload) }, config.apiToken);
            
            // If it was a product creation, save the zaico ID back to local metadata
            const zaicoId = responseData?.data_id || responseData?.id;
            if (item.operationType === 'CREATE_PRODUCT' && zaicoId && item.sku) {
                const product = await this.productRepo.findBySku(item.sku);
                if (product) {
                    product.metadata.zaicoId = zaicoId;
                    await this.productRepo.update(product);
                }
            }

            await this.syncRepo.updateStatus(item.id, 'COMPLETED');
            
            // Update last synced time
            await this.cloudConfigRepo.updateConfig({
                ...config,
                lastSyncedAt: new Date()
            });
            return true;
        } catch (error: any) {
            console.error(`Sync failed for item ${item.id}:`, error);
            await this.syncRepo.incrementRetry(item.id);
            await this.syncRepo.updateStatus(item.id, 'FAILED', error.message);
            return false;
        }
    }

    async processAll(): Promise<void> {
        let hasMore = true;
        while (hasMore) {
            hasMore = await this.processNext();
        }
    }
}

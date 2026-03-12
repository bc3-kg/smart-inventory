import { StockMovement, MovementStatus } from '../../domain/entities/Product';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { ISyncQueueRepository } from '../../domain/repositories/ISyncQueueRepository';
import { ICloudConfigRepository } from '../../domain/repositories/ICloudConfigRepository';
import { SyncQueueItem, SyncOperationType } from '../../domain/entities/SyncQueue';

export class UpdateStockUseCase {
    constructor(
        private productRepository: IProductRepository,
        private syncRepo: ISyncQueueRepository,
        private cloudConfigRepo: ICloudConfigRepository
    ) { }

    async execute(params: {
        productId: string;
        statusId: string;
        quantity: number;
        unitPrice: number;
        reason: string;
        productData?: {
            name: string;
            unit: string;
            minStock: number;
            metadata: Record<string, any>;
        };
    }): Promise<void> {
        const product = await this.productRepository.findById(params.productId);
        if (!product) {
            throw new Error('Product not found');
        }

        const statuses = await this.productRepository.getMovementStatuses();
        const status = statuses.find(s => s.id === params.statusId);
        
        if (!status) {
            throw new Error('Invalid movement status');
        }

        let newStock = product.stock;
        let operationType: SyncOperationType | null = null;
        let syncQuantity = params.quantity;
        
        // Define operation type based on status action and name
        switch (status.action) {
            case 'ADD':
                newStock += params.quantity;
                operationType = status.id === 'RET' ? 'RETURN' : 'STOCK_IN';
                if (operationType === 'RETURN') syncQuantity = -params.quantity;
                break;
            case 'SUBTRACT':
                newStock -= params.quantity;
                operationType = status.id === 'CANCEL' ? 'CANCEL' : 'STOCK_OUT';
                if (operationType === 'CANCEL') syncQuantity = -params.quantity;
                break;
            case 'SET':
                newStock = params.quantity;
                operationType = 'STOCKTAKE';
                break;
        }

        if (newStock < 0) {
            throw new Error('Stock cannot be negative');
        }

        const now = new Date();
        const updatedProduct: any = {
            ...product,
            ...(params.productData || {}),
            metadata: {
                ...(product.metadata || {}),
                ...(params.productData?.metadata || {})
            },
            stock: newStock,
            price: params.unitPrice,
            updatedAt: now
        };

        await this.productRepository.update(updatedProduct);

        const movement: StockMovement = {
            id: crypto.randomUUID(),
            productId: params.productId,
            statusId: params.statusId,
            quantity: params.quantity,
            unitPrice: params.unitPrice,
            totalAmount: params.unitPrice * params.quantity,
            reason: params.reason,
            timestamp: now
        };

        await this.productRepository.addMovement(movement);

        // Cloud Sync Logic
        const config = await this.cloudConfigRepo.getConfig();
        if (config.isEnabled && operationType) {
            const payload: any = {};
            
            // Note: In a real implementation, we'd need a mapping of local ID to Zaico ID.
            // For this specification, we assume this mapping exists in metadata or code.
            const zaicoId = product.metadata.zaicoId || ''; 
            
            if (operationType === 'STOCKTAKE') {
                payload.zaico_id = zaicoId;
                payload.quantity = newStock;
                payload.stocktake_attributes = { checked_at: now.toISOString() };
            } else if (operationType === 'STOCK_IN' || operationType === 'RETURN') {
                payload.status = 'purchased';
                payload.purchase_date = now.toISOString().split('T')[0];
                payload.purchase_items = [{
                    inventory_id: zaicoId,
                    quantity: syncQuantity,
                    unit_price: params.unitPrice,
                    etc: params.reason
                }];
            } else { // STOCK_OUT or CANCEL
                payload.status = 'completed_delivery';
                payload.delivery_date = now.toISOString().split('T')[0];
                payload.deliveries = [{
                    inventory_id: zaicoId,
                    quantity: syncQuantity,
                    unit_price: params.unitPrice,
                    etc: params.reason
                }];
            }

            const syncItem: SyncQueueItem = {
                id: crypto.randomUUID(),
                operationType,
                payload: JSON.stringify(payload),
                sku: product.sku,
                retryCount: 0,
                status: 'PENDING',
                timestamp: now
            };
            await this.syncRepo.push(syncItem);
        }
    }
}

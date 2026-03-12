import { Product } from '../../domain/entities/Product';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { ISyncQueueRepository } from '../../domain/repositories/ISyncQueueRepository';
import { ICloudConfigRepository } from '../../domain/repositories/ICloudConfigRepository';
import { SyncQueueItem } from '../../domain/entities/SyncQueue';

export class AddProductUseCase {
    constructor(
        private productRepository: IProductRepository,
        private syncRepo: ISyncQueueRepository,
        private cloudConfigRepo: ICloudConfigRepository
    ) { }

    async execute(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
        // Check if SKU already exists
        const existing = await this.productRepository.findBySku(productData.sku);
        if (existing) {
            throw new Error(`Product with SKU ${productData.sku} already exists.`);
        }

        const now = new Date();
        const product: Product = {
            ...productData,
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
        };

        await this.productRepository.save(product);

        // Cloud Sync Logic
        const config = await this.cloudConfigRepo.getConfig();
        if (config.isEnabled) {
            // Map metadata to optional_attributes
            const fixedKeys = ['category', 'location', 'condition', 'notes'];
            const optionalAttrs = Object.entries(product.metadata)
                .filter(([key]) => !fixedKeys.includes(key))
                .map(([name, value]) => ({ name, value: String(value) }));

            const payload = {
                title: product.name,
                code: product.sku,
                unit: product.unit,
                category: product.metadata.category || '',
                place: product.metadata.location || '',
                state: product.metadata.condition || '',
                etc: product.metadata.notes || '',
                optional_attributes: optionalAttrs
            };

            const syncItem: SyncQueueItem = {
                id: crypto.randomUUID(),
                operationType: 'CREATE_PRODUCT',
                payload: JSON.stringify(payload),
                sku: product.sku,
                retryCount: 0,
                status: 'PENDING',
                timestamp: now
            };
            await this.syncRepo.push(syncItem);
        }

        return product;
    }
}

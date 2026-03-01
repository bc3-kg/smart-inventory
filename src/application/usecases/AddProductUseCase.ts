/* file:///d:/workspace/inventory-app/src/application/usecases/AddProductUseCase.ts */
import { Product } from '../../domain/entities/Product';
import { IProductRepository } from '../../domain/repositories/IProductRepository';

export class AddProductUseCase {
    constructor(private productRepository: IProductRepository) { }

    async execute(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
        // SOLID: Single Responsibility Principle - Use cases define individual business rules

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
        return product;
    }
}

/* file:///d:/workspace/inventory-app/src/domain/repositories/IProductRepository.ts */
import { Product, StockMovement } from '../entities/Product';

export interface IProductRepository {
    findAll(): Promise<Product[]>;
    findById(id: string): Promise<Product | null>;
    findBySku(sku: string): Promise<Product | null>;
    save(product: Product): Promise<void>;
    update(product: Product): Promise<void>;
    delete(id: string): Promise<void>;

    addMovement(movement: StockMovement): Promise<void>;
    getMovements(productId: string): Promise<StockMovement[]>;
}

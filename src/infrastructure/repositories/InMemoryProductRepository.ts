/* file:///d:/workspace/inventory-app/src/infrastructure/repositories/InMemoryProductRepository.ts */
import { Product, StockMovement } from '../../domain/entities/Product';
import { IProductRepository } from '../../domain/repositories/IProductRepository';

export class InMemoryProductRepository implements IProductRepository {
    private products: Product[] = [];
    private movements: StockMovement[] = [];

    constructor() {
        this.seed();
    }

    private seed() {
        const now = new Date();
        this.products = [
            { id: '1', sku: 'IPH-15PRO', name: 'iPhone 15 Pro Max', category: 'Smartphone', price: 1199, stock: 45, unit: 'un', minStock: 5, createdAt: now, updatedAt: now },
            { id: '2', sku: 'MBA-M3', name: 'MacBook Air M3', category: 'Laptop', price: 1299, stock: 12, unit: 'un', minStock: 3, createdAt: now, updatedAt: now },
            { id: '3', sku: 'AWU-2', name: 'Apple Watch Ultra', category: 'Watch', price: 799, stock: 20, unit: 'un', minStock: 5, createdAt: now, updatedAt: now },
            { id: '4', sku: 'AP-PRO-2', name: 'AirPods Pro 2', category: 'Audio', price: 249, stock: 8, unit: 'un', minStock: 10, createdAt: now, updatedAt: now },
        ];
    }

    async findAll(): Promise<Product[]> {
        return [...this.products].sort((a, b) => a.stock - b.stock);
    }

    async findById(id: string): Promise<Product | null> {
        return this.products.find(p => p.id === id) || null;
    }

    async findBySku(sku: string): Promise<Product | null> {
        return this.products.find(p => p.sku === sku) || null;
    }

    async save(product: Product): Promise<void> {
        this.products.push(product);
    }

    async update(product: Product): Promise<void> {
        const index = this.products.findIndex(p => p.id === product.id);
        if (index !== -1) {
            this.products[index] = { ...product, updatedAt: new Date() };
        }
    }

    async delete(id: string): Promise<void> {
        this.products = this.products.filter(p => p.id !== id);
    }

    async addMovement(movement: StockMovement): Promise<void> {
        this.movements.push(movement);
    }

    async getMovements(productId: string): Promise<StockMovement[]> {
        return this.movements.filter(m => m.productId === productId).reverse();
    }
}

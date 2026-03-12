/* file:///d:/workspace/inventory-app/src/infrastructure/repositories/InMemoryProductRepository.ts */
import { Product, StockMovement, MovementStatus } from '../../domain/entities/Product';
import { IProductRepository } from '../../domain/repositories/IProductRepository';

export class InMemoryProductRepository implements IProductRepository {
    private products: Product[] = [];
    private movements: StockMovement[] = [];

    constructor() {
        this.loadFromStorage();
        if (this.products.length === 0) {
            this.seed();
            this.saveToStorage();
        }
    }

    private saveToStorage() {
        localStorage.setItem('inventory_products', JSON.stringify(this.products));
        localStorage.setItem('inventory_movements', JSON.stringify(this.movements));
        localStorage.setItem('inventory_statuses', JSON.stringify(this.movementStatuses));
    }

    private loadFromStorage() {
        const p = localStorage.getItem('inventory_products');
        const m = localStorage.getItem('inventory_movements');
        const s = localStorage.getItem('inventory_statuses');
        
        if (p) this.products = JSON.parse(p).map((prod: any) => ({ ...prod, createdAt: new Date(prod.createdAt), updatedAt: new Date(prod.updatedAt) }));
        if (m) this.movements = JSON.parse(m).map((mov: any) => ({ ...mov, timestamp: new Date(mov.timestamp) }));
        if (s) this.movementStatuses = JSON.parse(s);
    }

    private seed() {
        const now = new Date();
        this.products = [
            { id: '1', sku: 'IPH-15PRO', name: 'iPhone 15 Pro Max', price: 1199, stock: 45, unit: 'un', minStock: 5, metadata: { category: 'Smartphone', location: 'Warehouse A', condition: 'New', notes: '' }, createdAt: now, updatedAt: now },
            { id: '2', sku: 'MBA-M3', name: 'MacBook Air M3', price: 1299, stock: 12, unit: 'un', minStock: 3, metadata: { category: 'Laptop', location: 'Warehouse B', condition: 'Used', notes: '' }, createdAt: now, updatedAt: now },
            { id: '3', sku: 'AWU-2', name: 'Apple Watch Ultra', price: 799, stock: 20, unit: 'un', minStock: 5, metadata: { category: 'Watch', location: 'Warehouse A', condition: 'New', notes: '' }, createdAt: now, updatedAt: now },
            { id: '4', sku: 'AP-PRO-2', name: 'AirPods Pro 2', price: 249, stock: 8, unit: 'un', minStock: 10, metadata: { category: 'Audio', location: 'Warehouse C', condition: 'Refurbished', notes: '' }, createdAt: now, updatedAt: now },
        ];
    }

    private movementStatuses: MovementStatus[] = [
        { id: '1', name: '入庫', action: 'ADD', color: 'success' },
        { id: '2', name: '出庫', action: 'SUBTRACT', color: 'secondary' },
        { id: '3', name: '返品', action: 'SUBTRACT', color: 'primary' },
        { id: '4', name: 'キャンセル', action: 'ADD', color: 'error' },
        { id: '5', name: '棚卸', action: 'SET', color: 'warning' },
    ];

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
        this.saveToStorage();
    }

    async update(product: Product): Promise<void> {
        const index = this.products.findIndex(p => p.id === product.id);
        if (index !== -1) {
            this.products[index] = { ...product, updatedAt: new Date() };
        }
        this.saveToStorage();
    }

    async delete(id: string): Promise<void> {
        this.products = this.products.filter(p => p.id !== id);
        this.saveToStorage();
    }

    async addMovement(movement: StockMovement): Promise<void> {
        this.movements.push(movement);
        this.saveToStorage();
    }

    async getMovements(productId: string): Promise<StockMovement[]> {
        return this.movements.filter(m => m.productId === productId).reverse();
    }

    async getAllMovements(): Promise<StockMovement[]> {
        return [...this.movements].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    async getMovementStatuses(): Promise<MovementStatus[]> {
        return [...this.movementStatuses];
    }

    async saveMovementStatus(status: MovementStatus): Promise<void> {
        const index = this.movementStatuses.findIndex(s => s.id === status.id);
        if (index !== -1) {
            this.movementStatuses[index] = status;
        } else {
            this.movementStatuses.push(status);
        }
        this.saveToStorage();
    }

    async deleteMovementStatus(id: string): Promise<void> {
        this.movementStatuses = this.movementStatuses.filter(s => s.id !== id);
        this.saveToStorage();
    }
}

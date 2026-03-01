/* file:///d:/workspace/inventory-app/src/infrastructure/repositories/SqliteProductRepository.ts */
import { Product, StockMovement } from '../../domain/entities/Product';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { Database } from 'better-sqlite3';

export class SqliteProductRepository implements IProductRepository {
    constructor(private db: Database) { }

    private mapProduct(row: any): Product {
        return {
            id: row.id,
            sku: row.sku,
            name: row.name,
            category: row.category,
            price: row.price,
            stock: row.stock,
            unit: row.unit,
            minStock: row.minStock,
            imageUrl: row.imageUrl || undefined,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
        };
    }

    async findAll(): Promise<Product[]> {
        const rows = this.db.prepare('SELECT * FROM products ORDER BY stock ASC').all();
        return rows.map((row: any) => this.mapProduct(row));
    }

    async findBySku(sku: string): Promise<Product | null> {
        const row = this.db.prepare('SELECT * FROM products WHERE sku = ?').get(sku);
        return row ? this.mapProduct(row) : null;
    }

    async findById(id: string): Promise<Product | null> {
        const row = this.db.prepare('SELECT * FROM products WHERE id = ?').get(id);
        return row ? this.mapProduct(row) : null;
    }

    async save(product: Product): Promise<void> {
        const stmt = this.db.prepare(`
      INSERT INTO products (id, sku, name, category, price, stock, unit, minStock, imageUrl, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            product.id,
            product.sku,
            product.name,
            product.category,
            product.price,
            product.stock,
            product.unit,
            product.minStock,
            product.imageUrl || null,
            product.createdAt.getTime(),
            product.updatedAt.getTime()
        );
    }

    async update(product: Product): Promise<void> {
        const stmt = this.db.prepare(`
      UPDATE products 
      SET sku = ?, name = ?, category = ?, price = ?, stock = ?, unit = ?, minStock = ?, imageUrl = ?, updatedAt = ?
      WHERE id = ?
    `);

        stmt.run(
            product.sku,
            product.name,
            product.category,
            product.price,
            product.stock,
            product.unit,
            product.minStock,
            product.imageUrl || null,
            new Date().getTime(),
            product.id
        );
    }

    async delete(id: string): Promise<void> {
        this.db.prepare('DELETE FROM products WHERE id = ?').run(id);
    }

    async addMovement(movement: StockMovement): Promise<void> {
        const stmt = this.db.prepare(`
      INSERT INTO movements (id, productId, type, quantity, reason, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            movement.id,
            movement.productId,
            movement.type,
            movement.quantity,
            movement.reason,
            movement.timestamp.getTime()
        );
    }

    async getMovements(productId: string): Promise<StockMovement[]> {
        const rows = this.db.prepare('SELECT * FROM movements WHERE productId = ? ORDER BY timestamp DESC').all() as any[];
        return rows.map(row => ({
            id: row.id,
            productId: row.productId,
            type: row.type as 'IN' | 'OUT',
            quantity: row.quantity,
            reason: row.reason,
            timestamp: new Date(row.timestamp)
        }));
    }
}

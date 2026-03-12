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
            price: row.price,
            stock: row.stock,
            unit: row.unit,
            minStock: row.minStock,
            metadata: row.metadata ? JSON.parse(row.metadata) : {},
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
      INSERT INTO products (id, sku, name, price, stock, unit, minStock, metadata, imageUrl, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            product.id,
            product.sku,
            product.name,
            product.price,
            product.stock,
            product.unit,
            product.minStock,
            JSON.stringify(product.metadata),
            product.imageUrl || null,
            product.createdAt.getTime(),
            product.updatedAt.getTime()
        );
    }

    async update(product: Product): Promise<void> {
        const stmt = this.db.prepare(`
      UPDATE products 
      SET sku = ?, name = ?, price = ?, stock = ?, unit = ?, minStock = ?, metadata = ?, imageUrl = ?, updatedAt = ?
      WHERE id = ?
    `);

        stmt.run(
            product.sku,
            product.name,
            product.price,
            product.stock,
            product.unit,
            product.minStock,
            JSON.stringify(product.metadata),
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
      INSERT INTO movements (id, productId, statusId, quantity, unitPrice, totalAmount, reason, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            movement.id,
            movement.productId,
            movement.statusId,
            movement.quantity,
            movement.unitPrice,
            movement.totalAmount,
            movement.reason,
            movement.timestamp.getTime()
        );
    }

    async getMovements(productId: string): Promise<StockMovement[]> {
        const rows = this.db.prepare('SELECT * FROM movements WHERE productId = ? ORDER BY timestamp DESC').all() as any[];
        return rows.map(row => ({
            id: row.id,
            productId: row.productId,
            statusId: row.statusId,
            quantity: row.quantity,
            unitPrice: row.unitPrice || 0,
            totalAmount: row.totalAmount || 0,
            reason: row.reason,
            timestamp: new Date(row.timestamp)
        }));
    }

    async getAllMovements(): Promise<StockMovement[]> {
        const rows = this.db.prepare('SELECT * FROM movements ORDER BY timestamp DESC').all() as any[];
        return rows.map(row => ({
            id: row.id,
            productId: row.productId,
            statusId: row.statusId,
            quantity: row.quantity,
            unitPrice: row.unitPrice || 0,
            totalAmount: row.totalAmount || 0,
            reason: row.reason,
            timestamp: new Date(row.timestamp)
        }));
    }

    async getMovementStatuses(): Promise<any[]> {
        const rows = this.db.prepare('SELECT * FROM movement_statuses').all();
        return rows;
    }

    async saveMovementStatus(status: any): Promise<void> {
        const stmt = this.db.prepare(`
            INSERT INTO movement_statuses (id, name, action, color)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET name=excluded.name, action=excluded.action, color=excluded.color
        `);
        stmt.run(status.id, status.name, status.action, status.color);
    }

    async deleteMovementStatus(id: string): Promise<void> {
        this.db.prepare('DELETE FROM movement_statuses WHERE id = ?').run(id);
    }
}

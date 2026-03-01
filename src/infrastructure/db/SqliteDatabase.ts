/* file:///d:/workspace/inventory-app/src/infrastructure/db/SqliteDatabase.ts */
import Database from 'better-sqlite3';

export class SqliteDatabase {
  private static instance: Database.Database;

  public static getInstance(): Database.Database {
    if (!SqliteDatabase.instance) {
      // Initialize with a file-based DB or :memory: for testing
      SqliteDatabase.instance = new Database('inventory.db');
      SqliteDatabase.initSchema();
    }
    return SqliteDatabase.instance;
  }

  private static initSchema() {
    const db = SqliteDatabase.instance;

    db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        sku TEXT UNIQUE,
        name TEXT,
        category TEXT,
        price REAL,
        stock INTEGER,
        unit TEXT,
        minStock INTEGER,
        imageUrl TEXT,
        createdAt INTEGER,
        updatedAt INTEGER
      );

      CREATE TABLE IF NOT EXISTS movements (
        id TEXT PRIMARY KEY,
        productId TEXT,
        type TEXT,
        quantity INTEGER,
        reason TEXT,
        timestamp INTEGER,
        FOREIGN KEY(productId) REFERENCES products(id)
      );
    `);

    // Seed mock data if empty
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as any;
    if (productCount.count === 0) {
      this.seedData(db);
    }
  }

  private static seedData(db: Database.Database) {
    const products = [
      { id: '1', sku: 'IPH-15PRO', name: 'iPhone 15 Pro Max', category: 'Smartphone', price: 1199, stock: 45, unit: 'un', minStock: 5 },
      { id: '2', sku: 'MBA-M3', name: 'MacBook Air M3', category: 'Laptop', price: 1299, stock: 12, unit: 'un', minStock: 3 },
      { id: '3', sku: 'AWU-2', name: 'Apple Watch Ultra', category: 'Watch', price: 799, stock: 20, unit: 'un', minStock: 5 },
      { id: '4', sku: 'AP-PRO-2', name: 'AirPods Pro 2', category: 'Audio', price: 249, stock: 8, unit: 'un', minStock: 10 }, // Low stock!
    ];

    const insert = db.prepare(`
      INSERT INTO products (id, sku, name, category, price, stock, unit, minStock, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().getTime();
    for (const p of products) {
      insert.run(p.id, p.sku, p.name, p.category, p.price, p.stock, p.unit, p.minStock, now, now);
    }
  }
}

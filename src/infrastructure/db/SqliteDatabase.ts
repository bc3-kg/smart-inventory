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
        price REAL,
        stock INTEGER,
        unit TEXT,
        minStock INTEGER,
        metadata TEXT, -- JSON structure
        imageUrl TEXT,
        createdAt INTEGER,
        updatedAt INTEGER
      );

      CREATE TABLE IF NOT EXISTS movements (
        id TEXT PRIMARY KEY,
        productId TEXT,
        statusId TEXT,
        quantity REAL,
        unitPrice REAL,
        totalAmount REAL,
        reason TEXT,
        timestamp INTEGER,
        FOREIGN KEY(productId) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS movement_statuses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        action TEXT CHECK(action IN ('ADD', 'SUBTRACT', 'SET')) NOT NULL,
        color TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        operationType TEXT NOT NULL,
        payload TEXT NOT NULL, -- JSON body
        sku TEXT NOT NULL,
        retryCount INTEGER DEFAULT 0,
        status TEXT NOT NULL, -- PENDING, PROCESSING, FAILED, COMPLETED
        errorMessage TEXT,
        timestamp INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cloud_config (
        id INTEGER PRIMARY KEY CHECK (id = 1), -- Single row
        isEnabled INTEGER NOT NULL DEFAULT 0, -- 0: false, 1: true
        apiToken TEXT,
        lastSyncedAt INTEGER
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
      INSERT INTO products (id, sku, name, price, stock, unit, minStock, metadata, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().getTime();
    for (const p of products) {
      const metadata = JSON.stringify({ category: (p as any).category });
      insert.run(p.id, p.sku, p.name, p.price, p.stock, p.unit, p.minStock, metadata, now, now);
    }
  }
}

/* file:///d:/workspace/inventory-app/src/domain/entities/Product.ts */

export interface Product {
    id: string;
    sku: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    unit: string;
    minStock: number;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface StockMovement {
    id: string;
    productId: string;
    type: 'IN' | 'OUT';
    quantity: number;
    reason: string;
    timestamp: Date;
}

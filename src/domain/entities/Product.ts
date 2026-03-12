/* file:///d:/workspace/inventory-app/src/domain/entities/Product.ts */

export interface Product {
    id: string;
    sku: string;
    name: string;
    price: number;
    stock: number;
    unit: string;
    minStock: number;
    metadata: Record<string, any>; // Stores Category, Location, Condition, Notes, etc.
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface MovementStatus {
    id: string;
    name: string;
    action: 'ADD' | 'SUBTRACT' | 'SET';
    color: string;
}

export interface StockMovement {
    id: string;
    productId: string;
    statusId: string; // ID of the MovementStatus used
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    reason: string;
    timestamp: Date;
}


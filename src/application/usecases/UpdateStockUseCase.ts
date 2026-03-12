/* file:///d:/workspace/inventory-app/src/application/usecases/UpdateStockUseCase.ts */
import { StockMovement, MovementStatus } from '../../domain/entities/Product';
import { IProductRepository } from '../../domain/repositories/IProductRepository';

export class UpdateStockUseCase {
    constructor(private productRepository: IProductRepository) { }

    async execute(params: {
        productId: string;
        statusId: string;
        quantity: number;
        unitPrice: number;
        reason: string;
        productData?: {
            name: string;
            unit: string;
            minStock: number;
            metadata: Record<string, any>;
        };
    }): Promise<void> {
        const product = await this.productRepository.findById(params.productId);
        if (!product) {
            throw new Error('Product not found');
        }

        const statuses = await this.productRepository.getMovementStatuses();
        const status = statuses.find(s => s.id === params.statusId);
        
        if (!status) {
            throw new Error('Invalid movement status');
        }

        let newStock = product.stock;
        
        // Dynamic Logic Based on Status Action
        switch (status.action) {
            case 'ADD':
                newStock += params.quantity;
                break;
            case 'SUBTRACT':
                newStock -= params.quantity;
                break;
            case 'SET':
                newStock = params.quantity; // Shelf inventory/adjustment
                break;
        }

        if (newStock < 0) {
            throw new Error('Stock cannot be negative');
        }

        const updatedProduct: any = {
            ...product,
            ...(params.productData || {}),
            metadata: {
                ...(product.metadata || {}),
                ...(params.productData?.metadata || {})
            },
            stock: newStock,
            price: params.unitPrice, // Update product price as well
            updatedAt: new Date()
        };

        await this.productRepository.update(updatedProduct);

        const movement: StockMovement = {
            id: crypto.randomUUID(),
            productId: params.productId,
            statusId: params.statusId,
            quantity: params.quantity,
            unitPrice: params.unitPrice,
            totalAmount: params.unitPrice * params.quantity,
            reason: params.reason,
            timestamp: new Date()
        };

        await this.productRepository.addMovement(movement);
    }
}

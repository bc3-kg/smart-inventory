/* file:///d:/workspace/inventory-app/src/application/usecases/UpdateStockUseCase.test.ts */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateStockUseCase } from './UpdateStockUseCase';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { Product, MovementStatus } from '../../domain/entities/Product';

describe('UpdateStockUseCase', () => {
    let repository: IProductRepository;
    let useCase: UpdateStockUseCase;

    const mockProduct: Product = {
        id: 'prod-1',
        sku: 'SKU-1',
        name: 'Test Product',
        category: 'Test',
        price: 100,
        stock: 50,
        unit: 'un',
        minStock: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockStatuses: MovementStatus[] = [
        { id: '1', name: '入庫', action: 'ADD', color: 'success' },
        { id: '2', name: '出庫', action: 'SUBTRACT', color: 'secondary' },
        { id: '3', name: '返品', action: 'SUBTRACT', color: 'primary' },
        { id: '4', name: 'キャンセル', action: 'ADD', color: 'error' },
        { id: '5', name: '棚卸', action: 'SET', color: 'warning' },
    ];

    beforeEach(() => {
        repository = {
            findById: vi.fn().mockResolvedValue(mockProduct),
            getMovementStatuses: vi.fn().mockResolvedValue(mockStatuses),
            update: vi.fn().mockResolvedValue(undefined),
            addMovement: vi.fn().mockResolvedValue(undefined),
        } as unknown as IProductRepository;

        useCase = new UpdateStockUseCase(repository);
    });

    it('should add stock when status action is ADD (入庫)', async () => {
        await useCase.execute({
            productId: 'prod-1',
            statusId: '1', // 入庫
            quantity: 10,
            reason: 'Test addition',
        });

        expect(repository.update).toHaveBeenCalledWith(expect.objectContaining({
            stock: 60, // 50 + 10
        }));
    });

    it('should subtract stock when status action is SUBTRACT (出庫)', async () => {
        await useCase.execute({
            productId: 'prod-1',
            statusId: '2', // 出庫
            quantity: 10,
            reason: 'Test subtraction',
        });

        expect(repository.update).toHaveBeenCalledWith(expect.objectContaining({
            stock: 40, // 50 - 10
        }));
    });

    it('should subtract stock when status action is SUBTRACT (返品)', async () => {
        await useCase.execute({
            productId: 'prod-1',
            statusId: '3', // 返品
            quantity: 5,
            reason: 'Test return subtracts stock',
        });

        expect(repository.update).toHaveBeenCalledWith(expect.objectContaining({
            stock: 45, // 50 - 5
        }));
    });

    it('should add stock when status action is ADD (キャンセル)', async () => {
        await useCase.execute({
            productId: 'prod-1',
            statusId: '4', // キャンセル
            quantity: 5,
            reason: 'Test cancel adds stock',
        });

        expect(repository.update).toHaveBeenCalledWith(expect.objectContaining({
            stock: 55, // 50 + 5
        }));
    });

    it('should set stock when status action is SET (棚卸)', async () => {
        await useCase.execute({
            productId: 'prod-1',
            statusId: '5', // 棚卸
            quantity: 100,
            reason: 'Test adjustment',
        });

        expect(repository.update).toHaveBeenCalledWith(expect.objectContaining({
            stock: 100, // Fixed to 100
        }));
    });

    it('should throw error when stock becomes negative', async () => {
        await expect(useCase.execute({
            productId: 'prod-1',
            statusId: '2', // 出庫
            quantity: 60, // 50 - 60 = -10
            reason: 'Test negative',
        })).rejects.toThrow('Stock cannot be negative');
    });

    it('should throw error when product is not found', async () => {
        vi.mocked(repository.findById).mockResolvedValue(null);

        await expect(useCase.execute({
            productId: 'invalid',
            statusId: '1',
            quantity: 10,
            reason: 'Test not found',
        })).rejects.toThrow('Product not found');
    });

    it('should throw error when status is invalid', async () => {
        await expect(useCase.execute({
            productId: 'prod-1',
            statusId: '99', // Invalid
            quantity: 10,
            reason: 'Test invalid status',
        })).rejects.toThrow('Invalid movement status');
    });
});

/* file:///d:/workspace/inventory-app/src/presentation/hooks/useInventory.ts */
import { useState, useEffect, useCallback } from 'react';
import { Product } from '../../domain/entities/Product';
import { ListProductsUseCase } from '../../application/usecases/ListProductsUseCase';
import { AddProductUseCase } from '../../application/usecases/AddProductUseCase';
import { UpdateStockUseCase } from '../../application/usecases/UpdateStockUseCase';
import { InMemoryProductRepository } from '../../infrastructure/repositories/InMemoryProductRepository';

const productRepository = new InMemoryProductRepository();
const listProductsUseCase = new ListProductsUseCase(productRepository);
const addProductUseCase = new AddProductUseCase(productRepository);
const updateStockUseCase = new UpdateStockUseCase(productRepository);


export const useInventory = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [statuses, setStatuses] = useState<any[]>([]);
    const [movements, setMovements] = useState<any[]>([]);

    const fetchProducts = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await listProductsUseCase.execute();
            const statusData = await productRepository.getMovementStatuses();
            const movementData = await productRepository.getAllMovements();
            setProducts(data);
            setStatuses(statusData);
            setMovements(movementData);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Error fetching products');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addProduct = async (productData: any) => {
        try {
            await addProductUseCase.execute(productData);
            await fetchProducts();
        } catch (err: any) {
            setError(err.message || 'Error adding product');
            throw err;
        }
    };

    const updateStock = async (params: any) => {
        try {
            await updateStockUseCase.execute(params);
            await fetchProducts();
        } catch (err: any) {
            setError(err.message || 'Error updating stock');
            throw err;
        }
    };

    const updateStatus = async (status: any) => {
        try {
            await productRepository.saveMovementStatus(status);
            await fetchProducts();
        } catch (err: any) {
            setError(err.message || 'Error updating status');
            throw err;
        }
    };

    const deleteStatus = async (id: string) => {
        try {
            await productRepository.deleteMovementStatus(id);
            await fetchProducts();
        } catch (err: any) {
            setError(err.message || 'Error deleting status');
            throw err;
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return {
        products,
        statuses,
        movements,
        isLoading,
        error,
        refresh: fetchProducts,
        addProduct,
        updateStock,
        updateStatus,
        deleteStatus,
    };
};

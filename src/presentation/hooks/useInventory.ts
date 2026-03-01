/* file:///d:/workspace/inventory-app/src/presentation/hooks/useInventory.ts */
import { useState, useEffect, useCallback } from 'react';
import { Product } from '../../domain/entities/Product';
import { ListProductsUseCase } from '../../application/usecases/ListProductsUseCase';
import { AddProductUseCase } from '../../application/usecases/AddProductUseCase';
import { InMemoryProductRepository } from '../../infrastructure/repositories/InMemoryProductRepository';

// SOLID: Dependency Inversion - UI depends on interface, Repo can be swapped
// Note: SqliteProductRepository requires a Node.js environment.
const productRepository = new InMemoryProductRepository();
const listProductsUseCase = new ListProductsUseCase(productRepository);
const addProductUseCase = new AddProductUseCase(productRepository);

export const useInventory = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await listProductsUseCase.execute();
            setProducts(data);
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

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return {
        products,
        isLoading,
        error,
        refresh: fetchProducts,
        addProduct,
    };
};

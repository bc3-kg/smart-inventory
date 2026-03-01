/* file:///d:/workspace/inventory-app/src/application/usecases/ListProductsUseCase.ts */
import { Product } from '../../domain/entities/Product';
import { IProductRepository } from '../../domain/repositories/IProductRepository';

export class ListProductsUseCase {
    constructor(private productRepository: IProductRepository) { }

    async execute(): Promise<Product[]> {
        return this.productRepository.findAll();
    }
}

/* file:///d:/workspace/inventory-app/src/presentation/components/ProductList.tsx */
import React from 'react';
import { Package, Search, AlertCircle, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Product } from '../../domain/entities/Product';

interface ProductListProps {
    products: Product[];
    isLoading: boolean;
}

const ProductList: React.FC<ProductListProps> = ({ products, isLoading }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8" id="inventory-list">
            <header className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-4xl font-bold tracking-tight text-text whitespace-nowrap">{t('inventory_title')}</h2>
                    <button className="p-3 rounded-2xl bg-surface border border-black/5 dark:border-white/5 text-text-dim hover:text-text transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 shadow-sm">
                        <Filter size={24} />
                    </button>
                </div>

                <div className="relative group w-full lg:max-w-2xl">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-dim/60 group-focus-within:text-primary transition-all duration-300" size={20} />
                    <input
                        type="text"
                        placeholder={t('search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-surface border border-black/5 dark:border-white/5 rounded-[24px] py-4 pl-14 pr-6 text-text outline-none focus:ring-4 focus:ring-primary/10 dark:focus:ring-primary/5 transition-all text-lg shadow-sm"
                    />
                </div>
            </header>

            {isLoading ? (
                <div className="py-40 flex justify-center">
                    <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-primary" />
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="py-40 text-center flex flex-col items-center gap-6 grayscale opacity-30">
                    <Package size={80} className="stroke-[1.5]" />
                    <p className="text-xl font-medium">{t('no_products')}</p>
                </div>
            ) : (
                /* Dynamic Product Grid: 1 col mobile, 2 sm, 3 lg, 4 xl */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product, idx) => (
                        <ProductCard key={product.id} product={product} delay={idx * 0.05} />
                    ))}
                </div>
            )}
        </div>
    );
};

const ProductCard = ({ product, delay }: { product: Product, delay: number }) => {
    const isLowStock = product.stock <= product.minStock;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="card-premium flex flex-col gap-6 group cursor-pointer border-black/5 dark:border-white/5 hover:border-primary/40 transition-all p-7"
        >
            <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500 ${isLowStock ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                    <Package size={28} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-text font-black truncate text-lg">{product.name}</span>
                        {isLowStock && (
                            <div className="w-2 h-2 rounded-full bg-error animate-ping" />
                        )}
                    </div>
                    <div className="text-text-dim text-xs mt-1 flex items-center gap-2">
                        <span className="bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-lg font-mono font-black">{product.sku}</span>
                        <span className="opacity-40">•</span>
                        <span className="font-bold opacity-70 uppercase tracking-tighter">{product.category}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-6 mt-1">
                <div className="flex flex-col">
                    <span className="text-[10px] text-text-dim uppercase tracking-[0.2em] font-black">Quantity</span>
                    <div className={`text-2xl font-black mt-0.5 ${isLowStock ? 'text-error' : 'text-text'}`}>
                        {product.stock} <span className="text-[11px] font-bold text-text-dim ml-1">{product.unit}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[11px] text-text-dim font-bold mt-0.5 tracking-tighter">Min: {product.minStock}</span>
                    <div className={`text-[10px] font-black uppercase mt-1.5 px-2 py-0.5 rounded ${isLowStock ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
                        {isLowStock ? 'Critical' : 'Stable'}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductList;

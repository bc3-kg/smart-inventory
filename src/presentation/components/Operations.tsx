/* file:///d:/workspace/inventory-app/src/presentation/components/Operations.tsx */
import React, { useState } from 'react';
import { Search, QrCode, ArrowRight, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Product, MovementStatus } from '../../domain/entities/Product';
import StockUpdateForm from './StockUpdateForm';

interface OperationsProps {
    products: Product[];
    statuses: MovementStatus[];
    onUpdateStock: (data: any) => Promise<void>;
}

const Operations: React.FC<OperationsProps> = ({ products, statuses, onUpdateStock }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);

    const handleSave = async (data: any) => {
        await onUpdateStock({
            productId: selectedProduct?.id,
            ...data
        });
        setSelectedProduct(null);
        setSearchTerm('');
    };

    return (
        <div className="space-y-10" id="operations-view">
            <header className="flex flex-col gap-2">
                <h2 className="text-4xl font-bold tracking-tight text-text leading-tight">{t('nav_operations')}</h2>
                <p className="text-text-dim text-lg leading-relaxed font-medium">{t('operations_subtitle')}</p>
            </header>

            <AnimatePresence mode="wait">
                {!selectedProduct ? (
                    <motion.div
                        key="search"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="relative group w-full lg:max-w-2xl">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-dim/60 group-focus-within:text-primary transition-all duration-300" size={20} />
                            <input
                                type="text"
                                placeholder={t('search_product_op')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-surface border border-black/5 dark:border-white/5 rounded-[24px] py-4 pl-14 pr-6 text-text outline-none focus:ring-4 focus:ring-primary/10 dark:focus:ring-primary/5 transition-all text-lg shadow-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {searchTerm && filteredProducts.map((p) => (
                                <motion.button
                                    key={p.id}
                                    whileHover={{ x: 10 }}
                                    onClick={() => setSelectedProduct(p)}
                                    className="card-premium flex items-center justify-between p-6 hover:border-primary/40 transition-all text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <div className="font-black text-text">{p.name}</div>
                                            <div className="text-xs font-mono text-text-dim">{p.sku}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-xs text-text-dim uppercase font-black">Stock</div>
                                            <div className="font-black text-text">{p.stock} {p.unit}</div>
                                        </div>
                                        <ArrowRight size={20} className="text-text-dim" />
                                    </div>
                                </motion.button>
                            ))}
                            {searchTerm && filteredProducts.length === 0 && (
                                <div className="p-10 text-center text-text-dim italic">{t('no_products')}</div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                    >
                        <div className="max-w-2xl mx-auto">
                           <StockUpdateForm 
                                product={selectedProduct} 
                                statuses={statuses} 
                                onSave={handleSave} 
                                onCancel={() => setSelectedProduct(null)} 
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Operations;

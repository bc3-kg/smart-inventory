/* file:///d:/workspace/inventory-app/src/presentation/components/ProductList.tsx */
import React from 'react';
import { Package, Search, AlertCircle, Filter, QrCode, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Product } from '../../domain/entities/Product';
import QRScanner from './QRScanner';

interface ProductListProps {
    products: Product[];
    isLoading: boolean;
    onProductClick: (product: Product) => void;
    onEnterEmpty?: (sku: string) => void;
    initialFilter?: string | null;
    onClearFilter?: () => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, isLoading, onProductClick, onEnterEmpty, initialFilter, onClearFilter }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [showScanner, setShowScanner] = React.useState(false);
    const [showFilters, setShowFilters] = React.useState(!!initialFilter);
    const [categoryFilter, setCategoryFilter] = React.useState('all');

    const categories = ['all', ...Array.from(new Set(products.map(p => p.metadata?.category || 'Uncategorized')))];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || (p.metadata?.category || 'Uncategorized') === categoryFilter;
        const matchesLowStock = initialFilter !== 'low-stock' || (p.stock <= (p.minStock || 0));
        
        return matchesSearch && matchesCategory && matchesLowStock;
    });

    const handleScan = (result: string) => {
        setSearchTerm(result);
        setShowScanner(false);
    };

    const handleExportCSV = () => {
        const headers = ["ID", "SKU", "Name", "Stock", "Unit", "Min Stock", "Metadata"];
        const rows = products.map(p => [
            p.id, 
            p.sku, 
            p.name, 
            p.stock, 
            p.unit, 
            p.minStock, 
            JSON.stringify(p.metadata || {})
        ]);
        
        const csvContent = [headers, ...rows].map(e => e.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `inventory_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8" id="inventory-list">
            <header className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-4xl font-bold tracking-tight text-text whitespace-nowrap">{t('inventory_title')}</h2>
                        {initialFilter === 'low-stock' && (
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-3 py-1 rounded-full bg-error/10 text-error text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-error/20 animate-pulse">
                                    <AlertCircle size={10} /> {t('stat_low_stock')} Only
                                </span>
                                <button 
                                    onClick={onClearFilter}
                                    className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-text-dim transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={handleExportCSV}
                            className="p-3 rounded-2xl bg-surface border border-black/5 dark:border-white/5 text-text-dim hover:text-success transition-all hover:bg-success/5 active:scale-95 shadow-sm"
                            title="Export CSV"
                        >
                            <Download size={24} />
                        </button>
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-3 rounded-2xl border transition-all active:scale-95 shadow-sm ${showFilters ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-black/5 dark:border-white/5 text-text-dim hover:text-text hover:bg-black/5 dark:hover:bg-white/5'}`}
                        >
                            <Filter size={24} />
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-black/5 dark:bg-white/5 p-6 rounded-[32px] flex flex-wrap gap-3">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategoryFilter(cat)}
                                        className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${categoryFilter === cat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/40 dark:bg-black/40 text-text-dim hover:text-text'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="relative group w-full lg:max-w-2xl flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-dim/60 group-focus-within:text-primary transition-all duration-300" size={20} />
                        <input
                            type="text"
                            placeholder={t('search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && filteredProducts.length === 0 && searchTerm) {
                                    onEnterEmpty?.(searchTerm.toUpperCase());
                                }
                            }}
                            className="w-full bg-surface border border-black/5 dark:border-white/5 rounded-[24px] py-4 pl-14 pr-6 text-text outline-none focus:ring-4 focus:ring-primary/10 dark:focus:ring-primary/5 transition-all text-lg shadow-sm"
                        />
                    </div>
                    <button 
                        onClick={() => setShowScanner(true)}
                        className="p-4 rounded-[24px] bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all outline-none"
                    >
                        <QrCode size={24} />
                    </button>
                </div>
            </header>

            <AnimatePresence>
                {showScanner && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/90 flex flex-col p-6"
                    >
                        <div className="flex justify-end p-4">
                            <button onClick={() => setShowScanner(false)} className="text-white p-2">
                                <X size={32} />
                            </button>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                            <div className="w-full max-w-lg aspect-square overflow-hidden rounded-[40px] border-4 border-primary/50 relative">
                                <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
                            </div>
                        </div>
                        <div className="text-center text-white/60 py-10 font-black uppercase tracking-widest">
                            Scan product QR or Barcode
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            delay={idx * 0.05} 
                            onClick={() => onProductClick(product)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const ProductCard = ({ product, delay, onClick }: { product: Product, delay: number, onClick: () => void }) => {
    const isLowStock = product.stock <= product.minStock;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            whileHover={{ y: -6, scale: 1.02 }}
            onClick={onClick}
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
                        <span className="font-bold opacity-70 uppercase tracking-tighter">{product.metadata?.category || 'Uncategorized'}</span>
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

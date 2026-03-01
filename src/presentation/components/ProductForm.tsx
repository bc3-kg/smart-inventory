/* file:///d:/workspace/inventory-app/src/presentation/components/ProductForm.tsx */
import React, { useState } from 'react';
import { X, Save, Package, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import QRScanner from './QRScanner';

interface ProductFormProps {
    onSave: (data: any) => void;
    onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSave, onCancel }) => {
    const { t } = useTranslation();
    const [showScanner, setShowScanner] = useState(false);
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        category: '',
        price: 0,
        stock: 0,
        unit: 'un',
        minStock: 5,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleScan = (result: string) => {
        setFormData({ ...formData, sku: result });
        setShowScanner(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-premium space-y-6 !shadow-2xl border-black/5 dark:border-white/10"
        >
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-text">
                    <Package size={20} className="text-primary" />
                    {t('add_product_title')}
                </h3>
                <button onClick={onCancel} className="text-text-dim hover:text-text transition-colors p-2">
                    <X size={24} />
                </button>
            </div>

            <AnimatePresence mode="wait">
                {showScanner ? (
                    <QRScanner key="scanner" onScan={handleScan} onClose={() => setShowScanner(false)} />
                ) : (
                    <form key="form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center mb-1">
                                <label htmlFor="sku" className="text-[11px] font-black uppercase tracking-widest text-text-dim/60 ml-1">{t('form_sku')}</label>
                                <button
                                    type="button"
                                    onClick={() => setShowScanner(true)}
                                    className="flex items-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-wider bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 hover:bg-primary/20 transition-all"
                                >
                                    <QrCode size={12} />
                                    {t('btn_scan')}
                                </button>
                            </div>
                            <input
                                id="sku"
                                required
                                type="text"
                                data-testid="sku-input"
                                placeholder="Ex: IPH-15PRO"
                                value={formData.sku}
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-text outline-none focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="name" className="text-[11px] font-black uppercase tracking-widest text-text-dim/60 ml-1">{t('form_name')}</label>
                            <input
                                id="name"
                                required
                                type="text"
                                placeholder="Ex: iPhone 15 Pro Max"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-text outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="category" className="text-[11px] font-black uppercase tracking-widest text-text-dim/60 ml-1">{t('form_category')}</label>
                                <input
                                    id="category"
                                    required
                                    type="text"
                                    placeholder="..."
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-text outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="unit" className="text-[11px] font-black uppercase tracking-widest text-text-dim/60 ml-1">{t('form_unit')}</label>
                                <select
                                    id="unit"
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-text outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                                >
                                    <option value="un">{t('unit_un')}</option>
                                    <option value="kg">{t('unit_kg')}</option>
                                    <option value="lt">{t('unit_lt')}</option>
                                    <option value="pc">{t('unit_pc')}</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="stock" className="text-[11px] font-black uppercase tracking-widest text-text-dim/60 ml-1">{t('form_initial_stock')}</label>
                                <input
                                    id="stock"
                                    required
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-text outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="minStock" className="text-[11px] font-black uppercase tracking-widest text-text-dim/60 ml-1">{t('form_min_stock')}</label>
                                <input
                                    id="minStock"
                                    required
                                    type="number"
                                    value={formData.minStock}
                                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-text outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-4 bg-primary text-white font-black py-4 rounded-2xl shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <Save size={20} />
                            {t('btn_save')}
                        </button>
                    </form>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ProductForm;

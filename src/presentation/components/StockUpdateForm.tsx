/* file:///d:/workspace/inventory-app/src/presentation/components/StockUpdateForm.tsx */
import React, { useState } from 'react';
import { X, Save, ArrowRight, Package, Calculator, Info, MapPin, Tag, Type, Minus, Plus, ChevronDown, ChevronUp, StickyNote, Hash, Trash2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Product, MovementStatus } from '../../domain/entities/Product';

interface StockUpdateFormProps {
    product: Product;
    statuses: MovementStatus[];
    onSave: (data: any) => Promise<void>;
    onCancel: () => void;
}

const StockUpdateForm: React.FC<StockUpdateFormProps> = ({ product, statuses, onSave, onCancel }) => {
    const { t } = useTranslation();
    const [selectedStatusId, setSelectedStatusId] = useState(statuses[0]?.id || '');
    const [quantity, setQuantity] = useState(1);
    const [unitPrice, setUnitPrice] = useState(product.price || 0);
    const [reason, setReason] = useState('');
    
    // Product Metadata States
    const [name, setName] = useState(product.name);
    const [unit, setUnit] = useState(product.unit);
    const [minStock, setMinStock] = useState(product.minStock || 0);
    const [metadata, setMetadata] = useState([
        { id: '1', key: 'category', label: t('form_category'), value: product.metadata?.category || '', icon: <Tag size={13} /> },
        { id: '2', key: 'location', label: '保管場所', value: product.metadata?.location || '', icon: <MapPin size={13} /> },
        { id: '3', key: 'condition', label: '状態', value: product.metadata?.condition || '', icon: <Info size={13} /> },
        { id: '4', key: 'notes', label: '備考', value: product.metadata?.notes || '', icon: <StickyNote size={13} /> },
        // Load custom metadata fields
        ...Object.entries(product.metadata || {})
            .filter(([key]) => !['category', 'location', 'condition', 'notes'].includes(key))
            .map(([key, value], index) => ({
                id: `custom_${Date.now()}_${index}`,
                key,
                label: key.charAt(0).toUpperCase() + key.slice(1),
                value: String(value),
                icon: <Plus size={13} />
            }))
    ]);

    const addMetadataField = () => {
        const newId = Date.now().toString();
        setMetadata([...metadata, { id: newId, key: `custom_${newId}`, label: `項目 ${metadata.length + 1}`, value: '', icon: <Plus size={13} /> }]);
    };

    const updateMetadata = (id: string, value: string) => {
        setMetadata(metadata.map(m => m.id === id ? { ...m, value } : m));
    };

    const updateMetadataKey = (id: string, label: string) => {
        setMetadata(metadata.map(m => m.id === id ? { ...m, label, key: label.toLowerCase() } : m));
    };

    const removeMetadata = (id: string) => {
        setMetadata(metadata.filter(m => m.id !== id));
    };

    const [showAccordion, setShowAccordion] = useState(false);

    const selectedStatus = statuses.find(s => s.id === selectedStatusId);
    
    const calculateResult = () => {
        if (!selectedStatus) return product.stock;
        if (selectedStatus.action === 'ADD') return product.stock + quantity;
        if (selectedStatus.action === 'SUBTRACT') return product.stock - quantity;
        if (selectedStatus.action === 'SET') return quantity;
        return product.stock;
    };

    const result = calculateResult();
    const totalAmount = unitPrice * quantity;
    const isInvalid = selectedStatus?.action === 'SUBTRACT' && result < 0;

    const getStatusColor = (color: string) => {
        switch (color) {
            case 'primary': return 'bg-primary border-primary';
            case 'secondary': return 'bg-secondary border-secondary';
            case 'success': return 'bg-success border-success';
            case 'error': return 'bg-error border-error';
            case 'warning': return 'bg-warning border-warning';
            default: return 'bg-primary border-primary';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isInvalid) return;
        
        const metadataRecord = metadata.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
        
        await onSave({ 
            statusId: selectedStatusId, 
            quantity, 
            unitPrice,
            reason,
            productData: {
                name,
                unit,
                minStock,
                metadata: metadataRecord
            }
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-premium space-y-8 !shadow-2xl border-black/5 dark:border-white/10 p-8"
        >
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                        <Package size={28} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/80 bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">{product.sku}</span>
                        </div>
                        <h3 className="text-2xl font-black text-text leading-tight">{product.name}</h3>
                    </div>
                </div>
                <button onClick={onCancel} className="text-text-dim hover:text-text transition-colors p-2">
                    <X size={28} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                    {/* Name: Full Width & Large */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-dim/60 ml-1">
                            <Type size={12} /> {t('form_name')}
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-premium py-4 text-xl font-black bg-black/5 dark:bg-white/5 border-transparent focus:bg-surface transition-all"
                        />
                    </div>

                    {/* Accordion Panel for Metadata */}
                    <div className="border border-black/5 dark:border-white/10 rounded-[28px] overflow-hidden bg-black/5 dark:bg-white/5">
                        <div className="flex items-center justify-between pr-4 bg-black/5 dark:bg-white/5">
                            <button
                                type="button"
                                onClick={() => setShowAccordion(!showAccordion)}
                                className="flex-1 flex items-center justify-between p-5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-3 text-sm font-bold text-text-dim">
                                    <Info size={18} className="text-primary" />
                                    {t('product_details_edit')}
                                </div>
                                {showAccordion ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); addMetadataField(); setShowAccordion(true); }}
                                className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                                title="Add Field"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        <AnimatePresence>
                            {showAccordion && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-black/5 dark:border-white/5 p-6 space-y-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">

                                        {/* 1. Category */}
                                        {metadata.filter(f => f.key === 'category').map((field) => (
                                            <div key={field.id} className="space-y-2 relative group">
                                                <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-text-dim/80 ml-1">
                                                    <span className="text-primary">{field.icon}</span> {field.label}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={field.value}
                                                    onChange={(e) => updateMetadata(field.id, e.target.value)}
                                                    className="input-premium py-3 text-sm bg-white/40 dark:bg-black/20"
                                                />
                                            </div>
                                        ))}

                                        {/* 2. Location */}
                                        {metadata.filter(f => f.key === 'location').map((field) => (
                                            <div key={field.id} className="space-y-2 relative group">
                                                <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-text-dim/80 ml-1">
                                                    <span className="text-primary">{field.icon}</span> {field.label}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={field.value}
                                                    onChange={(e) => updateMetadata(field.id, e.target.value)}
                                                    className="input-premium py-3 text-sm bg-white/40 dark:bg-black/20"
                                                />
                                            </div>
                                        ))}

                                        {/* 3. Condition */}
                                        {metadata.filter(f => f.key === 'condition').map((field) => (
                                            <div key={field.id} className="space-y-2 relative group">
                                                <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-text-dim/80 ml-1">
                                                    <span className="text-primary">{field.icon}</span> {field.label}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={field.value}
                                                    onChange={(e) => updateMetadata(field.id, e.target.value)}
                                                    className="input-premium py-3 text-sm bg-white/40 dark:bg-black/20"
                                                />
                                            </div>
                                        ))}

                                        {/* 4. Unit selection */}
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-text-dim/60 ml-1">
                                                <Package size={12} className="inline mr-2" /> {t('form_unit')}
                                            </label>
                                            <select
                                                value={unit}
                                                onChange={(e) => setUnit(e.target.value)}
                                                className="select-premium"
                                            >
                                                <option value="un">{t('unit_un')}</option>
                                                <option value="kg">{t('unit_kg')}</option>
                                                <option value="lt">{t('unit_lt')}</option>
                                                <option value="pc">{t('unit_pc')}</option>
                                            </select>
                                        </div>

                                        {/* 5. Minimum Stock */}
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-text-dim/60 ml-1">
                                                <AlertTriangle size={12} className="inline mr-2 text-warning" /> {t('form_min_stock')}
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setMinStock(Math.max(0, minStock - 1))}
                                                    className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-text hover:bg-black/10 transition-all active:scale-90"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={minStock}
                                                    onChange={(e) => setMinStock(parseInt(e.target.value) || 0)}
                                                    className="flex-1 input-premium py-3 text-lg font-black shadow-inner text-center"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setMinStock(minStock + 1)}
                                                    className="p-3 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 hover:bg-orange-500 hover:text-white transition-all active:scale-90 shadow-sm"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* 6. Custom Metadata Fields */}
                                        {metadata.filter(f => !['category', 'location', 'condition', 'notes'].includes(f.key)).map((field) => (
                                            <div key={field.id} className="space-y-2 relative group">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <span className="text-primary">{field.icon}</span>
                                                        <input 
                                                            type="text"
                                                            value={field.label}
                                                            onChange={(e) => updateMetadataKey(field.id, e.target.value)}
                                                            className="text-[11px] font-black uppercase tracking-widest text-primary bg-transparent border-b border-primary/20 hover:border-primary transition-colors outline-none focus:ring-0 p-0 flex-1"
                                                        />
                                                    </div>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeMetadata(field.id)}
                                                        className="opacity-0 group-hover:opacity-100 text-error p-1 hover:bg-error/10 rounded-md transition-all"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={field.value}
                                                    onChange={(e) => updateMetadata(field.id, e.target.value)}
                                                    className="input-premium py-3 text-sm bg-white/40 dark:bg-black/20"
                                                />
                                            </div>
                                        ))}

                                        {/* 6. Notes (Full Width) */}
                                        {metadata.filter(f => f.key === 'notes').map((field) => (
                                            <div key={field.id} className="md:col-span-2 space-y-2">
                                                <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-text-dim/80 ml-1">
                                                    <span className="text-primary">{field.icon}</span> {field.label}
                                                </label>
                                                <textarea
                                                    value={field.value}
                                                    onChange={(e) => updateMetadata(field.id, e.target.value)}
                                                    className="input-premium py-3 text-sm bg-white/40 dark:bg-black/20 min-h-[100px]"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                {/* Status Selector */}
                <div className="space-y-3">
                    <label className="text-[12px] font-black uppercase tracking-[0.2em] text-text-dim/80 ml-1">{t('form_transaction_status')}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {statuses.map((status) => (
                            <button
                                key={status.id}
                                type="button"
                                onClick={() => setSelectedStatusId(status.id)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-[20px] border-2 transition-all group ${
                                    selectedStatusId === status.id 
                                    ? `${getStatusColor(status.color)} text-white shadow-lg` 
                                    : 'bg-black/5 dark:bg-white/5 border-transparent text-text-dim hover:bg-black/10 dark:hover:bg-white/10'
                                }`}
                            >
                                <span className="font-black text-lg">{status.name[0]}</span>
                                <span className="text-[10px] font-black uppercase tracking-tighter line-clamp-1">{status.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Inputs */}
                    <div className="space-y-6">
                        {/* Quantity Input */}
                        <div className="space-y-3">
                            <label htmlFor="qty" className="text-[12px] font-black uppercase tracking-[0.2em] text-text-dim/80 ml-1">
                                {selectedStatus?.action === 'SET' ? t('form_actual_stock') : t('form_quantity')}
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setQuantity(Math.max(0, quantity - 1))}
                                    className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-text hover:bg-black/10 transition-all active:scale-90"
                                >
                                    <Minus size={20} />
                                </button>
                                <input
                                    id="qty"
                                    type="number"
                                    min="0"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                                    className="flex-1 input-premium py-4 text-2xl font-black shadow-inner text-center"
                                />
                                <button
                                    type="button"
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="p-4 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-90"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Unit Price Input */}
                        <div className="space-y-3">
                            <label htmlFor="unitPrice" className="text-[12px] font-black uppercase tracking-[0.2em] text-text-dim/80 ml-1">
                                {t('form_unit_price')}
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setUnitPrice(Math.max(0, unitPrice - 100))}
                                    className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-text-dim hover:text-text hover:bg-black/10 transition-all active:scale-90"
                                >
                                    <Minus size={20} />
                                </button>
                                <div className="relative flex-1 group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim font-bold text-lg opacity-40 group-focus-within:opacity-100 transition-opacity">¥</div>
                                    <input
                                        id="unitPrice"
                                        type="number"
                                        min="0"
                                        value={unitPrice}
                                        onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                                        className="w-full input-premium py-4 pl-10 text-2xl font-black shadow-inner text-center"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setUnitPrice(unitPrice + 100)}
                                    className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-text-dim hover:text-text hover:bg-black/10 transition-all active:scale-90"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Result Card */}
                    <div className="bg-primary/5 dark:bg-primary/10 rounded-[32px] p-8 flex flex-col justify-between border border-primary/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors" />
                        
                        <div className="relative z-10 space-y-8">
                            <div className="flex justify-between items-start">
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-primary/60">{t('calculation_preview')}</h4>
                                <Calculator size={20} className="text-primary/40" />
                            </div>
                            
                            <div className="flex items-center justify-between gap-4">
                                <div className="text-center flex-1">
                                    <div className="text-[10px] font-black uppercase text-text-dim/40 mb-1">{t('stat_current')}</div>
                                    <div className="text-3xl font-black text-text-dim/40">{product.stock}</div>
                                </div>
                                <ArrowRight className="text-primary/40" size={32} />
                                <div className="text-center flex-1">
                                    <div className="text-[10px] font-black uppercase text-text-dim mb-1">{t('stat_after')}</div>
                                    <div className={`text-5xl font-black tracking-tighter ${isInvalid ? 'text-error' : 'text-text'}`}>{result}</div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-primary/10">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-[10px] font-black uppercase text-primary/60 mb-1">{t('form_total_amount')}</div>
                                        <div className="text-4xl font-black text-primary flex items-baseline gap-1">
                                            <span className="text-2xl font-bold opacity-60">¥</span>
                                            {totalAmount.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[9px] font-bold text-text-dim/40 mb-1 uppercase tracking-tighter">Calculation</div>
                                        <div className="text-[11px] font-black text-text-dim/60">
                                            {unitPrice.toLocaleString()} × {quantity}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 mt-6">
                            {isInvalid ? (
                                <div className="flex items-center gap-2 text-error bg-error/10 p-4 rounded-2xl border border-error/10">
                                    <Info size={18} />
                                    <span className="text-[11px] font-black uppercase">{t('error_negative_stock')}</span>
                                </div>
                            ) : (
                                <div className="text-[10px] text-text-dim/60 italic text-center font-medium bg-black/5 dark:bg-white/5 py-3 rounded-xl border border-black/5 dark:border-white/5">
                                    {t('auto_calculation_hint')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 bg-black/5 dark:bg-white/5 text-text font-black py-4 rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 transition-all uppercase tracking-widest text-sm"
                    >
                        {t('btn_cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={isInvalid}
                        className={`flex-[2] bg-primary text-white font-black py-5 rounded-[24px] shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-30 disabled:grayscale disabled:hover:scale-100 ${isInvalid ? 'cursor-not-allowed' : ''}`}
                    >
                        <Save size={24} />
                        {t('btn_register_movement')}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default StockUpdateForm;

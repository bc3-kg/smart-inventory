/* file:///d:/workspace/inventory-app/src/presentation/components/ActivityLog.tsx */
import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock, History, Calendar, Download, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Product, StockMovement, MovementStatus } from '../../domain/entities/Product';

interface ActivityLogProps {
    movements: StockMovement[];
    products: Product[];
    statuses: MovementStatus[];
}

const ActivityLog: React.FC<ActivityLogProps> = ({ movements, products, statuses }) => {
    const { t } = useTranslation();
    const [showFilters, setShowFilters] = React.useState(false);
    const [statusFilter, setStatusFilter] = React.useState('all');

    const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'Unknown Product';
    const getStatusAction = (statusId: string) => statuses.find(s => s.id === statusId)?.action || 'ADD';

    const uniqueStatusIds = Array.from(new Set(movements.map(m => m.statusId)));
    const filterOptions = ['all', ...uniqueStatusIds];

    const filteredMovements = movements.filter(m => 
        statusFilter === 'all' || m.statusId === statusFilter
    );

    const handleExportCSV = () => {
        const headers = ["ID", "Date", "Product", "Action", "Quantity", "Amount", "Reason"];
        const rows = movements.map(m => [
            m.id, 
            m.timestamp.toISOString(), 
            getProductName(m.productId), 
            getStatusAction(m.statusId), 
            m.quantity, 
            m.totalAmount || 0,
            m.reason || ""
        ]);
        
        const csvContent = [headers, ...rows].map(e => e.map(String).map(v => `"${v}"`).join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `activity_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-10" id="activity-view">
            <header className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-4xl font-bold tracking-tight text-text flex items-center gap-3">
                            <History size={36} className="text-primary" />
                            {t('activity_title')}
                        </h2>
                        <p className="text-text-dim text-lg leading-relaxed">{t('activity_subtitle')}</p>
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
                                {filterOptions.map(id => {
                                    const name = id === 'all' ? 'All Activities' : (statuses.find(s => s.id === id)?.name || id);
                                    return (
                                        <button
                                            key={id}
                                            onClick={() => setStatusFilter(id)}
                                            className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${statusFilter === id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/40 dark:bg-black/40 text-text-dim hover:text-text'}`}
                                        >
                                            {name}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredMovements.map((act, idx) => {
                    const action = getStatusAction(act.statusId);
                    const isAdd = action === 'ADD';
                    const isSubtract = action === 'SUBTRACT';

                    return (
                        <motion.div
                            key={act.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.01 }}
                            className="card-premium flex items-center gap-6 group hover:border-primary/30 transition-all border-black/5 dark:border-white/5 p-6"
                        >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-12 transition-transform duration-500 ${isAdd ? 'bg-success/10 text-success' : isSubtract ? 'bg-secondary/10 text-secondary' : 'bg-warning/10 text-warning'}`}>
                                {isAdd ? <ArrowUpRight size={28} /> : isSubtract ? <ArrowDownLeft size={28} /> : <History size={28} />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="text-text font-black text-lg truncate group-hover:text-primary transition-colors">{getProductName(act.productId)}</div>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-lg text-text-dim font-bold text-[11px] uppercase tracking-tighter">
                                        <Calendar size={12} /> {act.timestamp.toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-text-dim font-medium text-[11px] opacity-70">
                                        <Clock size={12} /> {act.timestamp.toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end shrink-0">
                                <div className={`font-black text-2xl tracking-tighter ${isAdd ? 'text-success' : isSubtract ? 'text-secondary' : 'text-warning'}`}>
                                    {isAdd ? '+' : isSubtract ? '-' : ''}{act.quantity}
                                </div>
                                {act.totalAmount && (
                                    <div className="text-[11px] font-black text-text-dim opacity-60 flex items-center gap-1 mt-1">
                                        <span className="text-[9px]">¥</span>
                                        {act.totalAmount.toLocaleString()}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
                {filteredMovements.length === 0 && (
                    <div className="col-span-full py-40 text-center grayscale opacity-30 flex flex-col items-center gap-6">
                        <History size={80} />
                        <p className="text-xl font-medium">No results matching your filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLog;

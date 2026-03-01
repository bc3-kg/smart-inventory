/* file:///d:/workspace/inventory-app/src/presentation/components/Dashboard.tsx */
import React from 'react';
import { Package, AlertCircle, TrendingUp, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Product } from '../../domain/entities/Product';

interface DashboardProps {
    products: Product[];
    isLoading: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ products, isLoading }) => {
    const { t } = useTranslation();

    const totalItems = products.length;
    const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
    const totalStock = products.reduce((acc, p) => acc + p.stock, 0);

    return (
        <div className="space-y-8 sm:space-y-14">
            <header className="flex flex-col gap-4">
                <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-text leading-tight">{t('dashboard_title')}</h2>
                <p className="text-text-dim text-lg sm:text-xl font-medium max-w-3xl leading-relaxed">{t('dashboard_subtitle')}</p>
            </header>

            {/* Dynamic Insight Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-10">
                <StatCard
                    icon={<Package size={28} />}
                    label={t('stat_unique_items')}
                    value={isLoading ? "..." : totalItems}
                    delay={0}
                    color="text-primary"
                />
                <StatCard
                    icon={<AlertCircle size={28} />}
                    label={t('stat_low_stock')}
                    value={isLoading ? "..." : lowStockCount}
                    delay={0.1}
                    color="text-error"
                    highlight={lowStockCount > 0}
                />
                <StatCard
                    icon={<TrendingUp size={28} />}
                    label="Inventory Value"
                    value={isLoading ? "..." : `$${(totalStock * 125).toLocaleString()}`}
                    delay={0.2}
                    color="text-success"
                />
                <StatCard
                    icon={<History size={28} />}
                    label="Active Nodes"
                    value="Stable"
                    delay={0.3}
                    color="text-secondary"
                />
            </div>

            {/* Platform Analytics Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
                <div className="lg:col-span-8 flex flex-col gap-10">
                    <div className="card-premium flex flex-col gap-12 min-h-[480px]">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-text tracking-tight uppercase">Supply Flow Velocity</h3>
                            <div className="px-4 py-2 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[11px] font-black uppercase tracking-widest text-text-dim">Network Statistics</div>
                        </div>

                        <div className="flex-1 flex items-end justify-between gap-2 sm:gap-4 px-2">
                            {[45, 75, 40, 95, 60, 85, 55, 70, 45, 90, 65, 80].map((h, i) => (
                                <div key={i} className="flex-1 bg-primary/10 dark:bg-primary/5 rounded-full relative group transition-all" style={{ height: `${h}%` }}>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: '100%' }}
                                        transition={{ delay: 0.4 + (i * 0.04), duration: 1, ease: 'circOut' }}
                                        className="w-full h-full bg-primary rounded-full relative overflow-hidden"
                                    >
                                        <div className="absolute inset-x-0 bottom-0 top-1/2 bg-white/20 dark:bg-black/10" />
                                    </motion.div>
                                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-surface text-text border border-black/10 dark:border-white/10 px-4 py-2 rounded-2xl text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all shadow-2xl z-50 whitespace-nowrap">
                                        Data Point {i + 1}: {h}%
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center px-4 border-t border-black/5 dark:border-white/5 pt-8 mb-2">
                            <div className="text-[10px] font-black text-text-dim/60 uppercase tracking-widest">Q1 Analysis Period</div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /> <span className="text-[10px] font-black uppercase tracking-tighter text-text-dim">Actual</span></div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary/20" /> <span className="text-[10px] font-black uppercase tracking-tighter text-text-dim">Projected</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="card-premium flex flex-col gap-8 h-full min-h-[480px]">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-text uppercase tracking-tight">Critical Events</h3>
                            <span className="bg-error/10 text-error text-[10px] px-3 py-1.5 rounded-xl font-black uppercase tracking-wider">{lowStockCount} Events</span>
                        </div>
                        <div className="space-y-5 flex-1">
                            {products.filter(p => p.stock <= p.minStock).slice(0, 5).map((p, idx) => (
                                <motion.div
                                    key={p.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + (idx * 0.1) }}
                                    className="flex items-center gap-5 p-5 bg-black/5 dark:bg-white/5 rounded-3xl border border-black/[0.03] dark:border-white/5 group hover:bg-error/5 hover:border-error/20 transition-all cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-error/10 text-error flex items-center justify-center shrink-0">
                                        <AlertCircle size={22} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[15px] font-black truncate text-text">{p.name}</div>
                                        <div className="text-[10px] text-text-dim uppercase font-black tracking-widest mt-1">Refill Threshold Exceeded</div>
                                    </div>
                                </motion.div>
                            ))}
                            {!isLoading && lowStockCount === 0 && (
                                <div className="h-full flex flex-col items-center justify-center opacity-30 gap-6 py-20">
                                    <div className="w-24 h-24 rounded-full border-4 border-dashed border-text-dim/50 flex items-center justify-center">
                                        <Package size={40} className="stroke-[1]" />
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-[0.3em]">No Critical Actions</p>
                                </div>
                            )}
                        </div>
                        <button className="w-full py-4 text-center text-[11px] font-black uppercase tracking-widest text-primary border-t border-black/5 dark:border-white/5 hover:bg-primary/5 transition-all rounded-b-[32px]">Resolve All Actions</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, delay, color, highlight }: { icon: React.ReactNode, label: string, value: string | number, delay: number, color: string, highlight?: boolean }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        whileHover={{ y: -12, scale: 1.02 }}
        className={`card-premium group relative flex flex-col gap-8 p-9 border-b-8 transition-all overflow-hidden ${highlight ? 'border-b-error' : 'border-b-primary/50'}`}
    >
        <div className={`w-16 h-16 rounded-[24px] bg-black/5 dark:bg-white/5 flex items-center justify-center shadow-inner ${color}`}>
            {icon}
        </div>
        <div className="relative z-10">
            <div className="text-[11px] font-black uppercase tracking-[0.25em] text-text-dim opacity-70 mb-2">{label}</div>
            <div className="text-4xl font-black text-text tracking-tighter">{value}</div>
        </div>
        {/* Glow behind value */}
        <div className={`absolute -right-4 -bottom-4 w-32 h-32 rounded-full blur-[80px] opacity-10 transition-opacity group-hover:opacity-30 ${highlight ? 'bg-error' : 'bg-primary'}`} />
    </motion.div>
);

export default Dashboard;

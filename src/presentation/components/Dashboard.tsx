import React from 'react';
import { Package, AlertCircle, TrendingUp, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Product, StockMovement } from '../../domain/entities/Product';

interface DashboardProps {
    products: Product[];
    movements: StockMovement[];
    isLoading: boolean;
    onNavigate: (tab: 'dashboard' | 'products' | 'activity', filter?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ products, movements, isLoading, onNavigate }) => {
    const { t } = useTranslation();

    const totalItems = products.length;
    const lowStockCount = products.filter(p => !p.stock || p.stock <= (p.minStock || 0)).length;
    const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);

    // Calculate Last 14 Days Velocity (Inbound + Outbound absolute quantities)
    const velocityData = React.useMemo(() => {
        const data = [];
        const now = new Date();
        for (let i = 13; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);

            const dayMovements = movements.filter(m => {
                const ts = new Date(m.timestamp).getTime();
                return ts >= date.getTime() && ts < nextDay.getTime();
            });

            // Sum of moving units regardless of direction
            const totalQty = dayMovements.reduce((sum, m) => sum + Math.abs(m.quantity), 0);
            data.push({
                date: date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
                value: totalQty
            });
        }
        return data;
    }, [movements]);

    const maxVelocity = Math.max(...velocityData.map(d => d.value), 1);

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
                    onClick={() => onNavigate('products')}
                />
                <StatCard
                    icon={<AlertCircle size={28} />}
                    label={t('stat_low_stock')}
                    value={isLoading ? "..." : lowStockCount}
                    delay={0.1}
                    color="text-error"
                    highlight={lowStockCount > 0}
                    onClick={() => onNavigate('products', 'low-stock')}
                />
                <StatCard
                    icon={<TrendingUp size={28} />}
                    label={t('form_total_amount')}
                    value={isLoading ? "..." : `¥${totalInventoryValue.toLocaleString()}`}
                    delay={0.2}
                    color="text-success"
                />
                <StatCard
                    icon={<History size={28} />}
                    label="システム稼働状況"
                    value="正常"
                    delay={0.3}
                    color="text-secondary"
                />
            </div>

            {/* Platform Analytics Layout - Full Width Velocity Chart */}
            <div className="grid grid-cols-1 gap-8 sm:gap-12">
                <div className="flex flex-col gap-10">
                    <div className="card-premium flex flex-col gap-12 min-h-[480px]">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-text tracking-tight uppercase">在庫流動性分析 (過去14日間)</h3>
                            <div className="px-4 py-2 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[11px] font-black uppercase tracking-widest text-text-dim">ネットワーク統計</div>
                        </div>

                        <div className="flex-1 flex items-end justify-between gap-2 sm:gap-6 px-4">
                            {velocityData.map((d, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-4 h-full group">
                                    <div className="flex-1 w-full bg-primary/5 dark:bg-primary/5 rounded-full relative transition-all flex items-end">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(d.value / maxVelocity) * 100}%` }}
                                            transition={{ delay: 0.4 + (i * 0.04), duration: 1, ease: 'circOut' }}
                                            className="w-full bg-primary rounded-full relative overflow-hidden min-h-[4px]"
                                        >
                                            <div className="absolute inset-x-0 bottom-0 top-1/2 bg-white/20 dark:bg-black/10" />
                                        </motion.div>
                                        <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-surface text-text border border-black/10 dark:border-white/10 px-4 py-2 rounded-2xl text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all shadow-2xl z-50 whitespace-nowrap">
                                            {d.date}: {d.value}
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-black text-text-dim opacity-50 rotate-[-45deg] sm:rotate-0">{d.date}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center px-4 border-t border-black/5 dark:border-white/5 pt-8 mb-2">
                            <div className="text-[10px] font-black text-text-dim/60 uppercase tracking-widest">分析期間: 過去14日間</div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /> <span className="text-[10px] font-black uppercase tracking-tighter text-text-dim">合計数量 (入庫 + 出庫)</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, delay, color, highlight, onClick }: { icon: React.ReactNode, label: string, value: string | number, delay: number, color: string, highlight?: boolean, onClick?: () => void }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        whileHover={{ y: -12, scale: 1.02 }}
        onClick={onClick}
        className={`card-premium group relative flex flex-col gap-8 p-9 border-b-8 transition-all overflow-hidden ${highlight ? 'border-b-error' : 'border-b-primary/50'} ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
    >
        <div className={`w-16 h-16 rounded-[24px] bg-black/5 dark:bg-white/5 flex items-center justify-center shadow-inner ${color}`}>
            {icon}
        </div>
        <div className="relative z-10">
            <div className="text-[11px] font-black uppercase tracking-[0.25em] text-text-dim opacity-70 mb-2">{label}</div>
            <div className="text-4xl font-black text-text tracking-tighter">{value}</div>
        </div>
        <div className={`absolute -right-4 -bottom-4 w-32 h-32 rounded-full blur-[80px] opacity-10 transition-opacity group-hover:opacity-30 ${highlight ? 'bg-error' : 'bg-primary'}`} />
    </motion.div>
);

export default Dashboard;

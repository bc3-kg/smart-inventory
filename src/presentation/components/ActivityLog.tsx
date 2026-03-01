/* file:///d:/workspace/inventory-app/src/presentation/components/ActivityLog.tsx */
import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock, History, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const ActivityLog: React.FC = () => {
    const { t } = useTranslation();

    const activities = [
        { id: 1, type: 'in', product: 'iPhone 15 Pro Max', qty: 10, time: '2h ago', user: 'Admin' },
        { id: 2, type: 'out', product: 'MacBook Air M3', qty: 2, time: '5h ago', user: 'Staff' },
        { id: 3, type: 'in', product: 'AirPods Pro 2', qty: 20, time: '1d ago', user: 'Admin' },
        { id: 4, type: 'out', product: 'Apple Watch Ultra', qty: 1, time: '2d ago', user: 'Staff' },
        { id: 5, type: 'in', product: 'iPad Pro 11"', qty: 5, time: '3d ago', user: 'Manager' },
        { id: 6, type: 'out', product: 'Leather Case', qty: 15, time: '4d ago', user: 'Sales' },
    ];

    return (
        <div className="space-y-10" id="activity-view">
            <header className="flex flex-col gap-2">
                <h2 className="text-4xl font-bold tracking-tight text-text flex items-center gap-3">
                    <History size={36} className="text-primary" />
                    {t('activity_title')}
                </h2>
                <p className="text-text-dim text-lg leading-relaxed">{t('activity_subtitle')}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activities.map((act, idx) => (
                    <motion.div
                        key={act.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.01 }}
                        className="card-premium flex items-center gap-6 group hover:border-primary/30 transition-all border-black/5 dark:border-white/5 p-6"
                    >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-12 transition-transform duration-500 ${act.type === 'in' ? 'bg-success/10 text-success' : 'bg-secondary/10 text-secondary'}`}>
                            {act.type === 'in' ? <ArrowUpRight size={28} /> : <ArrowDownLeft size={28} />}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="text-text font-black text-lg truncate group-hover:text-primary transition-colors">{act.product}</div>
                            <div className="flex items-center gap-3 mt-1.5">
                                <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-lg text-text-dim font-bold text-[11px] uppercase tracking-tighter">
                                    <Calendar size={12} /> {act.user}
                                </div>
                                <div className="flex items-center gap-1.5 text-text-dim font-medium text-[11px] opacity-70">
                                    <Clock size={12} /> {act.time}
                                </div>
                            </div>
                        </div>

                        <div className={`font-black text-2xl tracking-tighter shrink-0 ${act.type === 'in' ? 'text-success' : 'text-secondary'}`}>
                            {act.type === 'in' ? '+' : '-'}{act.qty}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ActivityLog;

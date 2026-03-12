import React from 'react';
import { House, Package, Activity, Settings, Plus, Cloud, RefreshCcw, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface LayoutProps {
    children: React.ReactNode;
    activeTab: 'home' | 'products' | 'activity' | 'settings';
    setActiveTab: (tab: 'home' | 'products' | 'activity' | 'settings') => void;
    onAddClick: () => void;
    showAddButton: boolean;
    isSyncing?: boolean;
    pendingCount?: number;
}

const Layout: React.FC<LayoutProps> = ({ 
    children, 
    activeTab, 
    setActiveTab, 
    onAddClick, 
    showAddButton,
    isSyncing = false,
    pendingCount = 0
}) => {
    const { t } = useTranslation();

    return (
        <div className="w-full min-h-screen bg-background text-text flex flex-col font-sans relative overflow-x-hidden selection:bg-primary/20">
            {/* Dynamic Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div
                    className="absolute -top-[10%] -right-[10%] w-[80%] h-[80%] rounded-full blur-[140px] opacity-60"
                    style={{ backgroundColor: 'var(--gradient-1)' }}
                />
                <div
                    className="absolute -bottom-[10%] -left-[10%] w-[70%] h-[70%] rounded-full blur-[120px] opacity-50"
                    style={{ backgroundColor: 'var(--gradient-2)' }}
                />
            </div>

            {/* Responsive Content Container */}
            <div className="w-full flex-1 flex flex-col relative z-10 px-4 sm:px-10 lg:px-20 xl:px-40">
                <header className="pt-10 pb-12 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl sm:text-5xl font-black tracking-tighter flex items-center leading-none">
                            <span className="text-text">Smart</span>
                            <span className="text-primary italic ml-2">Inventory</span>
                        </h1>
                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full border border-black/5 dark:border-white/5">
                                <div className={`w-1.5 h-1.5 rounded-full ${navigator.onLine ? 'bg-success' : 'bg-error'} shadow-[0_0_8px_rgba(16,185,129,0.4)]`} />
                                <p className="text-[9px] text-text-dim/60 font-black uppercase tracking-[0.2em]">{navigator.onLine ? 'Online' : 'Offline'}</p>
                            </div>
                            
                            {(pendingCount > 0 || isSyncing) && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full"
                                >
                                    <Cloud size={10} className="text-primary" />
                                    <p className="text-[9px] text-primary font-black uppercase tracking-[0.1em]">
                                        {isSyncing ? 'Syncing...' : `${pendingCount} Pending`}
                                    </p>
                                    {isSyncing && (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                        >
                                            <RefreshCcw size={8} className="text-primary" />
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <AnimatePresence>
                        {showAddButton && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ opacity: 0, scale: 0.5, rotate: 20 }}
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onAddClick}
                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/30 transition-all z-20"
                            >
                                <Plus size={32} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </header>

                <main className="flex-1 w-full pb-36">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="w-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Platform Navigation */}
            <nav className="fixed bottom-8 left-0 right-0 z-[100] flex justify-center px-4">
                <div className="w-full max-w-[500px] bg-surface/80 backdrop-blur-3xl border border-black/5 dark:border-white/5 shadow-2xl rounded-[40px] flex items-center justify-around p-2.5">
                    <NavButton
                        icon={<House size={24} />}
                        label={t('nav_home')}
                        active={activeTab === 'home'}
                        onClick={() => setActiveTab('home')}
                    />
                    <NavButton
                        icon={<Package size={24} />}
                        label={t('nav_products')}
                        active={activeTab === 'products'}
                        onClick={() => setActiveTab('products')}
                    />
                    <NavButton
                        icon={<Activity size={24} />}
                        label={t('nav_activity')}
                        active={activeTab === 'activity'}
                        onClick={() => setActiveTab('activity')}
                    />
                    <NavButton
                        icon={<Settings size={24} />}
                        label={t('nav_settings')}
                        active={activeTab === 'settings'}
                        onClick={() => setActiveTab('settings')}
                    />
                </div>
            </nav>
        </div>
    );
};

interface NavButtonProps {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, active, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="group relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 min-w-[76px]"
        >
            <div className={`p-3.5 rounded-2xl transition-all duration-500 ${active ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105' : 'text-text-dim group-hover:text-text'}`}>
                {icon}
            </div>
            {active && (
                <motion.div
                    layoutId="active-pill"
                    className="absolute -bottom-1.5 w-1.5 h-1.5 bg-primary rounded-full"
                />
            )}
            <span className={`text-[10px] font-black uppercase tracking-widest mt-1.5 transition-all ${active ? 'opacity-100 translate-y-0 text-primary' : 'opacity-0 translate-y-1'}`}>
                {label}
            </span>
        </button>
    );
};

export default Layout;

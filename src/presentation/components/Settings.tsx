/* file:///d:/workspace/inventory-app/src/presentation/components/Settings.tsx */
import React, { useState } from 'react';
import { Languages, Moon, Bell, Info, ShieldCheck, ChevronRight, Sun, ExternalLink, Package, ArrowLeft, Plus, Trash2, Edit2, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MovementStatus } from '../../domain/entities/Product';

interface SettingsProps {
    theme: string;
    setTheme: (theme: string) => void;
    statuses: MovementStatus[];
    onUpdateStatus: (status: MovementStatus) => Promise<void>;
    onDeleteStatus: (id: string) => Promise<void>;
}

type SettingsView = 'main' | 'statuses';

const Settings: React.FC<SettingsProps> = ({ theme, setTheme, statuses, onUpdateStatus, onDeleteStatus }) => {
    const { t, i18n } = useTranslation();
    const [view, setView] = useState<SettingsView>('main');
    const [notifications, setNotifications] = useState(localStorage.getItem('notifications') !== 'false');

    const toggleLanguage = () => i18n.changeLanguage(i18n.language.startsWith('ja') ? 'en' : 'ja');
    const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
    const toggleNotifications = () => {
        const newState = !notifications;
        setNotifications(newState);
        localStorage.setItem('notifications', String(newState));
    };

    return (
        <div className="space-y-10 py-6" id="settings-view">
            <header className="flex items-center gap-4">
                {view !== 'main' && (
                    <button onClick={() => setView('main')} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all text-text-dim hover:text-text">
                        <ArrowLeft size={28} />
                    </button>
                )}
                <div>
                    <h2 className="text-4xl font-bold tracking-tight text-text leading-tight">
                        {view === 'main' ? t('settings_title') : t('settings_movement_status_title')}
                    </h2>
                    <p className="text-text-dim text-lg leading-relaxed font-medium">
                        {view === 'main' ? t('settings_version') : t('settings_status_subtitle')}
                    </p>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {view === 'main' ? (
                    <motion.div
                        key="main"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        <SettingSection title={t('settings_sec_title')}>
                            <SettingItem
                                icon={<Languages className="text-primary" />}
                                label={t('settings_language')}
                                value={i18n.language.startsWith('en') ? 'English' : '日本語'}
                                onClick={toggleLanguage}
                            />
                            <SettingItem
                                icon={theme === 'dark' ? <Moon className="text-primary" /> : <Sun className="text-amber-500" />}
                                label={t('settings_theme')}
                                value={theme === 'dark' ? t('settings_dark') : t('settings_light')}
                                onClick={toggleTheme}
                            />
                        </SettingSection>

                        <SettingSection title={t('settings_sys_title')}>
                            <SettingItem
                                icon={<SettingsIcon className="text-primary" />}
                                label={t('settings_movement_status_title')}
                                value={t('settings_status_manage')}
                                onClick={() => setView('statuses')}
                            />
                            <SettingItem
                                icon={<Bell className={notifications ? 'text-success' : 'text-text-dim'} />}
                                label={t('settings_notifications')}
                                value={notifications ? t('settings_status_enabled') : t('settings_status_disabled')}
                                onClick={toggleNotifications}
                            />
                        </SettingSection>

                        <SettingSection title={t('settings_info_title')}>
                            <SettingItem
                                icon={<Info className="text-text-dim" />}
                                label={t('settings_docs')}
                                value={t('settings_view_wiki')}
                                onClick={() => window.open('https://app.devin.ai/org/bc3-kg/wiki/bc3-kg/smart-inventory', '_blank')}
                            />
                        </SettingSection>
                    </motion.div>
                ) : (
                    <motion.div
                        key="statuses"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="flex justify-end">
                            <button 
                                onClick={() => {
                                    onUpdateStatus({ id: crypto.randomUUID(), name: t('new_status_placeholder'), action: 'ADD', color: 'primary' });
                                }}
                                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                            >
                                <Plus size={18} /> {t('btn_add_status')}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {statuses.map(status => (
                                <StatusCard 
                                    key={status.id} 
                                    status={status} 
                                    onUpdate={onUpdateStatus} 
                                    onDelete={onDeleteStatus} 
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SettingSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-5">
        <h3 className="text-[12px] font-black uppercase tracking-[0.25em] text-text-dim opacity-70 ml-1 leading-none">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const SettingItem = ({ icon, label, value, onClick, disabled }: { icon: any, label: string, value: string, onClick?: () => void, disabled?: boolean }) => (
    <motion.button
        whileTap={disabled ? {} : { scale: 0.98 }}
        whileHover={disabled ? {} : { x: 4 }}
        onClick={onClick}
        className={`w-full card-premium flex items-center gap-5 text-left group border-black/5 dark:border-white/5 hover:border-primary/40 transition-all p-5 ${disabled ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer'}`}
    >
        <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">{icon}</div>
        <div className="flex-1 min-w-0">
            <div className="text-text font-black text-[17px] truncate tracking-tight">{label}</div>
            <div className="text-text-dim text-sm mt-0.5 truncate font-medium">{value}</div>
        </div>
        {!disabled && <ChevronRight size={20} className="text-text-dim/40 group-hover:translate-x-1 group-hover:text-primary transition-all" />}
    </motion.button>
);

const StatusCard = ({ status, onUpdate, onDelete }: { status: MovementStatus, onUpdate: any, onDelete: any }) => {
    const { t } = useTranslation();
    const colors = ['primary', 'secondary', 'success', 'error', 'warning'];
    const actions: ('ADD' | 'SUBTRACT' | 'SET')[] = ['ADD', 'SUBTRACT', 'SET'];

    return (
        <div className="card-premium p-6 flex flex-col md:flex-row items-center gap-6 group hover:border-primary/30 transition-all">
            <div className={`w-14 h-14 rounded-2xl bg-${status.color === 'secondary' ? 'secondary' : status.color}/20 text-${status.color === 'secondary' ? 'secondary' : status.color} flex items-center justify-center font-black text-2xl shadow-inner shrink-0`}>
                {status.name[0] || '?'}
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-dim/60 ml-1 text-center md:text-left block">{t('settings_status_name')}</label>
                    <input 
                        value={status.name}
                        placeholder={t('new_status_placeholder')}
                        onChange={(e) => onUpdate({ ...status, name: e.target.value })}
                        className="input-premium"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-dim/60 ml-1 text-center md:text-left block">{t('settings_action')}</label>
                    <select 
                        value={status.action} 
                        onChange={(e) => onUpdate({ ...status, action: e.target.value })}
                        className="select-premium"
                    >
                        {actions.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-dim/60 ml-1 text-center md:text-left block">{t('settings_color')}</label>
                    <select 
                        value={status.color} 
                        onChange={(e) => onUpdate({ ...status, color: e.target.value })}
                        className="select-premium"
                    >
                        {colors.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            <button 
                onClick={() => confirm(t('confirm_delete')) && onDelete(status.id)}
                className="p-3 text-text-dim/40 hover:text-error hover:bg-error/10 rounded-xl transition-all self-end md:self-center"
            >
                <Trash2 size={24} />
            </button>
        </div>
    );
};

export default Settings;

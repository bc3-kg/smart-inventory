/* file:///d:/workspace/inventory-app/src/presentation/components/Settings.tsx */
import React, { useState, useEffect } from 'react';
import { Languages, Moon, Bell, Info, ShieldCheck, ChevronRight, Sun, ExternalLink, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface SettingsProps {
    theme: string;
    setTheme: (theme: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ theme, setTheme }) => {
    const { t, i18n } = useTranslation();
    const [notifications, setNotifications] = useState(localStorage.getItem('notifications') !== 'false');

    const toggleLanguage = () => {
        const newLang = i18n.language.startsWith('ja') ? 'en' : 'ja';
        i18n.changeLanguage(newLang);
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const toggleNotifications = () => {
        const newState = !notifications;
        setNotifications(newState);
        localStorage.setItem('notifications', String(newState));
    };

    return (
        <div className="space-y-10 py-6" id="settings-view">
            <header className="flex flex-col gap-2">
                <h2 className="text-4xl font-bold tracking-tight text-text leading-tight">{t('settings_title')}</h2>
                <p className="text-text-dim text-lg leading-relaxed font-medium">{t('settings_version')}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                        icon={<Bell className={notifications ? 'text-success' : 'text-text-dim'} />}
                        label={t('settings_notifications')}
                        value={notifications ? t('settings_status_enabled') : t('settings_status_disabled')}
                        onClick={toggleNotifications}
                    />
                    <SettingItem
                        icon={<ShieldCheck className="text-primary" />}
                        label={t('settings_security')}
                        value={t('settings_encryption')}
                        disabled
                    />
                </SettingSection>

                <SettingSection title={t('settings_info_title')}>
                    <SettingItem
                        icon={<Info className="text-text-dim" />}
                        label={t('settings_docs')}
                        value={t('settings_view_wiki')}
                        onClick={() => { }}
                    />
                    <div className="card-premium p-8 flex flex-col items-center justify-center text-center gap-4 border-dashed border-2 border-black/10 dark:border-white/10 bg-transparent">
                        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center shadow-inner">
                            <Package className="text-primary" size={32} />
                        </div>
                        <div>
                            <p className="text-lg font-black text-text">{t('settings_cloud_sync')}</p>
                            <p className="text-[10px] text-text-dim uppercase tracking-[0.3em] font-black mt-1 italic">{t('settings_premium')}</p>
                        </div>
                        <button className="text-sm font-bold text-primary underline underline-offset-4 mt-2 flex items-center gap-2 hover:opacity-80 transition-all">{t('settings_upgrade')} <ExternalLink size={14} /></button>
                    </div>
                </SettingSection>
            </div>
        </div>
    );
};

const SettingSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-5">
        <h3 className="text-[12px] font-black uppercase tracking-[0.25em] text-text-dim opacity-70 ml-1 leading-none">{title}</h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

interface SettingItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    onClick?: () => void;
    disabled?: boolean;
}

const SettingItem = ({ icon, label, value, onClick, disabled }: SettingItemProps) => (
    <motion.button
        whileTap={disabled ? {} : { scale: 0.98 }}
        whileHover={disabled ? {} : { x: 4 }}
        onClick={onClick}
        className={`w-full card-premium flex items-center gap-5 text-left group overflow-hidden border-black/5 dark:border-white/5 hover:border-primary/40 transition-all p-5 ${disabled ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer active:bg-black/5 dark:active:bg-white/5'}`}
    >
        <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
            {icon}
        </div>

        <div className="flex-1 min-w-0">
            <div className="text-text font-black text-[17px] truncate tracking-tight">{label}</div>
            <div className="text-text-dim text-sm mt-0.5 truncate font-medium">{value}</div>
        </div>

        {!disabled && <ChevronRight size={20} className="text-text-dim/40 group-hover:translate-x-1 group-hover:text-primary transition-all" />}
    </motion.button>
);

export default Settings;

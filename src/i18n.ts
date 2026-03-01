/* file:///d:/workspace/inventory-app/src/i18n.ts */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            "app_title": "Smart Inventory",
            "nav_home": "Home",
            "nav_products": "Inventory",
            "nav_activity": "Activity",
            "nav_settings": "Settings",
            "dashboard_title": "General Status",
            "dashboard_subtitle": "Real-time stock monitoring.",
            "stat_unique_items": "Unique Items",
            "stat_low_stock": "Low Stock",
            "inventory_title": "Inventory",
            "search_placeholder": "Search name or SKU...",
            "no_products": "No products found.",
            "activity_title": "Activity",
            "activity_subtitle": "Recent stock movements.",
            "add_product_title": "New Product",
            "form_sku": "SKU / Code",
            "form_name": "Product Name",
            "form_category": "Category",
            "form_unit": "Unit",
            "form_initial_stock": "Initial Stock",
            "form_min_stock": "Min Stock",
            "btn_save": "Save Product",
            "btn_scan": "Scan QR",
            "integration_notice": "Module under integration",
            "unit_un": "Units (un)",
            "unit_kg": "Kilos (kg)",
            "unit_lt": "Liters (lt)",
            "unit_pc": "Pieces (pc)",
            "settings_title": "Settings",
            "settings_language": "Language",
            "settings_theme": "Theme",
            "settings_dark": "Dark View",
            "settings_light": "Light View",
            "settings_notifications": "Notifications",
            "settings_alerts": "Low Stock Alerts",
            "settings_about": "About",
            "settings_version": "Version 1.0.0 (MVP)",
            "settings_sec_title": "Preferences",
            "settings_sys_title": "System",
            "settings_info_title": "Information",
            "settings_status_enabled": "Enabled",
            "settings_status_disabled": "Disabled",
            "settings_security": "Security",
            "settings_encryption": "AES-256 Encryption",
            "settings_docs": "Documentation",
            "settings_view_wiki": "View Internal Wiki",
            "settings_cloud_sync": "Cloud Sync",
            "settings_premium": "Premium Feature",
            "settings_upgrade": "Upgrade Plan"
        }
    },
    ja: {
        translation: {
            "app_title": "Smart在庫管理",
            "nav_home": "ホーム",
            "nav_products": "在庫一覧",
            "nav_activity": "履歴",
            "nav_settings": "設定",
            "dashboard_title": "総合ステータス",
            "dashboard_subtitle": "リアルタイム在庫監視",
            "stat_unique_items": "商品数",
            "stat_low_stock": "在庫不足",
            "inventory_title": "在庫",
            "search_placeholder": "名前やSKUで検索...",
            "no_products": "商品は見つかりませんでした。",
            "activity_title": "アクティビティ",
            "activity_subtitle": "最近の在庫変動",
            "add_product_title": "新規商品登録",
            "form_sku": "SKU / コード",
            "form_name": "商品名",
            "form_category": "カテゴリー",
            "form_unit": "単位",
            "form_initial_stock": "初期在庫量",
            "form_min_stock": "最低在庫量",
            "btn_save": "商品を保存",
            "btn_scan": "QRスキャン",
            "integration_notice": "開発中モジュール",
            "unit_un": "個 (un)",
            "unit_kg": "キログラム (kg)",
            "unit_lt": "リットル (lt)",
            "unit_pc": "ピース (pc)",
            "settings_title": "設定",
            "settings_language": "言語設定",
            "settings_theme": "テーマ",
            "settings_dark": "ダークモード",
            "settings_light": "ライトモード",
            "settings_notifications": "通知",
            "settings_alerts": "在庫不足通知",
            "settings_about": "アプリについて",
            "settings_version": "バージョン 1.0.0 (MVP)",
            "settings_sec_title": "一般設定",
            "settings_sys_title": "システム",
            "settings_info_title": "情報",
            "settings_status_enabled": "有効",
            "settings_status_disabled": "無効",
            "settings_security": "セキュリティ",
            "settings_encryption": "AES-256 暗号化",
            "settings_docs": "ドキュメント",
            "settings_view_wiki": "Wikiを表示",
            "settings_cloud_sync": "クラウド同期",
            "settings_premium": "プレミアム機能",
            "settings_upgrade": "プランをアップグレード"
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;

/* file:///d:/workspace/inventory-app/src/App.tsx */
import React, { useState } from 'react';
import Layout from './presentation/components/Layout';
import Dashboard from './presentation/components/Dashboard';
import ProductList from './presentation/components/ProductList';
import ProductForm from './presentation/components/ProductForm';
import ActivityLog from './presentation/components/ActivityLog';
import Settings from './presentation/components/Settings';
import { useInventory } from './presentation/hooks/useInventory';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'home' | 'products' | 'activity' | 'settings'>('home');
    const [showAddForm, setShowAddForm] = useState(false);
    const { products, isLoading, error, addProduct } = useInventory();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    React.useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleAddProduct = async (data: any) => {
        try {
            await addProduct(data);
            setShowAddForm(false);
            setActiveTab('products');
        } catch (err) {
            // Error is handled by hook
        }
    };

    return (
        <>
            <Layout activeTab={activeTab} setActiveTab={setActiveTab} onAddClick={() => setShowAddForm(true)}>
                {activeTab === 'home' && <Dashboard products={products} isLoading={isLoading} />}
                {activeTab === 'products' && <ProductList products={products} isLoading={isLoading} />}
                {activeTab === 'activity' && <ActivityLog />}
                {activeTab === 'settings' && <Settings theme={theme} setTheme={setTheme} />}
            </Layout>

            {/* Modal Overlay */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm"
                    >
                        <div className="w-full max-w-md">
                            <ProductForm onSave={handleAddProduct} onCancel={() => setShowAddForm(false)} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default App;

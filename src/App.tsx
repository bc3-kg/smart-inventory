/* file:///d:/workspace/inventory-app/src/App.tsx */
import React, { useState } from 'react';
import Layout from './presentation/components/Layout';
import Dashboard from './presentation/components/Dashboard';
import ProductList from './presentation/components/ProductList';
import ActivityLog from './presentation/components/ActivityLog';
import Settings from './presentation/components/Settings';
import { useInventory } from './presentation/hooks/useInventory';
import { motion, AnimatePresence } from 'framer-motion';
import StockUpdateForm from './presentation/components/StockUpdateForm';
import ProductForm from './presentation/components/ProductForm';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'home' | 'products' | 'activity' | 'settings'>('home');
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newProductSku, setNewProductSku] = useState('');
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const { products, statuses, movements, isLoading, error, addProduct, updateStock, updateStatus, deleteStatus } = useInventory();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    const handleNavigate = (tab: 'dashboard' | 'products' | 'activity', filter?: string) => {
        setActiveTab(tab === 'dashboard' ? 'home' : tab);
        if (filter) {
            setActiveFilter(filter);
        } else {
            setActiveFilter(null);
        }
    };

    React.useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);


    const handleUpdateStock = async (data: any) => {
        try {
            await updateStock({
                productId: selectedProduct.id,
                ...data
            });
            setSelectedProduct(null);
        } catch (err) { }
    };

    const handleAddProduct = async (data: any) => {
        try {
            await addProduct(data);
            setShowAddForm(false);
            setNewProductSku('');
        } catch (err) { }
    };

    const handleQuickAdd = (sku: string) => {
        setNewProductSku(sku);
        setShowAddForm(true);
    };

    return (
        <>
            <Layout 
                activeTab={activeTab} 
                setActiveTab={(tab) => {
                    setActiveTab(tab);
                    setActiveFilter(null);
                }} 
                onAddClick={() => {}}
                showAddButton={false}
            >
                {activeTab === 'home' && <Dashboard products={products} movements={movements} isLoading={isLoading} onNavigate={handleNavigate} />}
                {activeTab === 'products' && (
                    <ProductList 
                        products={products} 
                        isLoading={isLoading} 
                        onProductClick={(p) => setSelectedProduct(p)} 
                        onEnterEmpty={handleQuickAdd}
                        initialFilter={activeFilter}
                        onClearFilter={() => setActiveFilter(null)}
                    />
                )}
                {activeTab === 'activity' && <ActivityLog movements={movements} products={products} statuses={statuses} />}
                {activeTab === 'settings' && (
                    <Settings 
                        theme={theme} 
                        setTheme={setTheme} 
                        statuses={statuses} 
                        onUpdateStatus={updateStatus} 
                        onDeleteStatus={deleteStatus}
                    />
                )}
            </Layout>

            {/* Modal Overlays */}
            <AnimatePresence>

                {selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm"
                    >
                        <div className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto custom-scrollbar">
                            <StockUpdateForm 
                                product={selectedProduct} 
                                statuses={statuses}
                                onSave={handleUpdateStock} 
                                onCancel={() => setSelectedProduct(null)} 
                            />
                        </div>
                    </motion.div>
                )}

                {showAddForm && (
                   <motion.div
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0 }}
                       className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
                   >
                       <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowAddForm(false)} />
                       <div className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto custom-scrollbar">
                           <ProductForm 
                               initialSku={newProductSku}
                               onSave={handleAddProduct}
                               onCancel={() => setShowAddForm(false)}
                           />
                       </div>
                   </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};


export default App;

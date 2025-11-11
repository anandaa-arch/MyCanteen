// app/admin/inventory/page.js
'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  ArrowLeft,
  Plus,
  AlertTriangle,
  Loader,
  BarChart3
} from 'lucide-react';

import ExpenseTable from '../../inventory/components/ExpenseTable';
import InventoryTable from '../../inventory/components/InventoryTable';
import ExpenseForm from '../../inventory/components/ExpenseForm';
import InventoryItemForm from '../../inventory/components/InventoryItemForm';
import { InventoryErrorBoundary } from '@/components/PageErrorBoundary';

function InventoryManagementPageContent() {

  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState({
    totalItems: 0,
    monthlyExpenses: 0,
    monthlyRevenue: 0,
    lowStockItems: 0,
    totalInventoryValue: 0,
    outOfStockItems: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard statistics
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch inventory items
      const inventoryRes = await fetch('/api/inventory-items');
      const inventoryData = inventoryRes.ok ? await inventoryRes.json() : [];
      
      // Fetch expenses for current month
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const expensesRes = await fetch(`/api/expenses?from=${currentMonth}-01&to=${currentMonth}-31`);
      const expensesData = expensesRes.ok ? await expensesRes.json() : [];
      
      // Calculate stats
      const totalItems = inventoryData.length;
      const monthlyExpenses = expensesData.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
      
      let lowStockItems = 0;
      let outOfStockItems = 0;
      let totalInventoryValue = 0;
      
      inventoryData.forEach(item => {
        const stock = item.current_stock || 0;
        const minStock = item.min_stock || 10;
        const unitPrice = item.unit_price || 0;
        
        totalInventoryValue += stock * unitPrice;
        
        if (stock === 0) {
          outOfStockItems++;
        } else if (stock <= minStock) {
          lowStockItems++;
        }
      });

      setDashboardStats({
        totalItems,
        monthlyExpenses,
        monthlyRevenue: 0, // TODO: Calculate from sales/revenue API
        lowStockItems,
        totalInventoryValue,
        outOfStockItems
      });
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'expenses', label: 'Expenses', icon: DollarSign },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'add-expense', label: 'Add Expense', icon: Plus },
    { id: 'add-inventory', label: 'Add Item', icon: Plus },
  ];

  const StatCard = ({ title, value, icon: Icon, color, bgColor, textColor, loading }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center">
        <div className={`p-2 sm:p-3 rounded-lg ${bgColor} flex-shrink-0`}>
          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${color}`} />
        </div>
        <div className="ml-3 sm:ml-4 min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className={`text-lg sm:text-2xl font-bold ${textColor} truncate`}>
            {loading ? (
              <Loader className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
            ) : (
              value
            )}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile Optimized */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-0 sm:h-16 sm:flex sm:items-center">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base self-start"
              >
                <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </button>
              <div className="sm:border-l sm:border-gray-300 sm:pl-4">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                  Inventory & Expense Management
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                  Manage inventory, track expenses, and monitor business operations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Mobile Optimized */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex space-x-2 sm:space-x-8 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.replace('Add ', '')}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 px-1">Business Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <StatCard
                  title="Total Items"
                  value={dashboardStats.totalItems}
                  icon={Package}
                  color="text-blue-600"
                  bgColor="bg-blue-100"
                  textColor="text-gray-900"
                  loading={loading}
                />
                
                <StatCard
                  title="Monthly Expenses"
                  value={formatCurrency(dashboardStats.monthlyExpenses)}
                  icon={DollarSign}
                  color="text-red-600"
                  bgColor="bg-red-100"
                  textColor="text-gray-900"
                  loading={loading}
                />
                
                <StatCard
                  title="Inventory Value"
                  value={formatCurrency(dashboardStats.totalInventoryValue)}
                  icon={TrendingUp}
                  color="text-green-600"
                  bgColor="bg-green-100"
                  textColor="text-gray-900"
                  loading={loading}
                />
                
                <StatCard
                  title="Low Stock Items"
                  value={dashboardStats.lowStockItems}
                  icon={AlertTriangle}
                  color="text-yellow-600"
                  bgColor="bg-yellow-100"
                  textColor={dashboardStats.lowStockItems > 0 ? "text-yellow-600" : "text-gray-900"}
                  loading={loading}
                />
              </div>
            </div>

            {/* Alert Section */}
            {(dashboardStats.lowStockItems > 0 || dashboardStats.outOfStockItems > 0) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Stock Alerts</h3>
                    <div className="text-sm text-yellow-700">
                      {dashboardStats.outOfStockItems > 0 && (
                        <span>{dashboardStats.outOfStockItems} items are out of stock. </span>
                      )}
                      {dashboardStats.lowStockItems > 0 && (
                        <span>{dashboardStats.lowStockItems} items are running low. </span>
                      )}
                      <button 
                        onClick={() => setActiveTab('inventory')}
                        className="underline hover:no-underline"
                      >
                        View inventory →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 px-1">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <button
                  onClick={() => setActiveTab('add-expense')}
                  className="flex items-center gap-3 p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow active:scale-95"
                >
                  <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-medium text-sm sm:text-base text-gray-900 truncate">Add Expense</div>
                    <div className="text-xs sm:text-sm text-gray-500 truncate">Record new expense</div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('add-inventory')}
                  className="flex items-center gap-3 p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow active:scale-95"
                >
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-medium text-sm sm:text-base text-gray-900 truncate">Add Item</div>
                    <div className="text-xs sm:text-sm text-gray-500 truncate">Add inventory item</div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('expenses')}
                  className="flex items-center gap-3 p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow active:scale-95"
                >
                  <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-medium text-sm sm:text-base text-gray-900 truncate">View Expenses</div>
                    <div className="text-xs sm:text-sm text-gray-500 truncate">Expense reports</div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('inventory')}
                  className="flex items-center gap-3 p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow active:scale-95"
                >
                  <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-medium text-sm sm:text-base text-gray-900 truncate">View Inventory</div>
                    <div className="text-xs sm:text-sm text-gray-500 truncate">Manage stock</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Expense Management</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Track and manage all business expenses</p>
              </div>
              <button
                onClick={() => setActiveTab('add-expense')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors active:scale-95 self-start sm:self-auto"
              >
                <Plus size={16} />
                <span>Add Expense</span>
              </button>
            </div>
            <ExpenseTable />
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Inventory Management</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Manage stock levels and inventory items</p>
              </div>
              <button
                onClick={() => setActiveTab('add-inventory')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors active:scale-95 self-start sm:self-auto"
              >
                <Plus size={16} />
                <span>Add Item</span>
              </button>
            </div>
            <InventoryTable />
          </div>
        )}

        {activeTab === 'add-expense' && (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Add New Expense</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Record a new business expense</p>
              </div>
              <button
                onClick={() => setActiveTab('expenses')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors active:scale-95 self-start sm:self-auto"
              >
                <span>View All Expenses</span>
              </button>
            </div>
            <div className="max-w-2xl">
              <ExpenseForm 
                onAdded={() => {
                  fetchDashboardStats(); // Refresh stats
                  setActiveTab('expenses'); // Navigate to expenses view
                }} 
              />
            </div>
          </div>
        )}

        {activeTab === 'add-inventory' && (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Add New Item</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Add a new item to your inventory</p>
              </div>
              <button
                onClick={() => setActiveTab('inventory')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors active:scale-95 self-start sm:self-auto"
              >
                <span>View All Items</span>
              </button>
            </div>
            <div className="max-w-2xl">
              <InventoryItemForm 
                onAdded={() => {
                  fetchDashboardStats(); // Refresh stats
                  setActiveTab('inventory'); // Navigate to inventory view
                }} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InventoryManagementPage() {
  return (
    <InventoryErrorBoundary>
      <InventoryManagementPageContent />
    </InventoryErrorBoundary>
  );
}

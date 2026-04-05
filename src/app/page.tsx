'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { View, Product, Customer, Supplier, Sale, Purchase, Expense, AppSettings, User, AuditLog } from '@/types';
import Dashboard from '@/components/dokan/Dashboard';
import POS from '@/components/dokan/POS';
import ScannerPOS from '@/components/dokan/ScannerPOS';
import Inventory from '@/components/dokan/Inventory';
import People from '@/components/dokan/People';
import Accounting from '@/components/dokan/Accounting';
import Reports from '@/components/dokan/Reports';
import Purchases from '@/components/dokan/Purchases';
import SalesHistory from '@/components/dokan/SalesHistory';
import Settings from '@/components/dokan/Settings';
import Login from '@/components/dokan/Login';
import ActivityLogs from '@/components/dokan/ActivityLogs';
import PrintReceipt from '@/components/dokan/PrintReceipt';
import Support from '@/components/dokan/Support';
import AppLayout, { NavItem } from '@/components/layout/AppLayout';
import { Toaster } from '@/components/ui/sonner';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  History, 
  ShoppingBag, 
  Users, 
  Truck, 
  Calculator, 
  BarChart3, 
  Settings as SettingsIcon,
  Scan,
  Activity,
  HelpCircle,
  Sparkles
} from 'lucide-react';

function AppContent() {
  const { language, setLanguage, t, isBangla } = useLanguage();
  // Persist active view across refreshes
  const [activeView, setActiveViewState] = useState<View>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dokan_active_view');
      if (saved) return saved as View;
    }
    return 'dashboard';
  });
  const setActiveView = (view: View) => {
    setActiveViewState(view);
    localStorage.setItem('dokan_active_view', view);
  };
  const [liveTime, setLiveTime] = useState(new Date());
  
  // Live clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Format time in Bangla or English
  const formatLiveTime = useCallback(() => {
    if (isBangla) {
      const banglaNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      const hours = liveTime.getHours();
      const minutes = liveTime.getMinutes();
      const seconds = liveTime.getSeconds();
      const period = hours >= 12 ? 'পিএম' : 'এএম';
      const displayHours = hours % 12 || 12;
      
      const toBangla = (num: number) => String(num).split('').map(d => banglaNumerals[parseInt(d)]).join('');
      
      return `${toBangla(displayHours)}:${toBangla(minutes.toString().padStart(2, '0'))}:${toBangla(seconds.toString().padStart(2, '0'))} ${period}`;
    }
    return liveTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }, [isBangla, liveTime]);
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: string; username: string; permissions?: Record<string, boolean> } | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Loading screen settings
  const [loadingSettings, setLoadingSettings] = useState<{
    shopName: string;
    shopLogo: string;
    shopBio: string;
    loadingText: string;
    loadingTitle: string;
    loadingSubtitle: string;
    loadingAnimationType: string;
  } | null>(null);
  
  const [hasLoadedCache, setHasLoadedCache] = useState(false);
  
  const defaultLoadingSettings = {
    shopName: 'Dokan',
    shopLogo: '',
    shopBio: 'Smart Shop Management',
    loadingText: 'Loading...',
    loadingTitle: 'Dokan',
    loadingSubtitle: 'Smart Shop Management',
    loadingAnimationType: 'spinner',
  };
  
  // Data states
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [lastCompletedSale, setLastCompletedSale] = useState<Sale | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('dokan_user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('dokan_user');
      }
    }
    setIsCheckingAuth(false);
  }, []);

  // Load cached loading settings
  useEffect(() => {
    if (hasLoadedCache) return;
    
    try {
      const cached = localStorage.getItem('dokan_loading_settings');
      const customSettings = localStorage.getItem('dokan_custom_loading');
      
      let customData: { title?: string; subtitle?: string; animation?: string } = {};
      if (customSettings) {
        try {
          customData = JSON.parse(customSettings);
        } catch {}
      }
      
      if (cached) {
        const cachedData = JSON.parse(cached);
        setLoadingSettings({
          ...defaultLoadingSettings,
          ...cachedData,
          loadingTitle: customData.title || cachedData.loadingTitle || cachedData.shopName || defaultLoadingSettings.loadingTitle,
          loadingSubtitle: customData.subtitle || cachedData.loadingSubtitle || cachedData.shopBio || defaultLoadingSettings.loadingSubtitle,
          loadingAnimationType: customData.animation || cachedData.loadingAnimationType || defaultLoadingSettings.loadingAnimationType,
        });
      } else {
        setLoadingSettings({
          ...defaultLoadingSettings,
          loadingTitle: customData.title || defaultLoadingSettings.loadingTitle,
          loadingSubtitle: customData.subtitle || defaultLoadingSettings.loadingSubtitle,
          loadingAnimationType: customData.animation || defaultLoadingSettings.loadingAnimationType,
        });
      }
      setHasLoadedCache(true);
    } catch {
      setLoadingSettings(defaultLoadingSettings);
      setHasLoadedCache(true);
    }
  }, [hasLoadedCache]);

  // Fetch loading settings
  useEffect(() => {
    const fetchLoadingSettings = async () => {
      try {
        const res = await fetch('/api/loading-settings?t=' + Date.now());
        const data = await res.json();
        
        const customSettings = localStorage.getItem('dokan_custom_loading');
        if (customSettings) {
          try {
            const custom = JSON.parse(customSettings);
            if (custom.title) data.loadingTitle = custom.title;
            if (custom.subtitle) data.loadingSubtitle = custom.subtitle;
            if (custom.animation) data.loadingAnimationType = custom.animation;
          } catch {}
        }
        
        setLoadingSettings(data);
        localStorage.setItem('dokan_loading_settings', JSON.stringify(data));
      } catch (error) {
        console.error('Failed to fetch loading settings:', error);
      }
    };
    fetchLoadingSettings();
  }, []);

  const handleLogin = (user: { id: string; name: string; email: string; role: string; username: string; permissions?: Record<string, boolean> }) => {
    setCurrentUser(user);
    localStorage.setItem('dokan_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    localStorage.removeItem('dokan_user');
    setCurrentUser(null);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const hasSeeded = sessionStorage.getItem('dokan_seeded');
      if (!hasSeeded) {
        await fetch('/api/seed', { method: 'POST' });
        sessionStorage.setItem('dokan_seeded', 'true');
      }
      
      const [settingsRes, usersRes, productsRes, customersRes, suppliersRes, salesRes, purchasesRes, expensesRes, categoriesRes] = await Promise.all([
        fetch('/api/settings?t=' + Date.now()),
        fetch('/api/users'),
        fetch('/api/products'),
        fetch('/api/customers'),
        fetch('/api/suppliers'),
        fetch('/api/sales'),
        fetch('/api/purchases'),
        fetch('/api/expenses'),
        fetch('/api/categories'),
      ]);

      // Safe JSON parsing — API routes may return HTML on error
      const safeJson = async (res: Response) => {
        try {
          const text = await res.text();
          if (!text || text.startsWith('<')) return null;
          return JSON.parse(text);
        } catch {
          return null;
        }
      };

      const [settingsData, usersData, productsData, customersData, suppliersData, salesData, purchasesData, expensesData, categoriesData] = await Promise.all([
        safeJson(settingsRes),
        safeJson(usersRes),
        safeJson(productsRes),
        safeJson(customersRes),
        safeJson(suppliersRes),
        safeJson(salesRes),
        safeJson(purchasesRes),
        safeJson(expensesRes),
        safeJson(categoriesRes),
      ]);

      setSettings(settingsData || null);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setCustomers(Array.isArray(customersData) ? customersData : []);
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
      setSales(Array.isArray(salesData) ? salesData : []);
      setPurchases(Array.isArray(purchasesData) ? purchasesData : []);
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData.map((c: { name: string }) => c.name) : []);
      
      if (settingsData?.shopName) {
        document.title = `${settingsData.shopName} - POS & Inventory`;
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (settings?.shopName) {
      document.title = `${settings.shopName} - POS & Inventory`;
    }
  }, [settings?.shopName]);

  const getAuthHeaders = useCallback((contentType = true): Record<string, string> => {
    const headers: Record<string, string> = {};
    if (contentType) headers['Content-Type'] = 'application/json';
    if (currentUser?.id) headers['x-user-id'] = currentUser.id;
    if (currentUser?.name) headers['x-user-name'] = currentUser.name;
    if (currentUser?.role) headers['x-user-role'] = currentUser.role;
    return headers;
  }, [currentUser]);

  // API handlers
  const handleAddProduct = useCallback(async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('Adding product:', product.name, product.sku, product.category);
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(product),
      });
      
      if (!res.ok) {
        let errorMsg = 'Failed to add product';
        try {
          const errorData = await res.json();
          errorMsg = errorData.details || errorData.error || JSON.stringify(errorData);
          console.error('Add product failed:', errorData);
        } catch {
          errorMsg = `HTTP ${res.status}: ${res.statusText}`;
          console.error('Add product failed - status:', res.status, res.statusText);
        }
        return { success: false, error: errorMsg };
      }
      
      const newProduct = await res.json();
      setProducts(prev => [newProduct, ...prev]);
      return { success: true, data: newProduct };
    } catch (error) {
      console.error('Add product error:', error);
      return { success: false, error: String(error) };
    }
  }, [getAuthHeaders]);

  const handleUpdateProduct = useCallback(async (id: string, product: Partial<Product>) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(product),
      });
      
      if (!res.ok) {
        let errorMsg = 'Failed to update product';
        try {
          const errorData = await res.json();
          errorMsg = errorData.details || errorData.error || JSON.stringify(errorData);
          console.error('Update product failed:', errorData);
        } catch {
          errorMsg = `HTTP ${res.status}: ${res.statusText}`;
        }
        return { success: false, error: errorMsg };
      }
      
      const updatedProduct = await res.json();
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
      return { success: true, data: updatedProduct };
    } catch (error) {
      console.error('Update product error:', error);
      return { success: false, error: String(error) };
    }
  }, [getAuthHeaders]);

  const handleDeleteProduct = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders(false),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Delete product failed:', errorData);
        return false;
      }
      
      setProducts(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (error) {
      console.error('Delete product error:', error);
      return false;
    }
  }, [getAuthHeaders]);

  const handleAddCustomer = useCallback(async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(customer),
    });
    const newCustomer = await res.json();
    setCustomers(prev => [newCustomer, ...prev]);
  }, [getAuthHeaders]);

  const handleUpdateCustomer = useCallback(async (id: string, customer: Partial<Customer>) => {
    await fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(customer),
    });
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...customer } : c));
  }, [getAuthHeaders]);

  const handleDeleteCustomer = useCallback(async (id: string) => {
    await fetch(`/api/customers/${id}`, { 
      method: 'DELETE',
      headers: getAuthHeaders(false),
    });
    setCustomers(prev => prev.filter(c => c.id !== id));
  }, [getAuthHeaders]);

  const handleAddSupplier = useCallback(async (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await fetch('/api/suppliers', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(supplier),
    });
    const newSupplier = await res.json();
    setSuppliers(prev => [newSupplier, ...prev]);
  }, [getAuthHeaders]);

  const handleDeleteSupplier = useCallback(async (id: string) => {
    await fetch(`/api/suppliers/${id}`, { 
      method: 'DELETE',
      headers: getAuthHeaders(false),
    });
    setSuppliers(prev => prev.filter(s => s.id !== id));
  }, [getAuthHeaders]);

  const handleAddSale = useCallback(async (sale: Sale) => {
    try {
      const saleWithSalesman = {
        ...sale,
        createdByName: currentUser?.name || 'System',
        salesmanName: currentUser?.name || 'System',
        createdBy: currentUser?.id,
        salesmanId: currentUser?.id,
      };
      
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(saleWithSalesman),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Sale creation failed:', errorData);
        return;
      }
      
      const newSale = await res.json();
      setSales(prev => [newSale, ...prev]);
      
      setProducts(prev => prev.map(p => {
        const soldItem = sale.items.find(item => item.productId === p.id);
        if (soldItem) {
          return { ...p, stock: Math.max(0, p.stock - soldItem.quantity) };
        }
        return p;
      }));
      
      if (sale.due > 0 && sale.customerId && sale.customerId !== 'walk-in') {
        setCustomers(prev => prev.map(c => {
          if (c.id === sale.customerId) {
            const newDue = c.due + sale.due;
            fetch(`/api/customers/${sale.customerId}`, {
              method: 'PUT',
              headers: getAuthHeaders(),
              body: JSON.stringify({ due: newDue }),
            }).catch(err => console.error('Failed to update customer due:', err));
            return { ...c, due: newDue };
          }
          return c;
        }));
      }
      
      setLastCompletedSale(newSale);
      setShowPrintDialog(true);
      
    } catch (error) {
      console.error('Sale creation error:', error);
    }
  }, [getAuthHeaders, currentUser]);

  const handleDeleteSale = useCallback(async (id: string) => {
    const sale = sales.find(s => s.id === id);
    
    await fetch(`/api/sales/${id}`, { 
      method: 'DELETE',
      headers: getAuthHeaders(false),
    });
    setSales(prev => prev.filter(s => s.id !== id));
    
    if (sale) {
      setProducts(prev => prev.map(p => {
        const soldItem = sale.items.find(item => item.productId === p.id);
        if (soldItem) {
          return { ...p, stock: p.stock + soldItem.quantity };
        }
        return p;
      }));
      
      if (sale.due > 0 && sale.customerId !== 'walk-in') {
        setCustomers(prev => prev.map(c => {
          if (c.id === sale.customerId) {
            const newDue = Math.max(0, c.due - sale.due);
            fetch(`/api/customers/${sale.customerId}`, {
              method: 'PUT',
              headers: getAuthHeaders(),
              body: JSON.stringify({ due: newDue }),
            }).catch(err => console.error('Failed to update customer due:', err));
            return { ...c, due: newDue };
          }
          return c;
        }));
      }
    }
  }, [sales, getAuthHeaders]);

  const handleUpdateSale = useCallback(async (id: string, updatedSale: Partial<Sale>) => {
    const oldSale = sales.find(s => s.id === id);
    if (!oldSale) return;

    const res = await fetch(`/api/sales/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updatedSale),
    });
    
    const updatedData = await res.json();
    
    setSales(prev => prev.map(s => {
      if (s.id === id) {
        return { 
          ...s, 
          ...updatedSale,
          payments: updatedData.payments || s.payments || [],
          history: updatedData.history || s.history || [],
        };
      }
      return s;
    }));

    if (updatedSale.due !== undefined && oldSale.customerId !== 'walk-in') {
      const oldDue = oldSale.due || 0;
      const newDue = updatedSale.due || 0;
      const dueDiff = newDue - oldDue;
      
      if (dueDiff !== 0) {
        const customer = customers.find(c => c.id === oldSale.customerId);
        if (customer) {
          await handleUpdateCustomer(oldSale.customerId, { due: Math.max(0, customer.due + dueDiff) });
        }
      }
    }
  }, [sales, customers, handleUpdateCustomer, getAuthHeaders]);

  const handleAddPurchase = useCallback(async (purchase: Omit<Purchase, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await fetch('/api/purchases', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(purchase),
    });
    const newPurchase = await res.json();
    setPurchases(prev => [newPurchase, ...prev]);
    
    if (purchase.items && purchase.items.length > 0) {
      setProducts(prev => prev.map(p => {
        const purchasedItem = purchase.items.find(item => item.productId === p.id);
        if (purchasedItem) {
          return { ...p, stock: p.stock + purchasedItem.quantity };
        }
        return p;
      }));
    }
    
    if (purchase.balance > 0 && purchase.supplierId) {
      setSuppliers(prev => prev.map(s => {
        if (s.id === purchase.supplierId) {
          const newBalance = (s.balance || 0) + purchase.balance;
          fetch(`/api/suppliers/${purchase.supplierId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ balance: newBalance }),
          }).catch(err => console.error('Failed to update supplier balance:', err));
          return { ...s, balance: newBalance };
        }
        return s;
      }));
    }
  }, [getAuthHeaders]);

  const handleDeletePurchase = useCallback(async (id: string) => {
    const purchase = purchases.find(p => p.id === id);
    
    await fetch(`/api/purchases/${id}`, { 
      method: 'DELETE',
      headers: getAuthHeaders(false),
    });
    setPurchases(prev => prev.filter(p => p.id !== id));
    
    if (purchase) {
      setProducts(prev => prev.map(p => {
        const purchasedItem = purchase.items.find(item => item.productId === p.id);
        if (purchasedItem) {
          return { ...p, stock: Math.max(0, p.stock - purchasedItem.quantity) };
        }
        return p;
      }));
      
      if (purchase.balance > 0 && purchase.supplierId) {
        setSuppliers(prev => prev.map(s => {
          if (s.id === purchase.supplierId) {
            const newBalance = Math.max(0, (s.balance || 0) - purchase.balance);
            fetch(`/api/suppliers/${purchase.supplierId}`, {
              method: 'PUT',
              headers: getAuthHeaders(),
              body: JSON.stringify({ balance: newBalance }),
            }).catch(err => console.error('Failed to update supplier balance:', err));
            return { ...s, balance: newBalance };
          }
          return s;
        }));
      }
    }
  }, [purchases, getAuthHeaders]);

  const handleUpdatePurchase = useCallback(async (id: string, purchase: Partial<Purchase>, auditLog?: Partial<AuditLog>) => {
    const oldPurchase = purchases.find(p => p.id === id);
    
    const res = await fetch('/api/purchases', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, ...purchase, auditLog }),
    });
    
    const updatedData = await res.json();
    
    setPurchases(prev => prev.map(p => {
      if (p.id === id) {
        return { 
          ...p, 
          ...purchase,
          payments: updatedData.payments || p.payments || [],
        };
      }
      return p;
    }));
    
    if (purchase.balance !== undefined && oldPurchase && oldPurchase.supplierId) {
      const oldBalance = oldPurchase.balance || 0;
      const newBalance = purchase.balance || 0;
      const balanceDiff = newBalance - oldBalance;
      
      if (balanceDiff !== 0 && oldPurchase.supplierId) {
        setSuppliers(prev => prev.map(s => {
          if (s.id === oldPurchase.supplierId) {
            const updatedBalance = Math.max(0, (s.balance || 0) + balanceDiff);
            fetch(`/api/suppliers/${oldPurchase.supplierId}`, {
              method: 'PUT',
              headers: getAuthHeaders(),
              body: JSON.stringify({ balance: updatedBalance }),
            }).catch(err => console.error('Failed to update supplier balance:', err));
            return { ...s, balance: updatedBalance };
          }
          return s;
        }));
      }
    }
  }, [purchases, getAuthHeaders]);

  const handleAddExpense = useCallback(async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(expense),
    });
    const newExpense = await res.json();
    setExpenses(prev => [newExpense, ...prev]);
  }, [getAuthHeaders]);

  const handleUpdateExpense = useCallback(async (id: string, expense: Partial<Expense>) => {
    const res = await fetch('/api/expenses', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, ...expense }),
    });
    const updatedExpense = await res.json();
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updatedExpense } : e));
  }, [getAuthHeaders]);

  const handleDeleteExpense = useCallback(async (id: string) => {
    await fetch(`/api/expenses?id=${id}`, { 
      method: 'DELETE',
      headers: getAuthHeaders(false),
    });
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, [getAuthHeaders]);

  const handleUpdateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    const payload = { ...settings, ...newSettings };
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const updated = await res.json();
    setSettings(updated);
  }, [settings, getAuthHeaders]);

  const handleAddUser = useCallback(async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(user),
    });
    const newUser = await res.json();
    setUsers(prev => [newUser, ...prev]);
  }, [getAuthHeaders]);

  const handleUpdateUser = useCallback(async (id: string, user: Partial<User>) => {
    await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(user),
    });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...user } : u));
  }, [getAuthHeaders]);

  const handleDeleteUser = useCallback(async (id: string) => {
    await fetch(`/api/users/${id}`, { 
      method: 'DELETE',
      headers: getAuthHeaders(false),
    });
    setUsers(prev => prev.filter(u => u.id !== id));
  }, [getAuthHeaders]);

  const handleAddCategory = useCallback(async (category: string) => {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name: category }),
    });
    if (res.ok) {
      setCategories(prev => [...prev, category]);
    }
  }, [getAuthHeaders]);

  const handleDeleteCategory = useCallback(async (category: string) => {
    const res = await fetch(`/api/categories?name=${encodeURIComponent(category)}`, { 
      method: 'DELETE',
      headers: getAuthHeaders(false),
    });
    if (res.ok) {
      setCategories(prev => prev.filter(c => c !== category));
    }
  }, [getAuthHeaders]);

  // Check if user has permission
  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'Master Admin') return true;
    return currentUser.permissions?.[permission] === true;
  };

  // Navigation items
  const allNavItems: NavItem[] = [
    { view: 'dashboard', label: t('common.dashboard'), icon: <LayoutDashboard className="w-5 h-5" />, gradient: 'from-violet-500 to-purple-600' },
    { view: 'pos-scanner', label: t('common.scanner_pos'), icon: <Scan className="w-5 h-5" />, permission: 'pos_access', gradient: 'from-emerald-500 to-teal-600' },
    { view: 'pos', label: t('common.standard_pos'), icon: <ShoppingCart className="w-5 h-5" />, permission: 'pos_access', gradient: 'from-cyan-500 to-teal-600' },
    { view: 'inventory', label: t('common.inventory'), icon: <Package className="w-5 h-5" />, permission: 'inventory_view', gradient: 'from-amber-500 to-orange-600' },
    { view: 'sales', label: t('common.sales_history'), icon: <History className="w-5 h-5" />, permission: 'sales_view', gradient: 'from-green-500 to-emerald-600' },
    { view: 'purchases', label: t('common.purchases'), icon: <ShoppingBag className="w-5 h-5" />, permission: 'purchases_view', gradient: 'from-rose-500 to-pink-600' },
    { view: 'customers', label: t('common.customers'), icon: <Users className="w-5 h-5" />, permission: 'customers_view', gradient: 'from-fuchsia-500 to-pink-600' },
    { view: 'suppliers', label: t('common.suppliers'), icon: <Truck className="w-5 h-5" />, permission: 'suppliers_view', gradient: 'from-sky-500 to-cyan-600' },
    { view: 'accounting', label: t('common.accounting'), icon: <Calculator className="w-5 h-5" />, permission: 'accounting_view', gradient: 'from-teal-500 to-emerald-600' },
    { view: 'reports', label: t('common.reports'), icon: <BarChart3 className="w-5 h-5" />, permission: 'reports_view', gradient: 'from-cyan-500 to-teal-600' },
    { view: 'settings', label: t('common.settings'), icon: <SettingsIcon className="w-5 h-5" />, permission: 'settings_view', gradient: 'from-slate-500 to-gray-600' },
    { view: 'activity-logs', label: t('common.activity_logs') || 'Activity Logs', icon: <Activity className="w-5 h-5" />, permission: 'activity_logs', gradient: 'from-violet-500 to-purple-600' },
    { view: 'support', label: t('common.support') || 'Support', icon: <HelpCircle className="w-5 h-5" />, gradient: 'from-teal-500 to-cyan-600' },
  ];

  const navItems = allNavItems.filter(item => !item.permission || hasPermission(item.permission));

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': 
        return <Dashboard sales={sales} purchases={purchases} products={products} customers={customers} suppliers={suppliers} expenses={expenses} settings={settings} />;
      case 'inventory': 
        return (
          <Inventory 
            products={products} 
            categories={categories} 
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            currentUserRole={currentUser?.role}
            currentUserPermissions={currentUser?.permissions}
          />
        );
      case 'pos':
        return <POS products={products} customers={customers} categories={categories} settings={settings} onComplete={handleAddSale} onAddCustomer={handleAddCustomer} />;
      case 'pos-scanner':
        return <ScannerPOS products={products} customers={customers} settings={settings} onComplete={handleAddSale} onAddCustomer={handleAddCustomer} />;
      case 'sales': 
        return (
          <SalesHistory 
            sales={sales} 
            products={products} 
            customers={customers} 
            purchases={purchases}
            suppliers={suppliers}
            onDeleteSale={handleDeleteSale} 
            onUpdateSale={handleUpdateSale} 
            onDeletePurchase={handleDeletePurchase}
            onUpdatePurchase={handleUpdatePurchase}
            settings={settings} 
            currentUserRole={currentUser?.role}
            currentUserPermissions={currentUser?.permissions}
          />
        );
      case 'purchases': 
        return (
          <Purchases 
            products={products} 
            suppliers={suppliers} 
            purchases={purchases} 
            onAddPurchase={handleAddPurchase}
            onDeletePurchase={handleDeletePurchase}
            onUpdatePurchase={handleUpdatePurchase}
            onAddSupplier={handleAddSupplier}
            currentUserRole={currentUser?.role}
            currentUserPermissions={currentUser?.permissions}
          />
        );
      case 'customers': 
        return (
          <People 
            type="Customer" 
            data={customers} 
            sales={sales}
            products={products}
            onAdd={handleAddCustomer}
            onUpdate={handleUpdateCustomer}
            onDelete={handleDeleteCustomer}
            onUpdateSale={handleUpdateSale}
            onDeleteSale={handleDeleteSale}
            settings={settings}
            selectedId={selectedCustomerId}
            onClearSelected={() => setSelectedCustomerId(null)}
            currentUserRole={currentUser?.role}
            currentUserPermissions={currentUser?.permissions}
          />
        );
      case 'suppliers': 
        return (
          <People 
            type="Supplier" 
            data={suppliers} 
            sales={sales}
            purchases={purchases}
            products={products}
            onAdd={handleAddSupplier}
            onUpdate={() => {}}
            onDelete={handleDeleteSupplier}
            onUpdateSale={handleUpdateSale}
            onUpdatePurchase={handleUpdatePurchase}
            onDeleteSale={handleDeleteSale}
            onDeletePurchase={handleDeletePurchase}
            settings={settings}
            selectedId={selectedSupplierId}
            onClearSelected={() => setSelectedSupplierId(null)}
            currentUserRole={currentUser?.role}
            currentUserPermissions={currentUser?.permissions}
          />
        );
      case 'accounting': 
        return (
          <Accounting 
            expenses={expenses} 
            sales={sales} 
            purchases={purchases} 
            customers={customers}
            suppliers={suppliers}
            currentUser={currentUser}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
            onUpdateCustomer={handleUpdateCustomer}
            onUpdateSupplier={async (id, supplier) => {
              await fetch(`/api/suppliers/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(supplier),
              });
              setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...supplier } : s));
            }}
            onViewCustomerProfile={(id) => {
              setSelectedCustomerId(id);
              setActiveView('customers');
            }}
            onViewSupplierProfile={(id) => {
              setSelectedSupplierId(id);
              setActiveView('suppliers');
            }}
          />
        );
      case 'reports': 
        return <Reports sales={sales} products={products} expenses={expenses} purchases={purchases} users={users} customers={customers} currentUser={currentUser} onDataRefresh={fetchData} />;
      case 'settings': 
        return (
          <Settings 
            settings={settings} 
            users={users} 
            onUpdateSettings={handleUpdateSettings}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            currentUserRole={currentUser?.role}
            currentUserPermissions={currentUser?.permissions}
            currentUserId={currentUser?.id}
          />
        );
      case 'activity-logs':
        return (
          <ActivityLogs 
            currentUserRole={currentUser?.role}
          />
        );
      case 'support':
        return (
          <Support 
            currentUserRole={currentUser?.role}
          />
        );
      default: 
        return <div className="p-6">Not Found</div>;
    }
  };

  // Loading screen
  if (isCheckingAuth || isLoading) {
    if (!hasLoadedCache) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }
    
    const title = loadingSettings?.loadingTitle || loadingSettings?.shopName || defaultLoadingSettings.loadingTitle;
    const subtitle = loadingSettings?.loadingSubtitle || loadingSettings?.shopBio || defaultLoadingSettings.loadingSubtitle;
    
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30 overflow-hidden">
            {loadingSettings?.shopLogo ? (
              <img src={loadingSettings.shopLogo} alt={title} className="w-full h-full object-contain" />
            ) : (
              <span className="text-3xl font-black text-white">{title.charAt(0)}</span>
            )}
          </div>
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2 mt-6">{title}</h1>
          <p className="text-purple-300 font-medium mb-6">{subtitle}</p>
          <p className="text-slate-400 text-sm mt-4">{loadingSettings?.loadingText || t('msg.loading')}</p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  // Main application
  return (
    <>
      <AppLayout
        activeView={activeView}
        onViewChange={setActiveView}
        currentUser={currentUser}
        onLogout={handleLogout}
        settings={settings}
        navItems={navItems}
        language={language}
        onLanguageChange={setLanguage}
        liveTime={liveTime}
        formatLiveTime={formatLiveTime}
      >
        {renderContent()}
      </AppLayout>
      
      {/* Auto Print Dialog */}
      <PrintReceipt
        open={showPrintDialog}
        onClose={() => {
          setShowPrintDialog(false);
          setLastCompletedSale(null);
          setActiveView('sales');
        }}
        sale={lastCompletedSale}
        settings={settings}
        currentUser={currentUser}
        autoPrint={settings?.autoPrintOnSale || false}
        autoPrintType={settings?.autoPrintType || 'thermal'}
      />
      
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

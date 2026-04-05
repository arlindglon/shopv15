'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  AlertTriangle, 
  Trash2, 
  Shield, 
  Loader2, 
  AlertCircle,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle,
  Clock,
  Crown,
  Star,
  Building2,
  Sparkles,
  Package,
  Users,
  Database,
  Settings,
  Edit,
  Truck,
  UserCog,
  BarChart3,
  Cloud,
  Key
} from 'lucide-react';
import { 
  DEFAULT_PLAN_LIMITS, 
  PLAN_INFO, 
  LIMIT_LABELS, 
  FEATURE_LABELS,
  ROLE_LIMIT_MAP 
} from '@/hooks/useSubscriptionLimits';

// Feature Limits Type
interface FeatureLimits {
  // Numeric Limits
  maxProducts: number;
  maxCustomers: number;
  maxSuppliers: number;
  
  // User Role Limits
  maxAdmins: number;
  maxManagers: number;
  maxStaff: number;
  maxSellers: number;
  maxViewers: number;
  
  // Feature Toggles
  posSystem: boolean;
  salesPurchases: boolean;
  customerManagement: boolean;
  supplierManagement: boolean;
  advancedReports: boolean;
  autoBackup: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
}

// Subscription Plans
const SUBSCRIPTION_PLANS = {
  basic: {
    id: 'basic',
    name: { en: 'Basic', bn: 'বেসিক' },
    price: { en: '$9/month', bn: '$৯/মাস' },
    color: 'emerald',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-300 dark:border-emerald-700',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    icon: Star,
  },
  premium: {
    id: 'premium',
    name: { en: 'Premium', bn: 'প্রিমিয়াম' },
    price: { en: '$29/month', bn: '$২৯/মাস' },
    color: 'violet',
    bgColor: 'bg-violet-50 dark:bg-violet-900/20',
    borderColor: 'border-violet-400 dark:border-violet-600',
    textColor: 'text-violet-600 dark:text-violet-400',
    icon: Crown,
  },
  enterprise: {
    id: 'enterprise',
    name: { en: 'Enterprise', bn: 'এন্টারপ্রাইজ' },
    price: { en: '$99/month', bn: '$৯৯/মাস' },
    color: 'amber',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-400 dark:border-amber-600',
    textColor: 'text-amber-600 dark:text-amber-400',
    icon: Building2,
  }
};

interface DangerZoneProps {
  settings?: {
    subscriptionExpiryDate?: Date | string;
    subscriptionPlan?: string;
    subscriptionContactPhone?: string;
    subscriptionContactEmail?: string;
    subscriptionContactWhatsapp?: string;
    featureLimits?: FeatureLimits;
  } | null;
  onUpdateSettings: (settings: Record<string, unknown>) => void;
  currentUserId?: string;
}

export default function DangerZone({ settings, onUpdateSettings, currentUserId }: DangerZoneProps) {
  const { isBangla } = useLanguage();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Subscription settings state
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');
  const [expiryDate, setExpiryDate] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [isSavingSubscription, setIsSavingSubscription] = useState(false);
  const [subscriptionSaved, setSubscriptionSaved] = useState(false);
  
  // Feature Limits state
  const [featureLimits, setFeatureLimits] = useState<FeatureLimits>(DEFAULT_PLAN_LIMITS.premium);
  const [showLimitsEditor, setShowLimitsEditor] = useState(false);

  // Sync state with props
  useEffect(() => {
    if (settings?.subscriptionPlan && SUBSCRIPTION_PLANS[settings.subscriptionPlan as keyof typeof SUBSCRIPTION_PLANS]) {
      setSelectedPlan(settings.subscriptionPlan);
    } else {
      setSelectedPlan('premium');
    }
    if (settings?.subscriptionExpiryDate) {
      const date = new Date(settings.subscriptionExpiryDate);
      if (!isNaN(date.getTime())) {
        setExpiryDate(date.toISOString().split('T')[0]);
      }
    } else {
      setExpiryDate('');
    }
    setContactPhone(settings?.subscriptionContactPhone || '');
    setContactEmail(settings?.subscriptionContactEmail || '');
    setContactWhatsapp(settings?.subscriptionContactWhatsapp || '');
    
    // Load feature limits from settings or use defaults for the plan
    if (settings?.featureLimits) {
      setFeatureLimits(settings.featureLimits);
    } else if (settings?.subscriptionPlan) {
      setFeatureLimits(DEFAULT_PLAN_LIMITS[settings.subscriptionPlan] || DEFAULT_PLAN_LIMITS.premium);
    }
  }, [settings]);

  // When plan changes, update feature limits to defaults for that plan
  const handlePlanChange = (planId: string) => {
    setSelectedPlan(planId);
    setFeatureLimits(DEFAULT_PLAN_LIMITS[planId] || DEFAULT_PLAN_LIMITS.premium);
  };

  const isSubscriptionExpired = () => {
    if (!settings?.subscriptionExpiryDate) return false;
    const expiry = new Date(settings.subscriptionExpiryDate);
    return expiry < new Date();
  };

  const getDaysUntilExpiry = () => {
    if (!settings?.subscriptionExpiryDate) return null;
    const expiry = new Date(settings.subscriptionExpiryDate);
    const now = new Date();
    return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysUntilExpiry();
  const expired = isSubscriptionExpired();
  const currentPlan = SUBSCRIPTION_PLANS[selectedPlan as keyof typeof SUBSCRIPTION_PLANS] || SUBSCRIPTION_PLANS.premium;

  // Handle full data reset
  const handleFullReset = async () => {
    if (confirmText !== 'DELETE ALL DATA') {
      alert(isBangla ? 'অনুগ্রহ করে "DELETE ALL DATA" লিখুন' : 'Please type "DELETE ALL DATA"');
      return;
    }

    if (!currentUserId) {
      alert(isBangla ? 'ব্যবহারকারী ID পাওয়া যায়নি।' : 'User ID not found.');
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch('/api/reset-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmText, userId: currentUserId }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(isBangla 
          ? 'সব ডাটা মুছে ফেলা হয়েছে! পেজ refresh হবে।' 
          : 'All data has been reset! Page will refresh.'
        );
        localStorage.clear();
        window.location.reload();
      } else {
        alert(data.error || (isBangla ? 'রিসেট ব্যর্থ হয়েছে' : 'Reset failed'));
      }
    } catch (error) {
      console.error('Reset error:', error);
      alert(isBangla ? 'কিছু সমস্যা হয়েছে' : 'Something went wrong');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setConfirmText('');
    }
  };

  // Handle subscription settings save
  const handleSaveSubscription = async () => {
    setIsSavingSubscription(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionPlan: selectedPlan,
          subscriptionExpiryDate: expiryDate || null,
          subscriptionContactPhone: contactPhone,
          subscriptionContactEmail: contactEmail,
          subscriptionContactWhatsapp: contactWhatsapp,
          featureLimits: featureLimits,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        await onUpdateSettings({
          subscriptionPlan: selectedPlan,
          subscriptionExpiryDate: expiryDate || null,
          subscriptionContactPhone: contactPhone,
          subscriptionContactEmail: contactEmail,
          subscriptionContactWhatsapp: contactWhatsapp,
          featureLimits: featureLimits,
        });
        setSubscriptionSaved(true);
        setTimeout(() => setSubscriptionSaved(false), 3000);
      } else {
        const errorMsg = data.error || 'Failed to save';
        alert(isBangla ? 'সংরক্ষণ ব্যর্থ: ' + errorMsg : 'Failed to save: ' + errorMsg);
      }
    } catch (error) {
      console.error('Failed to save subscription:', error);
      alert(isBangla ? 'সংরক্ষণে সমস্যা' : 'Something went wrong');
    } finally {
      setIsSavingSubscription(false);
    }
  };

  // Update a single feature limit
  const updateLimit = (key: keyof FeatureLimits, value: number | boolean) => {
    setFeatureLimits(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Render limit input
  const renderLimitInput = (key: keyof FeatureLimits, icon: React.ReactNode) => {
    const value = featureLimits[key];
    const label = LIMIT_LABELS[key] || FEATURE_LABELS[key];
    
    if (typeof value === 'number') {
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            {icon}
            {label?.[isBangla ? 'bn' : 'en'] || key}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={value === -1 ? '' : value}
              onChange={(e) => updateLimit(key, parseInt(e.target.value) || 0)}
              placeholder={isBangla ? 'সীমাহীন' : 'Unlimited'}
              className="flex-1 p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500"
              disabled={value === -1}
            />
            <label className="flex items-center gap-2 px-3 bg-slate-100 dark:bg-slate-600 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={value === -1}
                onChange={(e) => updateLimit(key, e.target.checked ? -1 : 10)}
                className="rounded text-violet-600"
              />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {isBangla ? '∞' : '∞'}
              </span>
            </label>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Subscription Settings Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-violet-500/10 to-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isBangla ? 'সাবস্ক্রিপশন সেটিংস' : 'Subscription Settings'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isBangla ? 'প্ল্যান, মেয়াদ, লিমিট ও যোগাযোগের তথ্য' : 'Manage plan, expiry, limits and contact info'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Status */}
          {settings?.subscriptionExpiryDate && (
            <div className={`p-4 rounded-xl border ${
              expired 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                : daysLeft && daysLeft <= 7
                  ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                  : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            }`}>
              <div className="flex items-center gap-3">
                {expired ? (
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                ) : daysLeft && daysLeft <= 7 ? (
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                )}
                <div>
                  <p className={`font-semibold ${
                    expired 
                      ? 'text-red-700 dark:text-red-300' 
                      : daysLeft && daysLeft <= 7
                        ? 'text-amber-700 dark:text-amber-300'
                        : 'text-green-700 dark:text-green-300'
                  }`}>
                    {expired 
                      ? (isBangla ? 'সাবস্ক্রিপশন মেয়াদোত্তীর্ণ হয়েছে' : 'Subscription Expired')
                      : daysLeft && daysLeft <= 7
                        ? (isBangla ? `${daysLeft} দিন বাকি` : `${daysLeft} days remaining`)
                        : (isBangla ? 'সাবস্ক্রিপশন সক্রিয়' : 'Subscription Active')
                    }
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {new Date(settings.subscriptionExpiryDate).toLocaleDateString(isBangla ? 'bn-BD' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Plan Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {isBangla ? 'সাবস্ক্রিপশন প্ল্যান' : 'Subscription Plan'}
            </label>
            
            <div className="grid grid-cols-3 gap-3">
              {Object.values(SUBSCRIPTION_PLANS).map((plan) => {
                const Icon = plan.icon;
                const isSelected = selectedPlan === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => handlePlanChange(plan.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected 
                        ? `${plan.borderColor} ${plan.bgColor} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ring-${plan.color}-400`
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className={`w-5 h-5 ${plan.textColor}`} />
                      </div>
                    )}
                    <div className={`w-10 h-10 rounded-lg ${plan.bgColor} flex items-center justify-center mb-3`}>
                      <Icon className={`w-5 h-5 ${plan.textColor}`} />
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {plan.name[isBangla ? 'bn' : 'en']}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {plan.price[isBangla ? 'bn' : 'en']}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feature Limits Section */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <h4 className="font-bold text-slate-900 dark:text-white">
                  {isBangla ? 'প্ল্যান লিমিটস' : 'Plan Limits'}
                </h4>
              </div>
              <button
                onClick={() => setShowLimitsEditor(!showLimitsEditor)}
                className="px-3 py-1.5 text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 flex items-center gap-1"
              >
                <Edit className="w-4 h-4" />
                {showLimitsEditor 
                  ? (isBangla ? 'বন্ধ করুন' : 'Close')
                  : (isBangla ? 'এডিট করুন' : 'Edit')
                }
              </button>
            </div>

            {/* Quick View Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {/* Products */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                  <Package className="w-4 h-4" />
                  <span className="text-xs">{isBangla ? 'প্রোডাক্ট' : 'Products'}</span>
                </div>
                <p className="font-bold text-slate-900 dark:text-white">
                  {featureLimits.maxProducts === -1 ? '∞' : featureLimits.maxProducts}
                </p>
              </div>
              {/* Customers */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs">{isBangla ? 'কাস্টমার' : 'Customers'}</span>
                </div>
                <p className="font-bold text-slate-900 dark:text-white">
                  {featureLimits.maxCustomers === -1 ? '∞' : featureLimits.maxCustomers}
                </p>
              </div>
              {/* Suppliers */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                  <Truck className="w-4 h-4" />
                  <span className="text-xs">{isBangla ? 'সাপ্লায়ার' : 'Suppliers'}</span>
                </div>
                <p className="font-bold text-slate-900 dark:text-white">
                  {featureLimits.maxSuppliers === -1 ? '∞' : featureLimits.maxSuppliers}
                </p>
              </div>
              {/* Users */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                  <UserCog className="w-4 h-4" />
                  <span className="text-xs">{isBangla ? 'ইউজার' : 'Users'}</span>
                </div>
                <p className="font-bold text-slate-900 dark:text-white">
                  {(featureLimits.maxAdmins === -1 ? 0 : featureLimits.maxAdmins) +
                   (featureLimits.maxManagers === -1 ? 0 : featureLimits.maxManagers) +
                   (featureLimits.maxStaff === -1 ? 0 : featureLimits.maxStaff) +
                   (featureLimits.maxSellers === -1 ? 0 : featureLimits.maxSellers) +
                   (featureLimits.maxViewers === -1 ? 0 : featureLimits.maxViewers)}
                </p>
              </div>
            </div>

            {/* Expanded Editor */}
            {showLimitsEditor && (
              <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                {/* Warning about feature_limits column */}
                {!settings?.featureLimits && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-amber-700 dark:text-amber-300">
                        <p className="font-medium">{isBangla ? 'কাস্টম লিমিট সেভ করতে ডাটাবেস আপডেট প্রয়োজন' : 'Database update required to save custom limits'}</p>
                        <p className="mt-1 text-xs">{isBangla 
                          ? 'Supabase SQL Editor এ এই কমান্ড রান করুন:' 
                          : 'Run this command in Supabase SQL Editor:'}
                        </p>
                        <code className="block mt-1 p-2 bg-amber-100 dark:bg-amber-900/30 rounded text-xs font-mono whitespace-nowrap overflow-x-auto">
                          ALTER TABLE app_settings ADD COLUMN feature_limits JSONB DEFAULT NULL;
                        </code>
                        <p className="mt-2 text-xs">{isBangla 
                          ? 'এখন পর্যন্ত প্ল্যান অনুযায়ী ডিফল্ট লিমিট ব্যবহার হচ্ছে।' 
                          : 'Currently using default limits based on selected plan.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {isBangla 
                    ? 'মাস্টার অ্যাডমিন হিসেবে আপনি প্রতিটি প্ল্যানের লিমিট কাস্টমাইজ করতে পারেন।'
                    : 'As Master Admin, you can customize the limits for each plan.'
                  }
                </p>
                
                {/* Data Limits */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    {isBangla ? 'ডাটা লিমিট' : 'Data Limits'}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderLimitInput('maxProducts', <Package className="w-4 h-4" />)}
                    {renderLimitInput('maxCustomers', <Users className="w-4 h-4" />)}
                    {renderLimitInput('maxSuppliers', <Truck className="w-4 h-4" />)}
                  </div>
                </div>

                {/* User Role Limits */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserCog className="w-4 h-4" />
                    {isBangla ? 'ইউজার রোল লিমিট' : 'User Role Limits'}
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {renderLimitInput('maxAdmins', <Shield className="w-4 h-4 text-purple-500" />)}
                    {renderLimitInput('maxManagers', <Users className="w-4 h-4 text-blue-500" />)}
                    {renderLimitInput('maxStaff', <Users className="w-4 h-4 text-green-500" />)}
                    {renderLimitInput('maxSellers', <Users className="w-4 h-4 text-teal-500" />)}
                    {renderLimitInput('maxViewers', <Users className="w-4 h-4 text-slate-500" />)}
                  </div>
                </div>

                {/* Feature Toggles */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {isBangla ? 'ফিচার অ্যাক্সেস' : 'Feature Access'}
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { key: 'posSystem', icon: Package },
                      { key: 'salesPurchases', icon: BarChart3 },
                      { key: 'customerManagement', icon: Users },
                      { key: 'supplierManagement', icon: Truck },
                      { key: 'advancedReports', icon: BarChart3 },
                      { key: 'autoBackup', icon: Cloud },
                      { key: 'apiAccess', icon: Key },
                      { key: 'prioritySupport', icon: AlertCircle },
                    ].map((feature) => {
                      const Icon = feature.icon;
                      const label = FEATURE_LABELS[feature.key];
                      const isEnabled = featureLimits[feature.key as keyof FeatureLimits] as boolean;
                      
                      return (
                        <label 
                          key={feature.key}
                          className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                            isEnabled
                              ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-700'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={(e) => updateLimit(feature.key as keyof FeatureLimits, e.target.checked)}
                            className="rounded text-violet-600 focus:ring-violet-500"
                          />
                          <Icon className={`w-4 h-4 ${isEnabled ? 'text-violet-600' : 'text-slate-400'}`} />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {label?.[isBangla ? 'bn' : 'en'] || feature.key}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {isBangla ? 'মেয়াদ শেষের তারিখ' : 'Expiry Date'}
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-slate-500">
              {isBangla 
                ? 'এই তারিখের পর শুধু মাস্টার অ্যাডমিন লগইন করতে পারবে' 
                : 'After this date, only Master Admin can login'
              }
            </p>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {isBangla ? 'ফোন' : 'Phone'}
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+880 1234 567890"
                className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {isBangla ? 'ইমেইল' : 'Email'}
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="support@dokan.com"
                className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </label>
              <input
                type="tel"
                value={contactWhatsapp}
                onChange={(e) => setContactWhatsapp(e.target.value)}
                placeholder="+880 1234 567890"
                className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSaveSubscription}
              disabled={isSavingSubscription}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSavingSubscription ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isBangla ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {isBangla ? 'সংরক্ষণ করুন' : 'Save Settings'}
                </>
              )}
            </button>
            {subscriptionSaved && (
              <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                {isBangla ? 'সংরক্ষিত!' : 'Saved!'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone Section */}
      <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border-2 border-red-200 dark:border-red-800 overflow-hidden">
        <div className="p-6 border-b border-red-200 dark:border-red-800 bg-gradient-to-r from-red-500/10 to-orange-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-700 dark:text-red-300">
                {isBangla ? 'বিপদজনক জোন' : 'Danger Zone'}
              </h3>
              <p className="text-sm text-red-600/70 dark:text-red-400/70">
                {isBangla ? 'এই ক্রিয়াগুলি অপরিবর্তনীয়' : 'These actions are irreversible'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-red-100 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <Shield className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700 dark:text-red-300">
              <p className="font-semibold mb-1">
                {isBangla ? 'সতর্কতা!' : 'Warning!'}
              </p>
              <p>
                {isBangla 
                  ? 'সব ডাটা ডিলিট করলে সব প্রোডাক্ট, সেলস, কাস্টমার, সাপ্লায়ার এবং অন্যান্য ডাটা স্থায়ীভাবে মুছে যাবে।'
                  : 'Deleting all data will permanently remove all products, sales, customers, suppliers, and other data.'}
              </p>
            </div>
          </div>

          {/* Delete Button */}
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              {isBangla ? 'সব ডাটা মুছে ফেলুন' : 'Delete All Data'}
            </button>
          ) : (
            <div className="space-y-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-800">
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                {isBangla 
                  ? 'অনুগ্রহ করে নিচে "DELETE ALL DATA" লিখুন নিশ্চিত করতে:'
                  : 'Please type "DELETE ALL DATA" below to confirm:'
                }
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE ALL DATA"
                className="w-full p-3 border-2 border-red-300 dark:border-red-700 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleFullReset}
                  disabled={isDeleting || confirmText !== 'DELETE ALL DATA'}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isBangla ? 'মুছে ফেলা হচ্ছে...' : 'Deleting...'}
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      {isBangla ? 'স্থায়ীভাবে মুছুন' : 'Permanently Delete'}
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setConfirmText('');
                  }}
                  disabled={isDeleting}
                  className="px-6 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  {isBangla ? 'বাতিল' : 'Cancel'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { DEFAULT_PLAN_LIMITS, PLAN_INFO, LIMIT_LABELS, FEATURE_LABELS, ROLE_LIMIT_MAP };
export type { FeatureLimits };

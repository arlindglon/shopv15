'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Package, 
  Users, 
  Truck, 
  Shield,
  UserCog,
  Crown,
  Star,
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { 
  useSubscriptionLimits, 
  PLAN_INFO, 
  LIMIT_LABELS, 
  FEATURE_LABELS 
} from '@/hooks/useSubscriptionLimits';

interface PlanUsageProps {
  productsCount: number;
  customersCount: number;
  suppliersCount: number;
  users: Array<{ role: string }>;
}

const PLAN_ICONS: Record<string, React.ElementType> = {
  basic: Star,
  premium: Crown,
  enterprise: Building2,
};

export default function PlanUsage({ 
  productsCount, 
  customersCount, 
  suppliersCount, 
  users 
}: PlanUsageProps) {
  const { isBangla } = useLanguage();
  const { subscription, loading, checkLimit } = useSubscriptionLimits();
  const [showDetails, setShowDetails] = useState(false);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 dark:bg-slate-700 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!subscription) return null;

  const planInfo = PLAN_INFO[subscription.plan];
  const PlanIcon = PLAN_ICONS[subscription.plan] || Star;

  // Count users by role
  const usersByRole = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate usage percentage
  const getUsagePercent = (current: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  };

  // Get color based on usage
  const getUsageColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 70) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const limits = [
    { 
      key: 'maxProducts', 
      label: isBangla ? 'প্রোডাক্ট' : 'Products', 
      current: productsCount, 
      limit: subscription.featureLimits?.maxProducts,
      icon: Package 
    },
    { 
      key: 'maxCustomers', 
      label: isBangla ? 'কাস্টমার' : 'Customers', 
      current: customersCount, 
      limit: subscription.featureLimits?.maxCustomers,
      icon: Users 
    },
    { 
      key: 'maxSuppliers', 
      label: isBangla ? 'সাপ্লায়ার' : 'Suppliers', 
      current: suppliersCount, 
      limit: subscription.featureLimits?.maxSuppliers,
      icon: Truck 
    },
    { 
      key: 'maxUsers', 
      label: isBangla ? 'ইউজার' : 'Users', 
      current: users.length, 
      limit: subscription.featureLimits?.maxAdmins,
      icon: UserCog 
    },
  ];

  const isExpired = subscription.isExpired;
  const daysLeft = subscription.daysRemaining;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              subscription.plan === 'premium' ? 'bg-violet-100 dark:bg-violet-900/30' :
              subscription.plan === 'enterprise' ? 'bg-amber-100 dark:bg-amber-900/30' :
              'bg-emerald-100 dark:bg-emerald-900/30'
            }`}>
              <PlanIcon className={`w-5 h-5 ${
                subscription.plan === 'premium' ? 'text-violet-600' :
                subscription.plan === 'enterprise' ? 'text-amber-600' :
                'text-emerald-600'
              }`} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                {planInfo?.name[isBangla ? 'bn' : 'en'] || subscription.plan} Plan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {planInfo?.price[isBangla ? 'bn' : 'en']}
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          {isExpired ? (
            <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {isBangla ? 'মেয়াদোত্তীর্ণ' : 'Expired'}
            </span>
          ) : daysLeft && daysLeft <= 7 ? (
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {daysLeft} {isBangla ? 'দিন বাকি' : 'days left'}
            </span>
          ) : (
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs font-bold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {isBangla ? 'সক্রিয়' : 'Active'}
            </span>
          )}
        </div>
      </div>

      {/* Usage Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {limits.map((item) => {
            const Icon = item.icon;
            const limit = item.limit ?? -1;
            const isUnlimited = limit === -1;
            const percent = getUsagePercent(item.current, limit);
            const isNearLimit = !isUnlimited && percent >= 70;
            const isAtLimit = !isUnlimited && item.current >= limit;

            return (
              <div 
                key={item.key}
                className={`p-3 rounded-xl border ${
                  isAtLimit 
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                    : isNearLimit 
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                      : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{item.label}</span>
                  <Icon className="w-4 h-4 text-slate-400" />
                </div>
                
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {item.current}
                    </p>
                    <p className="text-xs text-slate-400">
                      / {isUnlimited ? '∞' : limit}
                    </p>
                  </div>
                  
                  {!isUnlimited && (
                    <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${getUsageColor(percent)}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* User Roles Breakdown */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              {isBangla ? 'ইউজার রোল বিস্তারিত' : 'User Roles Breakdown'}
            </h4>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {[
                { role: 'Admin', key: 'maxAdmins' },
                { role: 'Manager', key: 'maxManagers' },
                { role: 'Staff', key: 'maxStaff' },
                { role: 'Seller', key: 'maxSellers' },
                { role: 'Viewer', key: 'maxViewers' },
              ].map((item) => {
                const count = usersByRole[item.role] || 0;
                const limit = subscription.featureLimits?.[item.key as keyof typeof subscription.featureLimits] as number ?? -1;
                const isUnlimited = limit === -1;

                return (
                  <div key={item.role} className="text-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.role}</p>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {count}
                      <span className="text-xs font-normal text-slate-400">
                        /{isUnlimited ? '∞' : limit}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Toggle Details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-3 text-sm text-violet-600 dark:text-violet-400 hover:underline"
        >
          {showDetails 
            ? (isBangla ? 'কম দেখুন' : 'Show less')
            : (isBangla ? 'বিস্তারিত দেখুন' : 'Show details')
          }
        </button>
      </div>
    </div>
  );
}

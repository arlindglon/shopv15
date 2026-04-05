'use client';

import { useState, useEffect, useCallback } from 'react';

// Feature Limits Type - Comprehensive
export interface FeatureLimits {
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

export interface SubscriptionStatus {
  plan: string;
  expiryDate: Date | null;
  isExpired: boolean;
  daysRemaining: number | null;
  featureLimits: FeatureLimits | null;
  contactPhone: string;
  contactEmail: string;
  contactWhatsapp: string;
}

// Default limits for each plan (NO FREE PLAN, NO MULTI-BRANCH)
export const DEFAULT_PLAN_LIMITS: Record<string, FeatureLimits> = {
  basic: {
    // Numeric Limits
    maxProducts: 500,
    maxCustomers: 200,
    maxSuppliers: 50,
    
    // User Role Limits
    maxAdmins: 1,
    maxManagers: 1,
    maxStaff: 2,
    maxSellers: 2,
    maxViewers: 1,
    
    // Feature Toggles
    posSystem: true,
    salesPurchases: true,
    customerManagement: true,
    supplierManagement: false,
    advancedReports: false,
    autoBackup: false,
    apiAccess: false,
    prioritySupport: false,
  },
  premium: {
    // Numeric Limits
    maxProducts: -1, // Unlimited
    maxCustomers: -1, // Unlimited
    maxSuppliers: 500,
    
    // User Role Limits
    maxAdmins: 3,
    maxManagers: 5,
    maxStaff: 10,
    maxSellers: 10,
    maxViewers: 5,
    
    // Feature Toggles
    posSystem: true,
    salesPurchases: true,
    customerManagement: true,
    supplierManagement: true,
    advancedReports: true,
    autoBackup: true,
    apiAccess: false,
    prioritySupport: true,
  },
  enterprise: {
    // Numeric Limits
    maxProducts: -1, // Unlimited
    maxCustomers: -1, // Unlimited
    maxSuppliers: -1, // Unlimited
    
    // User Role Limits
    maxAdmins: -1, // Unlimited
    maxManagers: -1, // Unlimited
    maxStaff: -1, // Unlimited
    maxSellers: -1, // Unlimited
    maxViewers: -1, // Unlimited
    
    // Feature Toggles
    posSystem: true,
    salesPurchases: true,
    customerManagement: true,
    supplierManagement: true,
    advancedReports: true,
    autoBackup: true,
    apiAccess: true,
    prioritySupport: true,
  },
};

// Plan display info
export const PLAN_INFO: Record<string, {
  id: string;
  name: { en: string; bn: string };
  price: { en: string; bn: string };
  description: { en: string; bn: string };
}> = {
  basic: {
    id: 'basic',
    name: { en: 'Basic', bn: 'বেসিক' },
    price: { en: '$9/month', bn: '$৯/মাস' },
    description: { 
      en: 'Perfect for small businesses',
      bn: 'ছোট ব্যবসার জন্য উপযুক্ত'
    },
  },
  premium: {
    id: 'premium',
    name: { en: 'Premium', bn: 'প্রিমিয়াম' },
    price: { en: '$29/month', bn: '$২৯/মাস' },
    description: { 
      en: 'Great for growing businesses',
      bn: 'বর্ধমান ব্যবসার জন্য উপযুক্ত'
    },
  },
  enterprise: {
    id: 'enterprise',
    name: { en: 'Enterprise', bn: 'এন্টারপ্রাইজ' },
    price: { en: '$99/month', bn: '$৯৯/মাস' },
    description: { 
      en: 'For large businesses with unlimited needs',
      bn: 'বড় ব্যবসার জন্য আনলিমিটেড সুবিধা'
    },
  },
};

// Limit type labels
export const LIMIT_LABELS: Record<string, { en: string; bn: string }> = {
  maxProducts: { en: 'Products', bn: 'প্রোডাক্ট' },
  maxCustomers: { en: 'Customers', bn: 'কাস্টমার' },
  maxSuppliers: { en: 'Suppliers', bn: 'সাপ্লায়ার' },
  maxAdmins: { en: 'Admins', bn: 'অ্যাডমিন' },
  maxManagers: { en: 'Managers', bn: 'ম্যানেজার' },
  maxStaff: { en: 'Staff', bn: 'স্টাফ' },
  maxSellers: { en: 'Sellers', bn: 'সেলার' },
  maxViewers: { en: 'Viewers', bn: 'ভিউয়ার' },
};

// Feature labels
export const FEATURE_LABELS: Record<string, { en: string; bn: string }> = {
  posSystem: { en: 'POS System', bn: 'পিওএস সিস্টেম' },
  salesPurchases: { en: 'Sales & Purchases', bn: 'সেলস ও পারচেজ' },
  customerManagement: { en: 'Customer Management', bn: 'কাস্টমার ম্যানেজমেন্ট' },
  supplierManagement: { en: 'Supplier Management', bn: 'সাপ্লায়ার ম্যানেজমেন্ট' },
  advancedReports: { en: 'Advanced Reports', bn: 'অ্যাডভান্সড রিপোর্ট' },
  autoBackup: { en: 'Auto Backup', bn: 'অটো ব্যাকআপ' },
  apiAccess: { en: 'API Access', bn: 'API অ্যাক্সেস' },
  prioritySupport: { en: 'Priority Support', bn: 'প্রায়োরিটি সাপোর্ট' },
};

interface LimitCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  isUnlimited: boolean;
  message?: string;
}

// Role to limit key mapping
export const ROLE_LIMIT_MAP: Record<string, keyof FeatureLimits> = {
  'Master Admin': 'maxAdmins', // Master Admin counts as Admin
  'Admin': 'maxAdmins',
  'Manager': 'maxManagers',
  'Staff': 'maxStaff',
  'Seller': 'maxSellers',
  'Viewer': 'maxViewers',
};

export function useSubscriptionLimits(userRole?: string) {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Master Admin is the system owner/server admin - bypass ALL plan restrictions
  const isMasterAdmin = userRole === 'Master Admin';

  // Fetch subscription status from settings
  const fetchSubscription = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        
        const expiryDate = data.subscriptionExpiryDate ? new Date(data.subscriptionExpiryDate) : null;
        const now = new Date();
        const isExpired = expiryDate ? expiryDate < now : false;
        
        let daysRemaining: number | null = null;
        if (expiryDate && !isExpired) {
          const diff = expiryDate.getTime() - now.getTime();
          daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
        }

        // Use stored feature limits or defaults for the plan
        const planKey = data.subscriptionPlan || 'premium';
        const featureLimits = data.featureLimits || DEFAULT_PLAN_LIMITS[planKey] || DEFAULT_PLAN_LIMITS.premium;

        setSubscription({
          plan: planKey,
          expiryDate,
          isExpired,
          daysRemaining,
          featureLimits,
          contactPhone: data.subscriptionContactPhone || '',
          contactEmail: data.subscriptionContactEmail || '',
          contactWhatsapp: data.subscriptionContactWhatsapp || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Check if a feature is available
  // Master Admin bypasses ALL feature restrictions
  const hasFeature = useCallback((feature: keyof FeatureLimits): boolean => {
    // Master Admin has access to everything - no restrictions
    if (isMasterAdmin) return true;

    const planKey = subscription?.plan || 'premium';
    const planDefaults = DEFAULT_PLAN_LIMITS[planKey] || DEFAULT_PLAN_LIMITS.premium;
    
    // For boolean features, use plan defaults (not stored custom values)
    const planDefault = planDefaults[feature];
    if (typeof planDefault === 'boolean') {
      return planDefault;
    }
    
    // For numeric limits, check if there's a custom stored value
    if (subscription?.featureLimits) {
      const value = subscription.featureLimits[feature];
      return typeof value === 'boolean' ? value : true;
    }
    
    return true;
  }, [subscription, isMasterAdmin]);

  // Check numeric limit
  // Master Admin bypasses ALL numeric limits
  const checkLimit = useCallback((
    limitType: string,
    currentCount: number
  ): LimitCheckResult => {
    // Master Admin has unlimited access - no limits
    if (isMasterAdmin) {
      return { allowed: true, current: currentCount, limit: -1, isUnlimited: true };
    }

    if (!subscription?.featureLimits) {
      return { allowed: true, current: currentCount, limit: -1, isUnlimited: true };
    }

    const limit = (subscription.featureLimits as Record<string, number | boolean>)[limitType] as number;

    // If the limit key doesn't exist in featureLimits, allow by default
    if (limit === undefined || limit === null) {
      return { allowed: true, current: currentCount, limit: -1, isUnlimited: true };
    }

    const isUnlimited = limit === -1;

    if (isUnlimited) {
      return { allowed: true, current: currentCount, limit: -1, isUnlimited: true };
    }

    // If limit is 0 or negative (not -1), block
    if (limit <= 0) {
      return { allowed: false, current: currentCount, limit, isUnlimited: false, message: `Limit reached: ${currentCount}/${limit}` };
    }

    const allowed = currentCount < limit;
    
    return {
      allowed,
      current: currentCount,
      limit,
      isUnlimited: false,
      message: allowed ? undefined : `Limit reached: ${currentCount}/${limit}`,
    };
  }, [subscription, isMasterAdmin]);

  // Check user role limit
  const checkUserRoleLimit = useCallback((
    role: string,
    currentCount: number
  ): LimitCheckResult => {
    const limitKey = ROLE_LIMIT_MAP[role];
    if (!limitKey) {
      // Unknown role - allow by default
      return { allowed: true, current: currentCount, limit: -1, isUnlimited: true };
    }
    return checkLimit(limitKey, currentCount);
  }, [checkLimit]);

  // Get upgrade message
  const getUpgradeMessage = useCallback((
    limitType: keyof FeatureLimits,
    isBangla: boolean = false
  ): string => {
    const planOrder = ['basic', 'premium', 'enterprise'];
    const currentPlanIndex = planOrder.indexOf(subscription?.plan || 'basic');
    
    const nextPlan = planOrder[currentPlanIndex + 1];
    if (nextPlan && PLAN_INFO[nextPlan]) {
      const planName = PLAN_INFO[nextPlan].name[isBangla ? 'bn' : 'en'];
      const limitName = LIMIT_LABELS[limitType]?.[isBangla ? 'bn' : 'en'] || limitType;
      
      return isBangla
        ? `${limitName} যোগ করতে ${planName} প্ল্যানে আপগ্রেড করুন!`
        : `Upgrade to ${planName} plan to add more ${limitName.toLowerCase()}!`;
    }

    return isBangla
      ? 'আপনার বর্তমান প্ল্যানের সীমা পূর্ণ হয়েছে।'
      : 'You have reached the limit of your current plan.';
  }, [subscription]);

  // Check if subscription is active
  // Master Admin is always active regardless of expiry
  const isActive = useCallback((): boolean => {
    if (isMasterAdmin) return true;
    if (!subscription?.expiryDate) return true;
    return !subscription.isExpired;
  }, [subscription, isMasterAdmin]);

  return {
    subscription,
    loading,
    hasFeature,
    checkLimit,
    checkUserRoleLimit,
    getUpgradeMessage,
    isActive,
    refreshSubscription: fetchSubscription,
  };
}

// Cache for non-React usage
let cachedLimits: FeatureLimits | null = null;

export async function getSubscriptionLimits(): Promise<FeatureLimits | null> {
  if (cachedLimits) return cachedLimits;
  
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      const planKey = data.subscriptionPlan || 'premium';
      cachedLimits = data.featureLimits || DEFAULT_PLAN_LIMITS[planKey];
      return cachedLimits;
    }
  } catch (error) {
    console.error('Failed to get subscription limits:', error);
  }
  
  return DEFAULT_PLAN_LIMITS.premium;
}

export function clearLimitsCache() {
  cachedLimits = null;
}

'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  AlertTriangle, 
  Phone, 
  Mail, 
  MessageCircle, 
  CreditCard,
  Clock,
  RefreshCw,
  Crown,
  Star,
  Building2
} from 'lucide-react';

// Subscription Plans (NO FREE PLAN)
const SUBSCRIPTION_PLANS: Record<string, {
  id: string;
  name: { en: string; bn: string };
  price: { en: string; bn: string };
  color: string;
  icon: React.ElementType;
}> = {
  basic: {
    id: 'basic',
    name: { en: 'Basic', bn: 'বেসিক' },
    price: { en: '$9/month', bn: '$৯/মাস' },
    color: 'emerald',
    icon: Star,
  },
  premium: {
    id: 'premium',
    name: { en: 'Premium', bn: 'প্রিমিয়াম' },
    price: { en: '$29/month', bn: '$২৯/মাস' },
    color: 'violet',
    icon: Crown,
  },
  enterprise: {
    id: 'enterprise',
    name: { en: 'Enterprise', bn: 'এন্টারপ্রাইজ' },
    price: { en: '$99/month', bn: '$৯৯/মাস' },
    color: 'amber',
    icon: Building2,
  }
};

interface SubscriptionExpiredProps {
  settings?: {
    shopName?: string;
    shopLogo?: string;
    subscriptionPlan?: string;
    subscriptionContactPhone?: string;
    subscriptionContactEmail?: string;
    subscriptionContactWhatsapp?: string;
  } | null;
  expiryDate?: Date | string;
}

export default function SubscriptionExpired({ settings, expiryDate }: SubscriptionExpiredProps) {
  const { t, isBangla } = useLanguage();

  const contactPhone = settings?.subscriptionContactPhone || '+880 1234 567890';
  const contactEmail = settings?.subscriptionContactEmail || 'support@dokan.com';
  const contactWhatsapp = settings?.subscriptionContactWhatsapp || '+880 1234 567890';
  
  // Get the plan that was expired
  const planKey = settings?.subscriptionPlan || 'premium';
  const expiredPlan = SUBSCRIPTION_PLANS[planKey] || SUBSCRIPTION_PLANS.premium;
  const PlanIcon = expiredPlan.icon;

  const formatExpiryDate = () => {
    if (!expiryDate) return '';
    const date = new Date(expiryDate);
    return date.toLocaleDateString(isBangla ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-900/40',
          text: 'text-emerald-600 dark:text-emerald-400',
          border: 'border-emerald-200 dark:border-emerald-700'
        };
      case 'violet':
        return {
          bg: 'bg-violet-100 dark:bg-violet-900/40',
          text: 'text-violet-600 dark:text-violet-400',
          border: 'border-violet-200 dark:border-violet-700'
        };
      case 'amber':
        return {
          bg: 'bg-amber-100 dark:bg-amber-900/40',
          text: 'text-amber-600 dark:text-amber-400',
          border: 'border-amber-200 dark:border-amber-700'
        };
      default:
        return {
          bg: 'bg-slate-100 dark:bg-slate-800',
          text: 'text-slate-600 dark:text-slate-400',
          border: 'border-slate-200 dark:border-slate-700'
        };
    }
  };

  const colorClasses = getColorClasses(expiredPlan.color);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-lg w-full relative z-10">
        {/* Main Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {isBangla ? 'সাবস্ক্রিপশন মেয়াদোত্তীর্ণ হয়েছে' : 'Subscription Expired'}
            </h1>
            <p className="text-white/80 text-sm">
              {isBangla 
                ? 'আপনার সাবস্ক্রিপশন মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে নবায়ন করুন।'
                : 'Your subscription has expired. Please renew to continue using the service.'}
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Expired Plan Info */}
            <div className={`p-4 rounded-xl border ${colorClasses.border} ${colorClasses.bg}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-12 h-12 rounded-xl ${colorClasses.bg} flex items-center justify-center`}>
                  <PlanIcon className={`w-6 h-6 ${colorClasses.text}`} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {isBangla ? 'মেয়াদোত্তীর্ণ প্ল্যান' : 'Expired Plan'}
                  </p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {expiredPlan.name[isBangla ? 'bn' : 'en']}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  {isBangla ? 'মূল্য:' : 'Price:'}
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {expiredPlan.price[isBangla ? 'bn' : 'en']}
                </span>
              </div>
            </div>

            {/* Expiry Date */}
            {expiryDate && (
              <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    {isBangla ? 'মেয়াদোত্তীর্ণ হয়েছে:' : 'Expired on:'}
                  </p>
                  <p className="text-lg font-bold text-red-700 dark:text-red-300">
                    {formatExpiryDate()}
                  </p>
                </div>
              </div>
            )}

            {/* Contact Section */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                {isBangla ? 'পেমেন্ট ও যোগাযোগ' : 'Payment & Contact'}
              </h2>
              
              <div className="space-y-3">
                {/* Phone */}
                <a
                  href={`tel:${contactPhone}`}
                  className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                >
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                      {isBangla ? 'ফোন' : 'Phone'}
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {contactPhone}
                    </p>
                  </div>
                </a>

                {/* Email */}
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                >
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                      {isBangla ? 'ইমেইল' : 'Email'}
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {contactEmail}
                    </p>
                  </div>
                </a>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${contactWhatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                >
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                      WhatsApp
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {contactWhatsapp}
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Renewal Note */}
            <div className="text-center p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
              <RefreshCw className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {isBangla 
                  ? 'পেমেন্ট সম্পন্ন হলে সাবস্ক্রিপশন স্বয়ংক্রিয়ভাবে সক্রিয় হবে।'
                  : 'Once payment is completed, your subscription will be activated automatically.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-6">
          © {new Date().getFullYear()} {settings?.shopName || 'Dokan POS Pro'}. All rights reserved.
        </p>
      </div>
    </div>
  );
}

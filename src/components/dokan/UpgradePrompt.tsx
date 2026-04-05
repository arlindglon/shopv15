'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Sparkles, 
  X, 
  ArrowUp, 
  Package, 
  Users, 
  Truck,
  UserCog,
  CheckCircle,
  Crown,
  Star,
  Building2,
  Phone,
  Mail,
  MessageCircle,
  Shield
} from 'lucide-react';
import { PLAN_INFO, LIMIT_LABELS, FEATURE_LABELS } from '@/hooks/useSubscriptionLimits';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  limitType?: string;
  currentPlan?: string;
  currentCount?: number;
  currentLimit?: number;
  featureName?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactWhatsapp?: string;
  // Alternative simpler props
  message?: string;
  subscription?: {
    plan: string;
    contactPhone?: string;
    contactEmail?: string;
    contactWhatsapp?: string;
    featureLimits?: any;
  } | null;
}

const PLAN_ICONS: Record<string, React.ElementType> = {
  basic: Star,
  premium: Crown,
  enterprise: Building2,
};

const PLAN_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  basic: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-300 dark:border-emerald-700',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  premium: {
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    border: 'border-violet-400 dark:border-violet-600',
    text: 'text-violet-600 dark:text-violet-400',
  },
  enterprise: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-400 dark:border-amber-600',
    text: 'text-amber-600 dark:text-amber-400',
  },
};

const LIMIT_ICONS: Record<string, React.ElementType> = {
  maxProducts: Package,
  maxCustomers: Users,
  maxSuppliers: Truck,
  maxAdmins: Shield,
  maxManagers: UserCog,
  maxStaff: Users,
  maxSellers: Users,
  maxViewers: Users,
};

export default function UpgradePrompt({
  isOpen,
  onClose,
  limitType = '',
  currentPlan = 'basic',
  currentCount,
  currentLimit,
  featureName,
  contactPhone,
  contactEmail,
  contactWhatsapp,
  message,
  subscription,
}: UpgradePromptProps) {
  const { isBangla } = useLanguage();

  // Use subscription data if provided
  const plan = subscription?.plan || currentPlan;
  const phone = subscription?.contactPhone || contactPhone;
  const email = subscription?.contactEmail || contactEmail;
  const whatsapp = subscription?.contactWhatsapp || contactWhatsapp;

  if (!isOpen) return null;

  // Determine next plans to show
  const planOrder = ['basic', 'premium', 'enterprise'];
  const currentIndex = planOrder.indexOf(plan);
  const nextPlans = planOrder.slice(currentIndex + 1);

  const limitLabel = LIMIT_LABELS[limitType];
  const featureLabel = FEATURE_LABELS[limitType];
  const label = limitLabel || featureLabel;
  const Icon = LIMIT_ICONS[limitType] || Sparkles;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <ArrowUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {isBangla ? 'প্ল্যান আপগ্রেড করুন' : 'Upgrade Your Plan'}
              </h2>
              <p className="text-white/80 text-sm">
                {message || (limitType === 'feature' 
                  ? (isBangla 
                      ? `"${featureName}" ফিচারটি আপনার প্ল্যানে নেই`
                      : `"${featureName}" feature is not available in your plan`)
                  : (isBangla
                      ? `${label?.bn || limitType} যোগ করতে আপগ্রেড করুন`
                      : `Upgrade to add more ${label?.en?.toLowerCase() || limitType}`)
                )}
              </p>
            </div>
          </div>
          
          {/* Current Status */}
          {currentCount !== undefined && currentLimit !== undefined && (
            <div className="mt-4 p-3 bg-white/10 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">
                    {isBangla ? 'বর্তমান ব্যবহার:' : 'Current Usage:'}
                  </span>
                </span>
                <span className="font-bold">
                  {currentCount} / {currentLimit === -1 ? '∞' : currentLimit}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {isBangla 
              ? 'আপনার ব্যবসার প্রয়োজন অনুযায়ী উপযুক্ত প্ল্যান নির্বাচন করুন:'
              : 'Choose a plan that fits your business needs:'}
          </p>

          {/* Plan Options */}
          <div className="space-y-3">
            {nextPlans.map((planId) => {
              const plan = PLAN_INFO[planId];
              if (!plan) return null;
              
              const Icon = PLAN_ICONS[planId] || Star;
              const colors = PLAN_COLORS[planId];
              
              return (
                <div
                  key={planId}
                  className={`p-4 rounded-xl border-2 ${colors.border} ${colors.bg} transition-all`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {plan.name[isBangla ? 'bn' : 'en']}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {plan.description[isBangla ? 'bn' : 'en']}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${colors.text}`}>
                        {plan.price[isBangla ? 'bn' : 'en']}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {nextPlans.length === 0 && (
              <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-xl text-center">
                <p className="text-slate-600 dark:text-slate-300">
                  {isBangla 
                    ? 'আপনি সর্বোচ্চ প্ল্যানে আছেন। সীমা বাড়াতে সাপোর্টে যোগাযোগ করুন।'
                    : 'You are on the highest plan. Contact support to increase limits.'}
                </p>
              </div>
            )}
          </div>

          {/* Contact Section */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              {isBangla 
                ? 'আপগ্রেড করতে যোগাযোগ করুন:'
                : 'Contact us to upgrade:'}
            </p>
            
            <div className="grid grid-cols-3 gap-2">
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="flex flex-col items-center gap-1 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">
                    {isBangla ? 'ফোন' : 'Call'}
                  </span>
                </a>
              )}
              
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex flex-col items-center gap-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    {isBangla ? 'ইমেইল' : 'Email'}
                  </span>
                </a>
              )}
              
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    WhatsApp
                  </span>
                </a>
              )}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            {isBangla ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2, Building2, ChevronDown, Sparkles, Shield, Zap } from 'lucide-react';
import SubscriptionExpired from './SubscriptionExpired';

interface Branch {
  id: string;
  name: string;
  code: string;
  isDefault?: boolean;
}

interface ShopSettings {
  shopName: string;
  shopLogo: string;
  shopBio: string;
  subscriptionExpiryDate?: Date | string;
  subscriptionContactPhone?: string;
  subscriptionContactEmail?: string;
  subscriptionContactWhatsapp?: string;
}

interface LoginProps {
  onLogin: (user: { id: string; name: string; email: string; role: string; username: string; permissions?: Record<string, boolean>; branchId?: string; branchName?: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [showBranchSelector, setShowBranchSelector] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<{ id: string; name: string; email: string; role: string; username: string; permissions?: Record<string, boolean> } | null>(null);
  const [shopSettings, setShopSettings] = useState<ShopSettings>({ shopName: '', shopLogo: '', shopBio: '' });
  const [mounted, setMounted] = useState(false);
  const [subscriptionExpired, setSubscriptionExpired] = useState(false);
  const [expiredUser, setExpiredUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    const loadInitialData = async () => {
      try {
        const branchesRes = await fetch('/api/branches');
        const branchesData = await branchesRes.json();
        setBranches(branchesData.data || []);
        const defaultBranch = (branchesData.data || []).find((b: Branch) => b.isDefault);
        if (defaultBranch) {
          setSelectedBranch(defaultBranch.id);
        } else if (branchesData.data?.length > 0) {
          setSelectedBranch(branchesData.data[0].id);
        }
        
        const settingsRes = await fetch('/api/settings');
        const settingsData = await settingsRes.json();
        if (settingsData) {
          setShopSettings({
            shopName: settingsData.shopName || '',
            shopLogo: settingsData.shopLogo || '',
            shopBio: settingsData.shopBio || '',
            subscriptionExpiryDate: settingsData.subscriptionExpiryDate,
            subscriptionContactPhone: settingsData.subscriptionContactPhone,
            subscriptionContactEmail: settingsData.subscriptionContactEmail,
            subscriptionContactWhatsapp: settingsData.subscriptionContactWhatsapp,
          });
        }
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };
    loadInitialData();
  }, []);

  // Check if subscription is expired
  const isSubscriptionExpired = (): boolean => {
    if (!shopSettings.subscriptionExpiryDate) return false;
    const expiryDate = new Date(shopSettings.subscriptionExpiryDate);
    const now = new Date();
    return expiryDate < now;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      // Check subscription expiration
      if (isSubscriptionExpired() && data.user.role !== 'Master Admin') {
        // Subscription expired and user is not Master Admin
        setExpiredUser({ name: data.user.name, role: data.user.role });
        setSubscriptionExpired(true);
        setIsLoading(false);
        return;
      }

      if (branches.length > 1 && !selectedBranch) {
        setLoggedInUser(data.user);
        setShowBranchSelector(true);
        setIsLoading(false);
      } else {
        completeLogin(data.user, selectedBranch);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const completeLogin = (user: { id: string; name: string; email: string; role: string; username: string; permissions?: Record<string, boolean> }, branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    const userData = {
      ...user,
      branchId: branchId,
      branchName: branch?.name,
    };
    
    localStorage.setItem('dokan_user', JSON.stringify(userData));
    localStorage.setItem('dokan_branch', JSON.stringify(branch));
    
    logLogin(user.id, branchId);
    
    onLogin(userData);
  };

  const logLogin = async (userId: string, branchId: string) => {
    try {
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'log_login',
          userId,
          branchId,
          ipAddress: '',
          userAgent: navigator.userAgent,
        }),
      });
    } catch (error) {
      console.error('Failed to log login:', error);
    }
  };

  const handleBranchSelect = (branchId: string) => {
    setSelectedBranch(branchId);
    if (loggedInUser) {
      completeLogin(loggedInUser, branchId);
    }
  };

  // Show subscription expired screen
  if (subscriptionExpired) {
    return <SubscriptionExpired 
      settings={shopSettings} 
      expiryDate={shopSettings.subscriptionExpiryDate}
    />;
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Branch Selector Screen
  if (showBranchSelector && loggedInUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 sm:p-6">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-teal-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-emerald-500/30">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Select Branch</h1>
            <p className="text-slate-400 text-sm sm:text-base">Welcome back, <span className="text-emerald-400 font-medium">{loggedInUser.name}</span>!</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-3 sm:p-4 space-y-2">
            {branches.map((branch, index) => (
              <button
                key={branch.id}
                onClick={() => handleBranchSelect(branch.id)}
                className="w-full p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-emerald-500/50 rounded-2xl text-left transition-all group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {branch.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm sm:text-base">{branch.name}</p>
                      <p className="text-slate-400 text-xs sm:text-sm">{branch.code}</p>
                    </div>
                  </div>
                  <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 rotate-[-90deg] transition-all duration-300" />
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setShowBranchSelector(false);
              setLoggedInUser(null);
            }}
            className="w-full mt-6 py-3 text-slate-400 hover:text-white transition-all text-sm font-medium"
          >
            ← Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-600/10 to-purple-600/10 rounded-full blur-3xl"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBtLTEgMGExIDEgMCAxIDAgMiAwYTEgMSAwIDEgMCAtMiAwIiBmaWxsPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIi8+PC9nPjwvc3ZnPg==')] opacity-50"></div>
      </div>

      <div className={`relative w-full max-w-md ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            {shopSettings.shopLogo ? (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
                <img 
                  src={shopSettings.shopLogo} 
                  alt={shopSettings.shopName || 'Shop'} 
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-contain shadow-2xl"
                />
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
                  <span className="text-4xl sm:text-5xl font-black text-white">{shopSettings.shopName?.charAt(0) || 'D'}</span>
                </div>
              </div>
            )}
            {/* Decorative Badge */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce-soft">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
            {shopSettings.shopName || t('app.name')}
          </h1>
          <p className="text-violet-300 text-sm sm:text-base font-medium">
            {shopSettings.shopBio || t('auth.login_subtitle')}
          </p>
          
          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Secure</span>
            </div>
            <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Fast</span>
            </div>
            <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <Lock className="w-4 h-4 text-violet-400" />
              <span>Encrypted</span>
            </div>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 animate-fade-in">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Branch Selector */}
            {branches.length > 1 && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5" />
                  Branch
                </label>
                <div className="relative">
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full p-4 bg-slate-800/50 border-2 border-slate-700 rounded-2xl outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 font-medium text-white transition-all appearance-none cursor-pointer pr-12"
                  >
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id} className="bg-slate-800 text-white">
                        {branch.name} ({branch.code})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                {t('auth.email')}
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 bg-slate-800/50 border-2 border-slate-700 rounded-2xl outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 font-medium text-white placeholder-slate-500 transition-all"
                  placeholder={t('auth.email_placeholder')}
                  required
                  autoComplete="username"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center opacity-0 group-focus-within:opacity-100 transition-opacity">
                  <Mail className="w-4 h-4 text-violet-400" />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                {t('auth.password')}
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 bg-slate-800/50 border-2 border-slate-700 rounded-2xl outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 font-medium text-white placeholder-slate-500 transition-all pr-14"
                  placeholder={t('auth.password_placeholder')}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white font-bold rounded-2xl uppercase tracking-wider shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 group relative overflow-hidden"
            >
              {/* Button Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('auth.signing_in')}
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  {t('auth.login')}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-3">
          <p className="text-slate-500 text-xs">
            Dokan POS System &copy; {new Date().getFullYear()}
          </p>
          <div className="flex items-center justify-center gap-2 text-slate-600 text-xs">
            <span>Version 12.0</span>
            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
            <span>Production Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

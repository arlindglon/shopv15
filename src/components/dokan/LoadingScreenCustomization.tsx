'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Save, RotateCcw, Eye, Play } from 'lucide-react';

interface LoadingScreenCustomizationProps {
  settings: any;
  lang: string;
}

const ANIMATION_TYPES = [
  { value: 'spinner', label: '🌀 Spinner', labelBn: '🌀 স্পিনার' },
  { value: 'dots', label: '●●● Dots Bounce', labelBn: '●●● ডটস বাউন্স' },
  { value: 'pulse', label: '◯ Pulse Ring', labelBn: '◯ পালস রিং' },
  { value: 'bars', label: '▌▌▌ Bars Wave', labelBn: '▌▌▌ বার্স ওয়েভ' },
  { value: 'orbit', label: '◐ Orbit Spin', labelBn: '◐ অরবিট স্পিন' },
  { value: 'wave', label: '▂▃▄ Wave Bars', labelBn: '▂▃▄ ওয়েভ বার্স' },
];

const LoadingScreenCustomization: React.FC<LoadingScreenCustomizationProps> = ({ settings, lang }) => {
  const [customTitle, setCustomTitle] = useState('');
  const [customSubtitle, setCustomSubtitle] = useState('');
  const [animationType, setAnimationType] = useState('spinner');
  const [showPreview, setShowPreview] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load saved customizations on mount - try DB first, fallback to localStorage
  useEffect(() => {
    const loadFromDB = async () => {
      try {
        const res = await fetch('/api/loading-settings?t=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          if (data.loadingTitle && data.loadingTitle !== data.shopName) setCustomTitle(data.loadingTitle);
          if (data.loadingSubtitle && data.loadingSubtitle !== data.shopBio) setCustomSubtitle(data.loadingSubtitle);
          if (data.loadingAnimationType) setAnimationType(data.loadingAnimationType);
          return;
        }
      } catch {}
      
      // Fallback to localStorage
      const saved = localStorage.getItem('dokan_custom_loading');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setCustomTitle(data.title || '');
          setCustomSubtitle(data.subtitle || '');
          setAnimationType(data.animation || 'spinner');
        } catch {}
      }
    };
    loadFromDB();
  }, []);

  const handleSave = async () => {
    const data = {
      loadingTitle: customTitle || settings?.shopName || 'Dokan',
      loadingSubtitle: customSubtitle || settings?.shopBio || 'Smart Shop Management',
      loadingAnimationType: animationType,
    };
    
    // Save to localStorage as cache
    localStorage.setItem('dokan_custom_loading', JSON.stringify({
      title: customTitle,
      subtitle: customSubtitle,
      animation: animationType,
    }));
    
    // Update the main loading settings cache
    const cached = localStorage.getItem('dokan_loading_settings');
    let loadingSettings = cached ? JSON.parse(cached) : {};
    
    loadingSettings = {
      ...loadingSettings,
      ...data,
    };
    
    localStorage.setItem('dokan_loading_settings', JSON.stringify(loadingSettings));
    
    // Save to DATABASE via API
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      alert(lang === 'bn' ? 'লোডিং স্ক্রিন সেটিংস সংরক্ষিত হয়েছে!' : 'Loading screen settings saved!');
    } catch (error) {
      console.error('Failed to save loading settings:', error);
      alert(lang === 'bn' ? 'সংরক্ষণ ব্যর্থ হয়েছে!' : 'Failed to save!');
    }
  };

  const handleReset = async () => {
    setCustomTitle('');
    setCustomSubtitle('');
    setAnimationType('spinner');
    localStorage.removeItem('dokan_custom_loading');
    
    // Update cache with defaults
    const loadingSettings = {
      shopName: settings?.shopName || 'Dokan',
      shopLogo: settings?.shopLogo || '',
      shopBio: settings?.shopBio || 'Smart Shop Management',
      loadingText: settings?.loadingText || 'Loading...',
      loadingTitle: settings?.shopName || 'Dokan',
      loadingSubtitle: settings?.shopBio || 'Smart Shop Management',
      loadingAnimationType: 'spinner',
    };
    
    localStorage.setItem('dokan_loading_settings', JSON.stringify(loadingSettings));
    
    // Save reset to DB
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loadingTitle: settings?.shopName || 'Dokan',
          loadingSubtitle: settings?.shopBio || 'Smart Shop Management',
          loadingAnimationType: 'spinner',
        }),
      });
    } catch {}
    
    alert(lang === 'bn' ? 'ডিফল্ট সেটিংস পুনরুদ্ধার করা হয়েছে!' : 'Default settings restored!');
  };

  const previewAnimation = () => {
    const title = customTitle || settings?.shopName || 'Dokan';
    const subtitle = customSubtitle || settings?.shopBio || 'Smart Shop Management';
    
    return (
      <div className="relative bg-slate-900 rounded-2xl p-8 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-violet-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative z-10 text-center">
          {/* Logo/Icon */}
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-xl overflow-hidden">
            {settings?.shopLogo ? (
              <img src={settings.shopLogo} alt={title} className="w-full h-full object-contain" />
            ) : (
              <span className="text-2xl font-black text-white">{title.charAt(0)}</span>
            )}
          </div>
          
          {/* Animation Preview */}
          <div className="flex justify-center mb-4 h-8">
            {animationType === 'dots' && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            )}
            {animationType === 'pulse' && (
              <div className="w-6 h-6 bg-purple-500 rounded-full animate-ping"></div>
            )}
            {animationType === 'bars' && (
              <div className="flex items-end gap-1 h-6">
                <div className="w-1.5 h-3 bg-purple-400 rounded animate-pulse"></div>
                <div className="w-1.5 h-6 bg-pink-400 rounded animate-pulse" style={{ animationDelay: '100ms' }}></div>
                <div className="w-1.5 h-4 bg-violet-400 rounded animate-pulse" style={{ animationDelay: '200ms' }}></div>
                <div className="w-1.5 h-5 bg-fuchsia-400 rounded animate-pulse" style={{ animationDelay: '300ms' }}></div>
              </div>
            )}
            {animationType === 'orbit' && (
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 border-2 border-purple-400/30 rounded-full"></div>
                <div className="absolute inset-0 border-2 border-transparent border-t-purple-400 rounded-full animate-spin"></div>
              </div>
            )}
            {animationType === 'wave' && (
              <div className="flex items-center gap-0.5 h-6">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-1 bg-gradient-to-t from-purple-500 to-pink-400 rounded-full animate-pulse" style={{ height: '100%', animationDelay: `${i * 100}ms` }}></div>
                ))}
              </div>
            )}
            {animationType === 'spinner' && (
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 border-2 border-purple-400/30 rounded-lg"></div>
                <div className="absolute inset-0 border-2 border-transparent border-t-purple-400 border-r-pink-400 rounded-lg animate-spin"></div>
              </div>
            )}
          </div>
          
          <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
          <p className="text-purple-300 text-sm">{subtitle}</p>
          <p className="text-slate-500 text-xs mt-2">{lang === 'bn' ? 'লোডিং...' : 'Loading...'}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border-2 border-purple-100">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-purple-700 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          {lang === 'bn' ? 'লোডিং স্ক্রিন কাস্টমাইজেশন' : 'Loading Screen Customization'}
        </h4>
        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
          {lang === 'bn' ? 'নতুন' : 'New'}
        </span>
      </div>
      
      <p className="text-xs text-purple-500">
        {lang === 'bn' 
          ? 'মাস্টার এডমিন হিসেবে আপনি লোডিং স্ক্রিনের টাইটেল, সাবটাইটেল ও অ্যানিমেশন কাস্টমাইজ করতে পারবেন'
          : 'As Master Admin, you can customize the loading screen title, subtitle and animation'}
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-purple-500 tracking-wider">
            {lang === 'bn' ? 'কাস্টম টাইটেল' : 'Custom Title'}
          </label>
          <input 
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            className="w-full p-3 bg-white border-2 border-purple-100 rounded-xl outline-none focus:border-purple-500 font-bold text-slate-900 transition-all text-sm" 
            placeholder={settings?.shopName || 'Dokan'}
          />
          <p className="text-xs text-purple-400">
            {lang === 'bn' ? 'খালি থাকলে দোকানের নাম ব্যবহার হবে' : 'Empty = Shop Name will be used'}
          </p>
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-purple-500 tracking-wider">
            {lang === 'bn' ? 'কাস্টম সাবটাইটেল' : 'Custom Subtitle'}
          </label>
          <input 
            value={customSubtitle}
            onChange={(e) => setCustomSubtitle(e.target.value)}
            className="w-full p-3 bg-white border-2 border-purple-100 rounded-xl outline-none focus:border-purple-500 text-slate-900 transition-all text-sm" 
            placeholder={settings?.shopBio || 'Smart Shop Management'}
          />
          <p className="text-xs text-purple-400">
            {lang === 'bn' ? 'খালি থাকলে ট্যাগলাইন ব্যবহার হবে' : 'Empty = Tagline will be used'}
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase text-purple-500 tracking-wider">
          {lang === 'bn' ? 'অ্যানিমেশন টাইপ' : 'Animation Type'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ANIMATION_TYPES.map((anim) => (
            <button
              key={anim.value}
              type="button"
              onClick={() => setAnimationType(anim.value)}
              className={`p-3 rounded-xl text-left text-sm font-medium transition-all ${
                animationType === anim.value
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white text-slate-600 hover:bg-purple-50 border border-purple-100'
              }`}
            >
              {lang === 'bn' ? anim.labelBn : anim.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Toggle */}
      <button
        type="button"
        onClick={() => setShowPreview(!showPreview)}
        className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
      >
        <Eye className="w-4 h-4" />
        {showPreview 
          ? (lang === 'bn' ? 'প্রিভিউ লুকান' : 'Hide Preview')
          : (lang === 'bn' ? 'প্রিভিউ দেখুন' : 'Show Preview')
        }
      </button>

      {/* Live Preview */}
      {showPreview && previewAnimation()}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg transition-all ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:shadow-xl hover:shadow-purple-500/30'
          }`}
        >
          <Save className="w-4 h-4" />
          {saved 
            ? (lang === 'bn' ? 'সংরক্ষিত!' : 'Saved!') 
            : (lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Settings')
          }
        </button>
        
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm text-purple-600 hover:bg-purple-100 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          {lang === 'bn' ? 'ডিফল্ট' : 'Reset'}
        </button>
      </div>
    </div>
  );
};

export default LoadingScreenCustomization;

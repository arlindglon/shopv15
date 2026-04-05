'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { View } from '@/types';
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
  Menu,
  X,
  Scan,
  LogOut,
  User as UserIcon,
  Globe,
  ChevronRight,
  ChevronLeft,
  Activity,
  HelpCircle,
  Bell,
  Moon,
  Sun,
  Search,
  Home,
  Zap,
  Clock
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface NavItem {
  view: View;
  label: string;
  icon: React.ReactNode;
  permission?: string;
  gradient?: string;
}

export interface AppLayoutProps {
  children: React.ReactNode;
  activeView: View;
  onViewChange: (view: View) => void;
  currentUser: {
    id: string;
    name: string;
    email?: string;
    role: string;
  } | null;
  onLogout: () => void;
  settings?: {
    shopName?: string;
    shopLogo?: string;
    shopBio?: string;
  } | null;
  navItems: NavItem[];
  language?: 'en' | 'bn';
  onLanguageChange?: (lang: 'en' | 'bn') => void;
  liveTime?: Date;
  formatLiveTime?: () => string;
}

// ============================================
// CONSTANTS
// ============================================

const SIDEBAR_EXPANDED_WIDTH = 256; // 16rem = 256px
const SIDEBAR_COLLAPSED_WIDTH = 64; // 4rem = 64px
const HEADER_HEIGHT = 64; // 4rem = 64px

// ============================================
// THEME CONTEXT
// ============================================

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
});

export const useTheme = () => React.useContext(ThemeContext);

// ============================================
// THEME PROVIDER
// ============================================

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('dokan_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    }
    setIsDark(shouldBeDark);
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const newValue = !prev;
      if (newValue) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('dokan_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('dokan_theme', 'light');
      }
      return newValue;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================
// SIDEBAR COMPONENT
// ============================================

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  activeView: View;
  onViewChange: (view: View) => void;
  navItems: NavItem[];
  currentUser: AppLayoutProps['currentUser'];
  onLogout: () => void;
  settings: AppLayoutProps['settings'];
  language: 'en' | 'bn';
  onLanguageChange: (lang: 'en' | 'bn') => void;
  liveTime?: Date;
  formatLiveTime?: () => string;
}

function Sidebar({
  isCollapsed,
  setIsCollapsed,
  activeView,
  onViewChange,
  navItems,
  currentUser,
  onLogout,
  settings,
  language,
  onLanguageChange,
  liveTime,
  formatLiveTime,
}: SidebarProps) {
  return (
    <aside
      className={`
        hidden lg:flex flex-col
        bg-sidebar text-sidebar-foreground
        border-r border-sidebar-border
        sticky top-0 h-screen
        transition-all duration-300 ease-in-out
        flex-shrink-0 z-40
      `}
      style={{ width: isCollapsed ? `${SIDEBAR_COLLAPSED_WIDTH}px` : `${SIDEBAR_EXPANDED_WIDTH}px` }}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo Section */}
      <div className={`
        p-4 flex items-center
        border-b border-sidebar-border
        ${isCollapsed ? 'justify-center' : 'gap-3'}
      `}>
        {settings?.shopLogo ? (
          <img
            src={settings.shopLogo}
            alt={settings.shopName || 'Shop'}
            className="w-10 h-10 rounded-xl object-contain flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
        )}
        {!isCollapsed && (
          <div className="overflow-hidden animate-fade-in">
            <span className="text-base font-bold tracking-tight block leading-tight truncate">
              {settings?.shopName?.split(' ')[0] || 'Dokan'}
            </span>
            <span className="text-xs text-muted-foreground truncate block">
              {settings?.shopBio || 'POS Pro'}
            </span>
          </div>
        )}
      </div>

      {/* Live Clock & Language Toggle */}
      {!isCollapsed && (
        <div className="px-3 py-3 space-y-2 border-b border-sidebar-border">
          {/* Live Clock */}
          {liveTime && formatLiveTime && (
            <div className="flex items-center justify-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-mono font-medium text-foreground">
                {formatLiveTime()}
              </span>
            </div>
          )}
          {/* Language Toggle */}
          <button
            onClick={() => onLanguageChange(language === 'en' ? 'bn' : 'en')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            aria-label={`Switch to ${language === 'en' ? 'Bengali' : 'English'}`}
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {language === 'en' ? 'বাংলা' : 'English'}
              </span>
            </div>
            <div className={`w-8 h-5 rounded-full transition-colors ${language === 'bn' ? 'bg-primary' : 'bg-muted'} relative`}>
              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all duration-200 ${language === 'bn' ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </button>
        </div>
      )}

      {/* Collapsed Clock Icon */}
      {isCollapsed && liveTime && formatLiveTime && (
        <div className="px-3 py-3 flex justify-center border-b border-sidebar-border">
          <div className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group relative">
            <Clock className="w-5 h-5 text-primary" />
            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground rounded-md text-sm font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
              {formatLiveTime()}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Navigation menu">
        {navItems.map((item) => {
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200 group relative
                ${isCollapsed ? 'justify-center' : ''}
                ${isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'hover:bg-accent text-sidebar-foreground hover:text-accent-foreground'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
              title={isCollapsed ? item.label : undefined}
            >
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                transition-all duration-200
                ${isActive
                  ? 'bg-primary-foreground/20'
                  : 'bg-secondary/50 group-hover:bg-secondary'
                }
              `}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <>
                  <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground rounded-md text-sm font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-3 border-t border-sidebar-border">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center font-bold text-white shadow-md flex-shrink-0">
              {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 overflow-hidden min-w-0">
              <p className="text-sm font-semibold truncate">{currentUser?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{currentUser?.email || currentUser?.role || ''}</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogout}
            className="w-full p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all flex justify-center"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-3 flex justify-center border-t border-sidebar-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center">
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </div>
      </button>
    </aside>
  );
}

// ============================================
// MOBILE SIDEBAR COMPONENT
// ============================================

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: View;
  onViewChange: (view: View) => void;
  navItems: NavItem[];
  currentUser: AppLayoutProps['currentUser'];
  onLogout: () => void;
  settings: AppLayoutProps['settings'];
  language: 'en' | 'bn';
  onLanguageChange: (lang: 'en' | 'bn') => void;
  liveTime?: Date;
  formatLiveTime?: () => string;
}

function MobileSidebar({
  isOpen,
  onClose,
  activeView,
  onViewChange,
  navItems,
  currentUser,
  onLogout,
  settings,
  language,
  onLanguageChange,
  liveTime,
  formatLiveTime,
}: MobileSidebarProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Navigation menu">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Panel */}
      <aside className="absolute left-0 top-0 h-full w-72 bg-sidebar text-sidebar-foreground shadow-2xl animate-slide-in-left overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            {settings?.shopLogo ? (
              <img
                src={settings.shopLogo}
                alt={settings.shopName || 'Shop'}
                className="w-10 h-10 rounded-xl object-contain"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <span className="text-base font-bold block leading-tight">
                {settings?.shopName?.split(' ')[0] || 'Dokan'}
              </span>
              <span className="text-xs text-muted-foreground">{settings?.shopBio || 'POS Pro'}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Clock & Language */}
        <div className="p-3 space-y-2 border-b border-sidebar-border">
          {liveTime && formatLiveTime && (
            <div className="flex items-center justify-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-mono font-medium">{formatLiveTime()}</span>
            </div>
          )}
          <button
            onClick={() => onLanguageChange(language === 'en' ? 'bn' : 'en')}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{language === 'en' ? 'বাংলা' : 'English'}</span>
            </div>
            <div className={`w-8 h-5 rounded-full transition-colors ${language === 'bn' ? 'bg-primary' : 'bg-muted'} relative`}>
              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all duration-200 ${language === 'bn' ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => {
                  onViewChange(item.view);
                  onClose();
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200
                  ${isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'hover:bg-accent text-sidebar-foreground hover:text-accent-foreground'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                  ${isActive ? 'bg-primary-foreground/20' : 'bg-secondary/50'}
                `}>
                  {item.icon}
                </div>
                <span className="text-sm font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center font-bold text-white shadow-md">
              {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 overflow-hidden min-w-0">
              <p className="text-sm font-semibold truncate">{currentUser?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{currentUser?.role || ''}</p>
            </div>
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

// ============================================
// HEADER COMPONENT
// ============================================

interface HeaderProps {
  activeView: View;
  navItems: NavItem[];
  onMenuClick: () => void;
  language: 'en' | 'bn';
  onLanguageChange: (lang: 'en' | 'bn') => void;
  liveTime?: Date;
  formatLiveTime?: () => string;
  isDark: boolean;
  toggleTheme: () => void;
}

function Header({
  activeView,
  navItems,
  onMenuClick,
  language,
  onLanguageChange,
  liveTime,
  formatLiveTime,
  isDark,
  toggleTheme,
}: HeaderProps) {
  const activeItem = navItems.find(item => item.view === activeView);
  const [notificationCount] = useState(3); // Mock notification count

  return (
    <header
      className="h-16 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 bg-background/80 backdrop-blur-xl border-b border-border"
      role="banner"
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Title & Breadcrumb */}
        <div className="flex items-center gap-3">
          <div className={`
            w-9 h-9 rounded-lg flex items-center justify-center
            ${activeItem?.gradient ? `bg-gradient-to-r ${activeItem.gradient}` : 'bg-gradient-primary'}
            shadow-md
          `}>
            {activeItem?.icon || <LayoutDashboard className="w-5 h-5 text-white" />}
          </div>
          <div className="hidden sm:block">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
              <ol className="flex items-center gap-2">
                <li>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Home className="w-4 h-4" />
                    <span className="hidden md:inline">Home</span>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground">{activeItem?.label || activeView}</span>
                </li>
              </ol>
            </nav>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          {/* Mobile Page Title */}
          <div className="sm:hidden">
            <h1 className="text-base font-semibold">{activeItem?.label || activeView}</h1>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Live Clock - Desktop */}
        {liveTime && formatLiveTime && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-lg mr-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono font-medium">{formatLiveTime()}</span>
          </div>
        )}

        {/* Search - Desktop */}
        <button
          className="hidden lg:flex p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Language Toggle - Desktop */}
        <button
          onClick={() => onLanguageChange(language === 'en' ? 'bn' : 'en')}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          aria-label={`Switch to ${language === 'en' ? 'Bengali' : 'English'}`}
        >
          <Globe className="w-4 h-4" />
          <span className="text-xs font-semibold">{language === 'en' ? 'বাং' : 'EN'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button
          className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground relative"
          aria-label={`Notifications ${notificationCount > 0 ? `(${notificationCount} unread)` : ''}`}
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

// ============================================
// FOOTER COMPONENT
// ============================================

interface FooterProps {
  isCollapsed: boolean;
}

function Footer({ isCollapsed }: FooterProps) {
  return (
    <footer
      className={`
        py-4 px-6 border-t border-border bg-background/50
        transition-all duration-300
        text-center text-sm text-muted-foreground
      `}
      style={{ marginLeft: isCollapsed ? 0 : 0 }}
    >
      <p>
        &copy; {new Date().getFullYear()} Dokan POS Pro. All rights reserved.
      </p>
    </footer>
  );
}

// ============================================
// MAIN APP LAYOUT COMPONENT
// ============================================

function AppLayoutContent({
  children,
  activeView,
  onViewChange,
  currentUser,
  onLogout,
  settings,
  navItems,
  language = 'en',
  onLanguageChange,
  liveTime,
  formatLiveTime,
}: AppLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          activeView={activeView}
          onViewChange={onViewChange}
          navItems={navItems}
          currentUser={currentUser}
          onLogout={onLogout}
          settings={settings}
          language={language}
          onLanguageChange={onLanguageChange || (() => {})}
          liveTime={liveTime}
          formatLiveTime={formatLiveTime}
        />

        {/* Mobile Sidebar */}
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          activeView={activeView}
          onViewChange={onViewChange}
          navItems={navItems}
          currentUser={currentUser}
          onLogout={onLogout}
          settings={settings}
          language={language}
          onLanguageChange={onLanguageChange || (() => {})}
          liveTime={liveTime}
          formatLiveTime={formatLiveTime}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          {/* Header */}
          <Header
            activeView={activeView}
            navItems={navItems}
            onMenuClick={() => setIsMobileSidebarOpen(true)}
            language={language}
            onLanguageChange={onLanguageChange || (() => {})}
            liveTime={liveTime}
            formatLiveTime={formatLiveTime}
            isDark={isDark}
            toggleTheme={toggleTheme}
          />

          {/* Page Content */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-[1600px] mx-auto">
              {children}
            </div>
          </div>

          {/* Footer */}
          <Footer isCollapsed={isSidebarCollapsed} />
        </main>
      </div>
    </div>
  );
}

// ============================================
// EXPORTED APP LAYOUT COMPONENT
// ============================================

export default function AppLayout(props: AppLayoutProps) {
  return (
    <ThemeProvider>
      <AppLayoutContent {...props} />
    </ThemeProvider>
  );
}

// Note: useTheme is exported at line 92
// NavItem and AppLayoutProps types are exported at their definition

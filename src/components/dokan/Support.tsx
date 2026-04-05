import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  HelpCircle, MessageCircle, Video, BookOpen, ChevronDown, ChevronUp,
  Youtube, Mail, Phone, MapPin, Clock, Send, ExternalLink, Play,
  Search, FileText, Users, Zap, Package, ShoppingCart, BarChart3,
  Settings, Database, Cloud, Shield, Globe, CreditCard, Calculator,
  CheckCircle, AlertCircle, Plus, X, Edit, Trash2, Save,
  Facebook, Instagram, Link as LinkIcon, FileVideo, Tv, RefreshCw
} from 'lucide-react';
import { getVideoInfo, getPlatformName, isValidVideoUrl, VideoInfo } from '@/lib/video-utils';

// ============================================
// SUPPORT SETTINGS INTERFACE
// ============================================
export interface SupportSettings {
  // Contact Info
  supportEmail: string;
  supportPhone: string;
  supportAddress: string;
  supportHours: string;
  
  // Social Links
  supportFacebook: string;
  supportWhatsapp: string;
  supportYoutube: string;
  
  // Video Tutorials
  tutorials: VideoTutorial[];
  
  // FAQ
  faqs: FAQItem[];
  
  // Custom Categories
  tutorialCategories: TutorialCategory[];
  faqCategories: FAQCategory[];
  
  // Developer Info
  developerName: string;
  developerWebsite: string;
  developerEmail: string;
}

export interface TutorialCategory {
  id: string;
  label: string;
  labelBn: string;
  icon: string;
  order: number;
}

export interface FAQCategory {
  id: string;
  label: string;
  labelBn: string;
  order: number;
}

export interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  videoUrl: string; // Just paste URL - auto-detected!
  thumbnail?: string;
  category: string;
  duration?: string;
  order: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

// Default categories
const DEFAULT_TUTORIAL_CATEGORIES: TutorialCategory[] = [
  { id: 'all', label: 'All', labelBn: 'সব', icon: 'BookOpen', order: 0 },
  { id: 'basics', label: 'Basics', labelBn: 'বেসিক', icon: 'Zap', order: 1 },
  { id: 'inventory', label: 'Inventory', labelBn: 'ইনভেন্টরি', icon: 'Package', order: 2 },
  { id: 'sales', label: 'Sales', labelBn: 'সেলস', icon: 'ShoppingCart', order: 3 },
  { id: 'reports', label: 'Reports', labelBn: 'রিপোর্ট', icon: 'BarChart3', order: 4 },
  { id: 'settings', label: 'Settings', labelBn: 'সেটিংস', icon: 'Settings', order: 5 },
  { id: 'backup', label: 'Backup', labelBn: 'ব্যাকআপ', icon: 'Cloud', order: 6 },
];

const DEFAULT_FAQ_CATEGORIES: FAQCategory[] = [
  { id: 'general', label: 'General', labelBn: 'সাধারণ', order: 0 },
  { id: 'inventory', label: 'Inventory', labelBn: 'ইনভেন্টরি', order: 1 },
  { id: 'sales', label: 'Sales', labelBn: 'সেলস', order: 2 },
  { id: 'users', label: 'Users', labelBn: 'ইউজার', order: 3 },
  { id: 'backup', label: 'Backup', labelBn: 'ব্যাকআপ', order: 4 },
  { id: 'settings', label: 'Settings', labelBn: 'সেটিংস', order: 5 },
];

// ============================================
// VIDEO CARD COMPONENT
// ============================================
interface VideoCardProps {
  tutorial: VideoTutorial;
  onClick?: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ tutorial, onClick }) => {
  const [showPlayer, setShowPlayer] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const videoInfo = getVideoInfo(tutorial.videoUrl);
  
  // Get thumbnail - use custom or auto-generated
  const thumbnailUrl = tutorial.thumbnail || videoInfo.thumbnailUrl;
  
  // Get platform badge color
  const getPlatformColor = (platform: VideoInfo['platform']) => {
    switch (platform) {
      case 'youtube': return 'bg-red-600';
      case 'vimeo': return 'bg-blue-500';
      case 'facebook': return 'bg-blue-600';
      case 'dailymotion': return 'bg-blue-400';
      case 'tiktok': return 'bg-black';
      case 'direct': return 'bg-emerald-600';
      default: return 'bg-slate-600';
    }
  };

  const getPlatformIcon = (platform: VideoInfo['platform']) => {
    switch (platform) {
      case 'youtube': return <Youtube className="w-4 h-4" />;
      case 'vimeo': return <Tv className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'direct': return <FileVideo className="w-4 h-4" />;
      default: return <Video className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all group">
      <div className="relative aspect-video bg-slate-900">
        {!showPlayer ? (
          <>
            {/* Thumbnail */}
            <img
              src={imageError ? '/video-placeholder.png' : thumbnailUrl}
              alt={tutorial.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
              <button
                onClick={() => setShowPlayer(true)}
                className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <Play className="w-8 h-8 text-white ml-1" />
              </button>
            </div>
            
            {/* Platform Badge */}
            <div className={`absolute top-3 left-3 ${getPlatformColor(videoInfo.platform)} text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1`}>
              {getPlatformIcon(videoInfo.platform)}
              {getPlatformName(videoInfo.platform)}
            </div>
            
            {/* Duration Badge */}
            {tutorial.duration && (
              <span className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 text-white text-xs rounded font-medium">
                {tutorial.duration}
              </span>
            )}
          </>
        ) : (
          // Video Player
          <div className="w-full h-full">
            {videoInfo.isDirectVideo ? (
              <video
                src={videoInfo.embedUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            ) : (
              <iframe
                src={videoInfo.embedUrl + '?autoplay=1'}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">{tutorial.title}</h3>
        <p className="text-slate-500 text-sm line-clamp-2">{tutorial.description}</p>
      </div>
    </div>
  );
};

// ============================================
// SUPPORT COMPONENT
// ============================================
interface Props {
  currentUserRole?: string;
}

const Support: React.FC<Props> = ({ currentUserRole }) => {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'tutorials' | 'faq' | 'contact' | 'docs'>('tutorials');
  const [settings, setSettings] = useState<SupportSettings | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchSupportSettings = async () => {
    try {
      // Add cache-busting to always get fresh data
      const res = await fetch(`/api/support-settings?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setSettingsLoaded(true);
      }
    } catch (error) {
      console.error('Failed to fetch support settings:', error);
      setSettingsLoaded(true);
    }
  };

  useEffect(() => {
    fetchSupportSettings();
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitSuccess(true);
    setIsSubmitting(false);
    setContactForm({ name: '', email: '', subject: '', message: '' });
    
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  // ONLY show data from Settings (DB). No hardcoded defaults.
  const tutorials = settings?.tutorials || [];
  const faqs = settings?.faqs || [];
  const tutorialCategories = settings?.tutorialCategories?.length ? settings.tutorialCategories : DEFAULT_TUTORIAL_CATEGORIES;
  const faqCategories = settings?.faqCategories?.length ? settings.faqCategories : DEFAULT_FAQ_CATEGORIES;

  const filteredTutorials = tutorials.filter(t => 
    selectedCategory === 'all' || t.category === selectedCategory
  ).filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Documentation notes state (saved in Supabase DB — works across all devices)
  const [notes, setNotes] = useState<Array<{ id: string; title: string; content: string; createdBy?: string; createdAt: string; updatedAt: string }>>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);

  const isMasterAdmin = currentUserRole === 'Master Admin';

  // Fetch notes from database
  const fetchNotes = async () => {
    setNotesLoading(true);
    try {
      const res = await fetch('/api/support-notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setNotesLoading(false);
    }
  };

  // Load notes on mount
  useEffect(() => {
    fetchNotes();
  }, []);

  const handleAddNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;
    try {
      const res = await fetch('/api/support-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: noteTitle.trim(),
          content: noteContent.trim(),
          createdBy: currentUserRole || '',
        }),
      });
      if (res.ok) {
        setNoteTitle('');
        setNoteContent('');
        setIsAddingNote(false);
        await fetchNotes();
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNoteId || !noteTitle.trim() || !noteContent.trim()) return;
    try {
      const res = await fetch('/api/support-notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingNoteId,
          title: noteTitle.trim(),
          content: noteContent.trim(),
        }),
      });
      if (res.ok) {
        setEditingNoteId(null);
        setNoteTitle('');
        setNoteContent('');
        setIsAddingNote(false);
        await fetchNotes();
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/support-notes?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (editingNoteId === id) {
          setEditingNoteId(null);
          setNoteTitle('');
          setNoteContent('');
        }
        await fetchNotes();
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const startEditing = (note: typeof notes[0]) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setIsAddingNote(true);
  };

  const filteredFaqs = faqs.filter(f =>
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get icon component from string
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      'BookOpen': <BookOpen className="w-4 h-4" />,
      'Zap': <Zap className="w-4 h-4" />,
      'Package': <Package className="w-4 h-4" />,
      'ShoppingCart': <ShoppingCart className="w-4 h-4" />,
      'BarChart3': <BarChart3 className="w-4 h-4" />,
      'Settings': <Settings className="w-4 h-4" />,
      'Cloud': <Cloud className="w-4 h-4" />,
      'Users': <Users className="w-4 h-4" />,
      'Database': <Database className="w-4 h-4" />,
      'Shield': <Shield className="w-4 h-4" />,
      'CreditCard': <CreditCard className="w-4 h-4" />,
      'Calculator': <Calculator className="w-4 h-4" />,
    };
    return icons[iconName] || <BookOpen className="w-4 h-4" />;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/5 rounded-full blur-xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                {lang === 'bn' ? 'সাপোর্ট সেন্টার' : 'Support Center'}
              </h1>
              <p className="text-emerald-100 text-sm mt-1">
                {lang === 'bn' ? 'আমরা সাহায্য করতে এখানে আছি' : "We're here to help you"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-white text-sm">
              <Clock className="w-4 h-4" />
              <span>{settings?.supportHours || '24/7 Support'}</span>
            </div>
            <button
              onClick={fetchSupportSettings}
              className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/30 transition-all"
              title={lang === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'tutorials', icon: <Video className="w-4 h-4" />, label: lang === 'bn' ? 'ভিডিও টিউটোরিয়াল' : 'Video Tutorials' },
          { id: 'faq', icon: <HelpCircle className="w-4 h-4" />, label: lang === 'bn' ? 'সাধারণ প্রশ্ন' : 'FAQ' },
          { id: 'contact', icon: <MessageCircle className="w-4 h-4" />, label: lang === 'bn' ? 'যোগাযোগ' : 'Contact Us' },
          { id: 'docs', icon: <FileText className="w-4 h-4" />, label: lang === 'bn' ? 'ডকুমেন্টেশন' : 'Documentation' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 mb-6 border border-slate-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={lang === 'bn' ? 'সার্চ করুন...' : 'Search...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border-2 border-slate-100 focus:border-emerald-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Content */}
      {activeTab === 'tutorials' && (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {tutorialCategories
              .sort((a, b) => a.order - b.order)
              .map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {getIconComponent(cat.icon)}
                  {lang === 'bn' ? cat.labelBn : cat.label}
                </button>
              ))}
          </div>

          {/* Tutorial Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutorials.map((tutorial) => (
              <VideoCard key={tutorial.id} tutorial={tutorial} />
            ))}
          </div>

          {filteredTutorials.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <Video className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">
                {lang === 'bn' ? 'কোনো টিউটোরিয়াল নেই' : 'No tutorials found'}
              </p>
              <p className="text-slate-400 text-sm mt-1">
                {lang === 'bn'
                  ? 'Settings → Support Management থেকে টিউটোরিয়াল যোগ করুন'
                  : 'Add tutorials from Settings → Support Management'}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'faq' && (
        <div className="space-y-4">
          {filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                    <HelpCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="font-semibold text-slate-900">{faq.question}</span>
                </div>
                {expandedFaq === faq.id ? (
                  <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                )}
              </button>
              {expandedFaq === faq.id && (
                <div className="px-5 pb-5 pt-0">
                  <p className="text-slate-600 leading-relaxed pl-13 ml-0" style={{ paddingLeft: '52px' }}>
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">
                {lang === 'bn' ? 'কোনো FAQ নেই' : 'No FAQs found'}
              </p>
              <p className="text-slate-400 text-sm mt-1">
                {lang === 'bn'
                  ? 'Settings → Support Management থেকে FAQ যোগ করুন'
                  : 'Add FAQs from Settings → Support Management'}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-600" />
                {lang === 'bn' ? 'মেসেজ পাঠান' : 'Send a Message'}
              </h3>
            </div>
            <form onSubmit={handleContactSubmit} className="p-6 space-y-4">
              {submitSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">
                    {lang === 'bn' ? 'মেসেজ পাঠানো হয়েছে!' : 'Message Sent!'}
                  </h4>
                  <p className="text-slate-500 text-sm">
                    {lang === 'bn' ? 'আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব' : "We'll get back to you soon"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">
                        {lang === 'bn' ? 'নাম' : 'Name'} *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none"
                        placeholder={lang === 'bn' ? 'আপনার নাম' : 'Your name'}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">
                        {lang === 'bn' ? 'ইমেইল' : 'Email'} *
                      </label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">
                      {lang === 'bn' ? 'বিষয়' : 'Subject'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none"
                      placeholder={lang === 'bn' ? 'মেসেজের বিষয়' : 'Message subject'}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">
                      {lang === 'bn' ? 'মেসেজ' : 'Message'} *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none resize-none"
                      placeholder={lang === 'bn' ? 'আপনার মেসেজ লিখুন...' : 'Write your message...'}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {lang === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...'}
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {lang === 'bn' ? 'মেসেজ পাঠান' : 'Send Message'}
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-green-50 to-emerald-50">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-green-600" />
                  {lang === 'bn' ? 'দ্রুত যোগাযোগ' : 'Quick Contact'}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {settings?.supportEmail && (
                  <a
                    href={`mailto:${settings.supportEmail}`}
                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{lang === 'bn' ? 'ইমেইল' : 'Email'}</p>
                      <p className="font-semibold text-slate-900">{settings.supportEmail}</p>
                    </div>
                  </a>
                )}
                {settings?.supportPhone && (
                  <a
                    href={`tel:${settings.supportPhone}`}
                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{lang === 'bn' ? 'ফোন' : 'Phone'}</p>
                      <p className="font-semibold text-slate-900">{settings.supportPhone}</p>
                    </div>
                  </a>
                )}
                {settings?.supportAddress && (
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{lang === 'bn' ? 'ঠিকানা' : 'Address'}</p>
                      <p className="font-semibold text-slate-900">{settings.supportAddress}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-pink-50">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-600" />
                  {lang === 'bn' ? 'সোশ্যাল মিডিয়া' : 'Social Media'}
                </h3>
              </div>
              <div className="p-6 grid grid-cols-3 gap-3">
                {settings?.supportFacebook && (
                  <a
                    href={settings.supportFacebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all"
                  >
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                      <Facebook className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-blue-700">Facebook</span>
                  </a>
                )}
                {settings?.supportWhatsapp && (
                  <a
                    href={`https://wa.me/${settings.supportWhatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all"
                  >
                    <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-green-700">WhatsApp</span>
                  </a>
                )}
                {settings?.supportYoutube && (
                  <a
                    href={settings.supportYoutube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-all"
                  >
                    <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                      <Youtube className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-red-700">YouTube</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'docs' && (
        <div className="space-y-6">
          {/* Product Photo Gallery Button */}
          <a
            href="https://poto-lsrx.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-xl" />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <Package className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {lang === 'bn' ? 'প্রোডাক্ট ফটো গ্যালারি' : 'Product Photo Gallery'}
                  </h2>
                  <p className="text-emerald-100 text-sm mt-1">
                    {lang === 'bn' ? 'প্রোডাক্টের ছবি দেখতে ক্লিক করুন' : 'Click to view product photos'}
                  </p>
                </div>
              </div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <ExternalLink className="w-6 h-6 text-white" />
              </div>
            </div>
          </a>

          {/* Documentation / Notes Section */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                {lang === 'bn' ? '📝 ডকুমেন্টেশন' : '📝 Documentation'}
              </h3>
              {isMasterAdmin && !isAddingNote && (
                <button
                  onClick={() => { setIsAddingNote(true); setEditingNoteId(null); setNoteTitle(''); setNoteContent(''); }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  {lang === 'bn' ? 'নতুন নোট' : 'Add Note'}
                </button>
              )}
            </div>

            {/* Add / Edit Note Form */}
            {isAddingNote && isMasterAdmin && (
              <div className="p-5 border-b border-slate-100 bg-emerald-50/50">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder={lang === 'bn' ? 'নোটের শিরোনাম...' : 'Note title...'}
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm font-medium"
                  />
                  <textarea
                    placeholder={lang === 'bn' ? 'ডকুমেন্টেশন বা নোট লিখুন...' : 'Write documentation or note...'}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    rows={5}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm resize-none leading-relaxed"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={editingNoteId ? handleUpdateNote : handleAddNote}
                      disabled={!noteTitle.trim() || !noteContent.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      {editingNoteId
                        ? (lang === 'bn' ? 'আপডেট করুন' : 'Update')
                        : (lang === 'bn' ? 'সেভ করুন' : 'Save')
                      }
                    </button>
                    <button
                      onClick={() => { setIsAddingNote(false); setEditingNoteId(null); setNoteTitle(''); setNoteContent(''); }}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-300 transition-all"
                    >
                      <X className="w-4 h-4" />
                      {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notes List */}
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {notesLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">
                    {lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
                  </p>
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">
                    {lang === 'bn'
                      ? (isMasterAdmin ? 'কোনো ডকুমেন্টেশন নেই। উপরে থেকে নতুন নোট যোগ করুন।' : 'কোনো ডকুমেন্টেশন নেই।')
                      : (isMasterAdmin ? 'No documentation yet. Add a new note above.' : 'No documentation available.')
                    }
                  </p>
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="p-5 hover:bg-slate-50 transition-all group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 mb-1">{note.title}</h4>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
                        <p className="text-slate-400 text-xs mt-2">
                          {new Date(note.updatedAt).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {isMasterAdmin && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => startEditing(note)}
                            className="p-2 bg-slate-100 hover:bg-emerald-100 rounded-lg transition-all"
                            title={lang === 'bn' ? 'এডিট করুন' : 'Edit'}
                          >
                            <Edit className="w-4 h-4 text-slate-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-2 bg-slate-100 hover:bg-red-100 rounded-lg transition-all"
                            title={lang === 'bn' ? 'ডিলিট করুন' : 'Delete'}
                          >
                            <Trash2 className="w-4 h-4 text-slate-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;

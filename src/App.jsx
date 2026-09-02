import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import WhatsAppGenerator from './components/WhatsAppGenerator';
import TwitterGenerator from './components/TwitterGenerator';
import PricingModal from './components/PricingModal';
import { 
  MessageSquare, Twitter, Sparkles, ExternalLink, Github, 
  User as UserIcon, LogOut, Zap, Crown, Home, Layers, CheckCircle2
} from 'lucide-react';

function MainLayout() {
  const [view, setView] = useState('landing'); // 'landing' | 'studio'
  const [activeTab, setActiveTab] = useState('whatsapp'); // 'whatsapp' | 'twitter'
  const { 
    user, 
    handleGoogleSuccess, 
    handleDemoLogin, 
    handleLogout, 
    upgradeModalOpen, 
    setUpgradeModalOpen 
  } = useAuth();

  const getPlanBadge = (plan) => {
    switch (plan) {
      case 'bronze':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">BRONZE</span>;
      case 'gold':
        return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-xs">GOLD ⭐</span>;
      case 'platinum':
        return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs">PLATINUM 👑</span>;
      default:
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">FREE</span>;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0b0e14] text-neutral-100 font-sans overflow-hidden select-none">
      
      {/* GLOBAL TOP NAVIGATION BAR */}
      <header className="h-14 border-b border-neutral-800 bg-[#10141d] px-3 sm:px-6 flex items-center justify-between shrink-0 z-30">
        
        {/* Brand & Landing Switcher */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setView('landing')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-neutral-950 font-black text-base shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
              A
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">AUinAja</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-semibold uppercase">SaaS</span>
              </div>
              <p className="text-[9px] text-neutral-400 leading-none hidden sm:block">Simulator Cerita AU</p>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-neutral-800 hidden sm:block mx-1"></div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setView('landing')}
              className={`px-3 py-1.5 rounded-lg transition ${
                view === 'landing' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => setView('studio')}
              className={`px-3 py-1.5 rounded-lg transition ${
                view === 'studio' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Buka Studio
            </button>
          </div>
        </div>

        {/* Tab Switcher (In Studio Mode) */}
        {view === 'studio' && (
          <div className="flex items-center bg-neutral-900/90 p-1 rounded-xl border border-neutral-800 shadow-inner">
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'whatsapp'
                  ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => setActiveTab('twitter')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'twitter'
                  ? 'bg-[#1d9bf0] text-white shadow-md shadow-[#1d9bf0]/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Twitter className="w-3.5 h-3.5 fill-current" />
              <span>X Post</span>
            </button>
          </div>
        )}

        {/* Right Section: Auth & Subscription */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Upgrade Button */}
          <button
            onClick={() => setUpgradeModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-yellow-500/40 text-yellow-300 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Zap className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="hidden sm:inline">Paket Langganan</span>
          </button>

          {/* User Profile or Login */}
          {user ? (
            <div className="flex items-center gap-2 bg-neutral-900/80 p-1 pr-2 rounded-xl border border-neutral-800">
              <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 border border-neutral-700">
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <div className="hidden lg:flex flex-col text-left leading-none">
                <span className="text-xs font-bold text-neutral-200 truncate max-w-[100px]">{user.name}</span>
                <span className="text-[10px] text-emerald-400 font-medium">{user.remainingExports ?? 0}/{user.dailyLimit ?? 1} export</span>
              </div>
              {getPlanBadge(user.plan)}
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 rounded transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {/* Google Login Component */}
              <div className="scale-90 origin-right">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => console.log('Login Failed')}
                  theme="filled_black"
                  shape="pill"
                  size="medium"
                  text="signin_with"
                />
              </div>

              {/* Fast Demo login for testing */}
              <button
                onClick={() => handleDemoLogin('free')}
                className="hidden sm:block text-[11px] text-neutral-400 hover:text-white px-2 py-1 bg-neutral-800 rounded-lg"
                title="Login Cepat Akun Demo"
              >
                Demo
              </button>
            </div>
          )}

        </div>
      </header>

      {/* BODY VIEW */}
      <main className="flex-1 overflow-hidden relative">
        {view === 'landing' ? (
          <div className="h-full overflow-y-auto">
            <LandingPage onGoToStudio={() => setView('studio')} />
          </div>
        ) : (
          <div className="h-full w-full">
            {activeTab === 'whatsapp' ? (
              <WhatsAppGenerator />
            ) : (
              <TwitterGenerator />
            )}
          </div>
        )}
      </main>

      {/* PRICING & UPGRADE MODAL */}
      <PricingModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  const GOOGLE_CLIENT_ID = "784742931833-ugfbgnrjgi9cso4cp4rehaf6m8aost09.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

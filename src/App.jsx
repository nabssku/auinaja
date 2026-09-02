import React, { useState } from 'react';
import WhatsAppGenerator from './components/WhatsAppGenerator';
import TwitterGenerator from './components/TwitterGenerator';
import { MessageSquare, Twitter, Sparkles, ExternalLink, Github } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('whatsapp'); // 'whatsapp' | 'twitter'

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0b0e14] text-neutral-100 font-sans overflow-hidden select-none">
      
      {/* GLOBAL TOP NAVIGATION BAR */}
      <header className="h-14 border-b border-neutral-800 bg-[#10141d] px-4 flex items-center justify-between shrink-0 z-30">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-neutral-950 font-black text-base shadow-lg shadow-emerald-500/20">
            A
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white">AUinAja</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-semibold uppercase">Studio</span>
            </div>
            <p className="text-[10px] text-neutral-400 leading-none">AU Fake Chat & Media Simulator</p>
          </div>
        </div>

        {/* Tab Switcher (WhatsApp vs Twitter) */}
        <div className="flex items-center bg-neutral-900/90 p-1 rounded-xl border border-neutral-800 shadow-inner">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20 scale-[1.02]'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('twitter')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'twitter'
                ? 'bg-[#1d9bf0] text-white shadow-md shadow-[#1d9bf0]/20 scale-[1.02]'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <Twitter className="w-3.5 h-3.5 fill-current" />
            <span>X (Twitter) Post</span>
          </button>
        </div>

        {/* External Links */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/nabssku/auinaja"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition px-2.5 py-1.5 rounded-lg bg-neutral-800/40 border border-neutral-800"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </header>

      {/* ACTIVE GENERATOR VIEW */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'whatsapp' ? (
          <WhatsAppGenerator />
        ) : (
          <TwitterGenerator />
        )}
      </main>

    </div>
  );
}

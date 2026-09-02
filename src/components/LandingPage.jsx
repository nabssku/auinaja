import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, Twitter, Download, Sparkles, Check, 
  Smartphone, ArrowRight, ShieldCheck, Zap, Heart, Star,
  Layers, Cloud, PlayCircle
} from 'lucide-react';

export default function LandingPage({ onGoToStudio }) {
  const { user, setUpgradeModalOpen } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0d14] text-neutral-100 font-sans selection:bg-emerald-500 selection:text-neutral-950">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 max-w-6xl mx-auto text-center overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Platform No. 1 Creator AU TikTok & X di Indonesia</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Bikin Cerita AU Viral <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Lebih Cepat, Rapi, & Bebas Ribet
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base md:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
          Simulator chat WhatsApp dan tweet X (Twitter) pixel-perfect untuk nulis cerita AU. Paste naskah dialogmu, langsung jadi gambar HD siap upload ke TikTok & Twitter.
        </p>

        {/* Primary CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={onGoToStudio}
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black rounded-2xl text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 transition transform hover:-translate-y-0.5 active:scale-95"
          >
            <span>Mulai Buat Cerita Gratis</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setUpgradeModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-bold rounded-2xl text-sm flex items-center justify-center gap-2 transition"
          >
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Lihat Paket Langganan</span>
          </button>
        </div>

        {/* Social Proof */}
        <div className="mt-8 flex items-center justify-center gap-4 text-xs text-neutral-400">
          <div className="flex -space-x-2">
            <img className="w-7 h-7 rounded-full border-2 border-[#0a0d14]" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80" alt="Avatar" />
            <img className="w-7 h-7 rounded-full border-2 border-[#0a0d14]" src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&auto=format&fit=crop&q=80" alt="Avatar" />
            <img className="w-7 h-7 rounded-full border-2 border-[#0a0d14]" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&auto=format&fit=crop&q=80" alt="Avatar" />
          </div>
          <span>Digunakan oleh ribuan kreator AU pemula hingga pro</span>
        </div>
      </section>

      {/* FEATURE HIGHLIGHT CARDS */}
      <section className="py-12 px-4 max-w-6xl mx-auto border-t border-neutral-800/80">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-black text-white">Semua Kebutuhan AU Creator Ada di Sini</h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">Didesain simpel, mudah digunakan anak muda hingga orang tua.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="bg-[#121620] border border-neutral-800/90 rounded-2xl p-6 hover:border-emerald-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white mb-2">WhatsApp Chat Realistis</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Tampilan iPhone Notch & Android lengkap: nama kontak, foto profil, centang biru, voice note, gambar, hingga status typing.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#121620] border border-neutral-800/90 rounded-2xl p-6 hover:border-[#1d9bf0]/40 transition">
            <div className="w-10 h-10 rounded-xl bg-[#1d9bf0]/10 text-[#1d9bf0] flex items-center justify-center mb-4">
              <Twitter className="w-5 h-5 fill-current" />
            </div>
            <h3 className="font-bold text-base text-white mb-2">X (Twitter) Post & Thread</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Bikin tweet pembuka AU dengan centang biru/gold, views counter, likes jutaan, dan balasan sub-tweet berantai.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#121620] border border-neutral-800/90 rounded-2xl p-6 hover:border-purple-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white mb-2">Bulk Dialog Script + AI</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Tinggal paste naskah dialog ceritamu, sistem langsung menyusunnya jadi chat bubble otomatis tanpa ngetik satu per satu.
            </p>
          </div>
        </div>
      </section>

      {/* PRICING PLANS SECTION */}
      <section className="py-16 px-4 max-w-6xl mx-auto border-t border-neutral-800/80">
        <div className="text-center max-w-lg mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Pilihan Paket Berlangganan
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Investasi Kecil untuk Cerita Viralmu</h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2">
            Hitungan export dihitung per judul cerita (1 cerita bisa berisi puluhan chat bubble panjang).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bronze */}
          <div className="bg-[#131722] rounded-3xl p-6 border border-amber-600/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-white">Bronze</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">Starter</span>
              </div>
              <div className="my-4">
                <span className="text-3xl font-black text-white">Rp 15.000</span>
                <span className="text-xs text-neutral-400"> / bulan</span>
              </div>
              <div className="space-y-3 my-6 text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Export 3x sehari</strong> (3 Cerita Panjang)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Tanpa Iklan (No Ads)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Akses AI Script Generator</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Download Gambar Resolusi Tinggi</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setUpgradeModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition"
            >
              Langganan Bronze
            </button>
          </div>

          {/* Gold */}
          <div className="bg-gradient-to-b from-[#1a2130] to-[#141824] rounded-3xl p-6 border-2 border-yellow-500/70 relative shadow-2xl flex flex-col justify-between">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-amber-500 text-neutral-950 font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-lg">
              Paling Populer ⭐
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-white">Gold</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300">Recommended</span>
              </div>
              <div className="my-4">
                <span className="text-3xl font-black text-white">Rp 25.000</span>
                <span className="text-xs text-neutral-400"> / bulan</span>
              </div>
              <div className="space-y-3 my-6 text-xs text-neutral-200">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Export 5x sehari</strong> (5 Cerita Panjang)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Tanpa Iklan (No Ads)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Akses Penuh AI Script Writer</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Download Ultra HD & Simpan Cloud</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setUpgradeModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-neutral-950 font-black text-xs transition shadow-lg"
            >
              Langganan Gold
            </button>
          </div>

          {/* Platinum */}
          <div className="bg-[#131722] rounded-3xl p-6 border border-emerald-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-white">Platinum</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Pro 👑</span>
              </div>
              <div className="my-4">
                <span className="text-3xl font-black text-white">Rp 45.000</span>
                <span className="text-xs text-neutral-400"> / bulan</span>
              </div>
              <div className="space-y-3 my-6 text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Export 10x sehari</strong> (10 Cerita Panjang)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Tanpa Iklan (No Ads)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Akses Prioritas Fitur Baru</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Batch Carousel Exporter TikTok</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setUpgradeModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition"
            >
              Langganan Platinum
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 border-t border-neutral-800/80 text-center text-xs text-neutral-500">
        <p>© 2026 AUinAja Studio • Dibuat khusus untuk komunitas Creator AU Indonesia</p>
      </footer>

    </div>
  );
}

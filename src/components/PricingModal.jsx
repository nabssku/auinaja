import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Check, Zap, Crown, Sparkles, X } from 'lucide-react';

export default function PricingModal({ isOpen, onClose }) {
  const { user, handleUpgrade, handleDemoLogin } = useAuth();

  if (!isOpen) return null;

  const tiers = [
    {
      id: 'bronze',
      name: 'Bronze',
      badge: 'Starter AU',
      price: 'Rp 15.000',
      period: '/ bulan',
      color: 'from-amber-600 to-amber-700',
      borderColor: 'border-amber-600/40',
      accentBg: 'bg-amber-500/10 text-amber-400',
      buttonBg: 'bg-amber-600 hover:bg-amber-500 text-white',
      features: [
        'Export 3x cerita per hari',
        '1 Cerita bisa berisi puluhan bubble chat',
        'Bebas Iklan (No Ads)',
        'Akses Penuh AI Script Writer',
        'Download PNG Resolusi Tinggi (3x)',
        'Cloud Save Cerita di Neon DB'
      ],
      popular: false
    },
    {
      id: 'gold',
      name: 'Gold',
      badge: 'Paling Populer ⭐',
      price: 'Rp 25.000',
      period: '/ bulan',
      color: 'from-yellow-500 to-amber-500',
      borderColor: 'border-yellow-500/60 ring-2 ring-yellow-500/30',
      accentBg: 'bg-yellow-500/20 text-yellow-300',
      buttonBg: 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-neutral-950 font-bold',
      features: [
        'Export 5x cerita per hari',
        'Bebas Iklan (No Ads)',
        'Akses Penuh AI Script Writer',
        'Download PNG Ultra HD (3x)',
        'Simulator WhatsApp & X Twitter',
        'Prioritas Render Cepat',
        'Cloud Save Cerita Tanpa Batas'
      ],
      popular: true
    },
    {
      id: 'platinum',
      name: 'Platinum',
      badge: 'Creator Pro 👑',
      price: 'Rp 45.000',
      period: '/ bulan',
      color: 'from-emerald-500 to-teal-600',
      borderColor: 'border-emerald-500/40',
      accentBg: 'bg-emerald-500/10 text-emerald-400',
      buttonBg: 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold',
      features: [
        'Export 10x cerita per hari',
        'Bebas Iklan (No Ads)',
        'Akses Penuh AI Script Writer',
        'Export Batch Slide Format TikTok',
        'Semua Format Preset Chat & Media',
        'Simpan & Kelola Semua Draft AU',
        'Akses Fitur Baru Lebih Dulu'
      ],
      popular: false
    }
  ];

  const onSelectPlan = async (planId) => {
    if (!user) {
      // Auto login as demo user then upgrade
      await handleDemoLogin(planId);
      onClose();
      return;
    }
    await handleUpgrade(planId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#12161f] border border-neutral-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 relative shadow-2xl my-8">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="text-center max-w-lg mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Paket Berlangganan AUinAja
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Pilih Paket Creator AU Kamu
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2">
            Hitungan export dihitung per cerita utuh (bukan per bubble chat). 1x export bisa memuat puluhan bubble chat panjang untuk TikTok & Twitter.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tiers.map((tier) => {
            const isCurrentPlan = user?.plan === tier.id;
            return (
              <div 
                key={tier.id}
                className={`bg-[#181d28] rounded-2xl p-5 border flex flex-col justify-between relative transition-all ${tier.borderColor} ${tier.popular ? 'bg-gradient-to-b from-[#1c2331] to-[#181d28]' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-amber-500 text-neutral-950 font-extrabold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                    {tier.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-white">{tier.name}</h3>
                    {!tier.popular && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${tier.accentBg}`}>
                        {tier.badge}
                      </span>
                    )}
                  </div>

                  <div className="my-4">
                    <span className="text-2xl sm:text-3xl font-black text-white">{tier.price}</span>
                    <span className="text-xs text-neutral-400">{tier.period}</span>
                  </div>

                  <div className="space-y-2.5 my-6 text-xs text-neutral-300">
                    {tier.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onSelectPlan(tier.id)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition shadow-md ${
                    isCurrentPlan 
                      ? 'bg-neutral-800 text-neutral-400 border border-neutral-700 cursor-default' 
                      : tier.buttonBg
                  }`}
                >
                  {isCurrentPlan ? 'Paket Aktif Saat Ini' : `Pilih Paket ${tier.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Note */}
        <div className="mt-6 text-center text-neutral-500 text-[11px]">
          Pembayaran aman via QRIS, GoPay, OVO, Dana & Virtual Account. Langganan dapat dibatalkan kapan saja.
        </div>

      </div>
    </div>
  );
}

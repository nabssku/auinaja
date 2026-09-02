import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Check, Zap, Crown, Sparkles, X, QrCode, ExternalLink, Loader2 } from 'lucide-react';

export default function PricingModal({ isOpen, onClose }) {
  const { user, handleDemoLogin, refreshUserQuota } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  if (!isOpen) return null;

  const tiers = [
    {
      id: 'bronze',
      name: 'Bronze',
      badge: 'Starter AU',
      price: 'Rp 15.000',
      period: '/ bulan',
      amount: 15000,
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
      amount: 25000,
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
      amount: 45000,
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

  const handleCreatePayment = async (planId) => {
    let currentUserId = user?.id;
    
    // Auto login demo if not logged in
    if (!currentUserId) {
      await handleDemoLogin('free');
      currentUserId = 'demo_user_101';
    }

    setLoadingPlan(planId);
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, plan: planId })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPaymentData({
          planId,
          referenceId: data.referenceId,
          payUrl: data.payUrl,
          amount: data.amount
        });
      } else {
        alert(data.error || 'Gagal membuat tagihan pembayaran.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('Terjadi kesalahan koneksi pembayaran.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleSimulatePayment = async () => {
    if (!paymentData?.referenceId) return;
    setCheckingStatus(true);
    try {
      // Simulate test payment on BorderPay
      const simRes = await fetch(`https://borderpay.id/api/v1/payments/${paymentData.referenceId}/simulate`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer bp_test_bsF3Wj5HQNGzZm0fHbS5Vcm_05GfupXV' }
      });
      
      if (simRes.ok) {
        // Upgrade user plan in our backend
        await fetch('/api/user/upgrade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user?.id || 'demo_user_101', plan: paymentData.planId })
        });

        await refreshUserQuota();
        alert(`Pembayaran Berhasil! Akun kamu sekarang aktif di paket ${paymentData.planId.toUpperCase()}.`);
        setPaymentData(null);
        onClose();
      }
    } catch (err) {
      console.error('Simulate error:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#12161f] border border-neutral-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 relative shadow-2xl my-8">
        
        {/* Close button */}
        <button 
          onClick={() => {
            setPaymentData(null);
            onClose();
          }}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* PAYMENT MODAL OVERLAY IF ACTIVE */}
        {paymentData ? (
          <div className="text-center max-w-md mx-auto py-4 space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
              <QrCode className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 uppercase">
                BorderPay Gateway (QRIS / E-Wallet / VA)
              </span>
              <h2 className="text-2xl font-black text-white mt-1.5">Selesaikan Pembayaran</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Paket <strong>{paymentData.planId.toUpperCase()}</strong> • Rp {paymentData.amount.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-3 text-left">
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Order Reference:</span>
                <span className="font-mono font-bold text-white text-[11px]">{paymentData.referenceId}</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Metode:</span>
                <span className="text-emerald-400 font-semibold">QRIS & Semua E-Wallet</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Total Bayar:</span>
                <span className="font-bold text-white">Rp {paymentData.amount.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <a
                href={paymentData.payUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition"
              >
                <span>Buka Halaman Pembayaran BorderPay</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={handleSimulatePayment}
                disabled={checkingStatus}
                className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
              >
                {checkingStatus ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : <Sparkles className="w-4 h-4 text-yellow-400" />}
                <span>Simulasikan Pembayaran Berhasil (Mode Test)</span>
              </button>

              <button
                onClick={() => setPaymentData(null)}
                className="text-[11px] text-neutral-500 hover:text-neutral-300 pt-1"
              >
                Kembali ke daftar paket
              </button>
            </div>
          </div>
        ) : (
          /* REGULAR PRICING TIERS */
          <>
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
                Didukung pembayaran instan QRIS, Virtual Account, & E-Wallet via <strong>BorderPay</strong>.
              </p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {tiers.map((tier) => {
                const isCurrentPlan = user?.plan === tier.id;
                const isLoading = loadingPlan === tier.id;

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
                      onClick={() => handleCreatePayment(tier.id)}
                      disabled={isLoading || isCurrentPlan}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-1.5 ${
                        isCurrentPlan 
                          ? 'bg-neutral-800 text-neutral-400 border border-neutral-700 cursor-default' 
                          : tier.buttonBg
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Menyiapkan QRIS...</span>
                        </>
                      ) : isCurrentPlan ? (
                        'Paket Aktif Saat Ini'
                      ) : (
                        `Langganan ${tier.name}`
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Note */}
            <div className="mt-6 text-center text-neutral-500 text-[11px] flex items-center justify-center gap-2">
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pembayaran instan QRIS (GoPay, OVO, Dana, ShopeePay, BCA/Mandiri Mobile) via BorderPay</span>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

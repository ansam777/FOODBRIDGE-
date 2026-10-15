'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { useAppStore } from '@/lib/store';

export default function ClaimsPage() {
  const { claims, verifyHandover } = useAppStore();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [otpInput, setOtpInput] = useState<{ [claimId: string]: string }>({});
  const [verificationFeedback, setVerificationFeedback] = useState<{ [claimId: string]: { success: boolean; message: string } }>({});

  const activeClaims = claims.filter((c) => c.status !== 'completed' && c.status !== 'cancelled');
  const completedClaims = claims.filter((c) => c.status === 'completed');

  const handleVerify = (claimId: string, customOtp?: string) => {
    const claim = claims.find((c) => c.id === claimId);
    if (!claim) return;
    const otpToUse = customOtp || otpInput[claimId] || '';
    const res = verifyHandover(claimId, otpToUse);
    setVerificationFeedback((prev) => ({ ...prev, [claimId]: res }));
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Navbar />

      <main className="w-full pt-20">
        
        {/* Header */}
        <section className="w-full bg-surface-container-low px-4 sm:px-6 lg:px-8 py-8 sm:py-12 border-b border-outline-variant/20">
          <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Verified Handover Protocol (PRD §5.4)
              </div>
              <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">
                My Food Claims & Pickup Passes
              </h1>
              <p className="text-sm text-on-surface-variant mt-1">
                Present your 6-digit OTP code or QR badge at the food donor desk upon collection.
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center gap-2 p-1 rounded-full bg-surface-container-lowest border border-outline-variant/30 shadow-xs">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'active'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Active Passes ({activeClaims.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'completed'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Completed ({completedClaims.length})
              </button>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          
          {activeTab === 'active' ? (
            activeClaims.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {activeClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="p-6 rounded-3xl bg-surface-container-lowest shadow-md border border-outline-variant/30 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar */}
                      <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-secondary animate-pulse" />
                          <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                            Active Claim Pass
                          </span>
                        </div>
                        <span className="text-xs text-on-surface-variant">
                          Claimed {new Date(claim.claimedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Listing Details */}
                      <div className="mt-4">
                        <h2 className="text-lg font-bold text-on-surface">{claim.listingTitle}</h2>
                        <p className="text-xs text-on-surface-variant mt-1">
                          Donor: <strong className="text-on-surface">{claim.donorName}</strong> (~{claim.quantityServings} servings)
                        </p>
                        <div className="mt-2 text-xs flex items-center gap-1.5 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                          <span>{claim.pickupAddress}</span>
                        </div>
                      </div>

                      {/* Prominent OTP Code Box */}
                      <div className="my-6 p-5 rounded-2xl bg-surface-container-low border-2 border-dashed border-primary/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-center sm:text-left">
                          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                            Single-Use Handover OTP
                          </span>
                          <div className="font-mono text-3xl font-black text-primary tracking-widest mt-1">
                            {claim.handoverOtp}
                          </div>
                          <span className="text-[11px] text-secondary font-semibold">
                            Show to kitchen attendant
                          </span>
                        </div>

                        {/* Simulated QR Code Graphic */}
                        <div className="w-24 h-24 rounded-xl bg-white p-2 border border-outline-variant/40 flex flex-col items-center justify-center shrink-0 shadow-xs">
                          <div className="w-full h-full bg-gradient-to-tr from-slate-900 to-slate-700 rounded p-1 flex items-center justify-center text-white text-[9px] font-mono text-center leading-tight">
                            QR CODE<br />
                            #{claim.handoverOtp}
                          </div>
                        </div>
                      </div>

                      {/* Feedback message if any */}
                      {verificationFeedback[claim.id] && (
                        <div
                          className={`mb-4 p-3 rounded-xl text-xs font-bold ${
                            verificationFeedback[claim.id].success
                              ? 'bg-secondary-container text-on-secondary-container'
                              : 'bg-error-container text-on-error-container'
                          }`}
                        >
                          {verificationFeedback[claim.id].message}
                        </div>
                      )}
                    </div>

                    {/* Donor Handover Simulator Section */}
                    <div className="pt-4 border-t border-surface-container">
                      <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                        Donor Handover Verification Simulator (PRD Testing)
                      </span>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          placeholder="Enter 6-digit OTP..."
                          value={otpInput[claim.id] || ''}
                          onChange={(e) => setOtpInput({ ...otpInput, [claim.id]: e.target.value })}
                          className="flex-1 h-10 px-3 rounded-full bg-surface-container-low text-xs border border-outline-variant/30 text-on-surface font-mono"
                        />
                        <button
                          onClick={() => handleVerify(claim.id)}
                          className="px-4 py-2 rounded-full bg-inverse-surface text-inverse-on-surface text-xs font-bold hover:bg-slate-800 transition-colors"
                        >
                          Verify OTP
                        </button>
                        <button
                          onClick={() => handleVerify(claim.id, claim.handoverOtp)}
                          className="px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold hover:bg-secondary transition-colors hover:text-white"
                          title="Simulate donor scanning QR or accepting code"
                        >
                          Auto-Verify (Test)
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 p-8 rounded-3xl bg-surface-container-lowest border border-outline-variant/20 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-surface-container text-on-surface-variant mx-auto flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[32px]">no_meals</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface">No Active Claims</h3>
                <p className="text-xs text-on-surface-variant mt-1 mb-6">
                  You haven&apos;t claimed any surplus meals yet. Explore nearby food offerings to claim your first rescue bag.
                </p>
                <Link
                  href="/feed"
                  className="px-6 py-2.5 rounded-full bg-primary text-on-primary text-xs font-bold shadow-md hover:bg-on-primary-fixed-variant"
                >
                  Explore Food Feed
                </Link>
              </div>
            )
          ) : (
            /* Completed Handovers History */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-surface-container">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-secondary bg-secondary-container/60 px-2.5 py-0.5 rounded-full">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Verified & Handed Over
                      </span>
                      <span className="text-[10px] text-on-surface-variant">
                        {claim.completedAt ? new Date(claim.completedAt).toLocaleDateString() : 'Completed'}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-on-surface">{claim.listingTitle}</h3>
                    <p className="text-xs text-on-surface-variant mt-1">From: {claim.donorName}</p>
                    <div className="mt-3 text-xs text-secondary font-semibold">
                      🎉 {claim.quantityServings} servings rescued from waste!
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-[11px] text-on-surface-variant">
                    <span>Code: #{claim.handoverOtp}</span>
                    <span className="text-secondary font-bold">100% Tax Documented</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { ListingItem, CATEGORY_LABELS } from '@/lib/mock-data';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';

interface FoodCardProps {
  listing: ListingItem;
  onClaimSuccess?: () => void;
}

export function FoodCard({ listing, onClaimSuccess }: FoodCardProps) {
  const { claimListing } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [needsDelivery, setNeedsDelivery] = useState(false);
  const [safetyAgreed, setSafetyAgreed] = useState(false);
  const [claimedOtp, setClaimedOtp] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);

  useEffect(() => {
    setCurrentTime(Date.now());
  }, []);

  // Expiry calculation
  const expiresAt = new Date(listing.expiresAt);
  const nowMs = currentTime || 1760500000000;
  const diffHours = Math.max(0, Math.round((expiresAt.getTime() - nowMs) / (1000 * 60 * 60)));
  const isExpiringSoon = diffHours <= 3;

  const handleClaim = () => {
    if (!safetyAgreed) return;
    try {
      const claim = claimListing(listing.id, needsDelivery);
      setClaimedOtp(claim.handoverOtp);
      if (onClaimSuccess) onClaimSuccess();
    } catch {
      alert('Error claiming listing');
    }
  };

  const categoryMeta = CATEGORY_LABELS[listing.category] || { label: listing.category, icon: '🍱' };

  return (
    <>
      <div className="group flex flex-col overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
        
        {/* Photo & Top Badges */}
        <div className="relative h-48 w-full overflow-hidden bg-surface-container">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={listing.photoUrls[0]}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Category Pill */}
          <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-surface-container-lowest/95 backdrop-blur-xs px-2.5 py-1 text-xs font-semibold text-on-surface shadow-xs">
            <span>{categoryMeta.icon}</span>
            <span>{categoryMeta.label}</span>
          </span>

          {/* Status Badge */}
          <span
            className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider shadow-xs ${
              listing.status === 'available'
                ? 'bg-secondary text-on-secondary'
                : listing.status === 'claimed'
                ? 'bg-tertiary text-on-tertiary'
                : 'bg-outline text-white'
            }`}
          >
            {listing.status}
          </span>

          {/* Distance Badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-lg bg-black/60 backdrop-blur-xs px-2 py-0.5 text-xs font-medium text-white">
            <span className="material-symbols-outlined text-[14px] text-primary-fixed">pin_drop</span>
            <span>{listing.distanceKm} km away</span>
          </div>

          {/* Servings Pill */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg bg-primary-container backdrop-blur-xs px-2 py-0.5 text-xs font-bold text-on-primary">
            <span className="material-symbols-outlined text-[14px]">soup_kitchen</span>
            <span>~{listing.quantityServings} servings</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-1 flex items-center gap-1 text-xs font-medium text-on-surface-variant">
            <span>Donor:</span>
            <span className="font-semibold text-on-surface truncate">{listing.donorName}</span>
            <span className="material-symbols-outlined text-[14px] text-secondary">verified</span>
          </div>

          <h3 className="text-base font-bold text-on-surface line-clamp-2 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>

          <p className="mt-1.5 text-xs text-on-surface-variant line-clamp-2">
            {listing.description}
          </p>

          {/* Dietary Tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {listing.dietaryTags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-secondary-container/50 px-2 py-0.5 text-[10px] font-semibold text-on-secondary-container border border-secondary-container"
              >
                {tag}
              </span>
            ))}
            {listing.isDeliveryAvailable && (
              <span className="flex items-center gap-1 rounded-md bg-surface-container px-2 py-0.5 text-[10px] font-semibold text-on-surface-variant border border-outline-variant/30">
                <span className="material-symbols-outlined text-[12px]">directions_bike</span>
                Courier Avail.
              </span>
            )}
          </div>

          {/* Footer Info & CTA */}
          <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between">
            <div className={`flex items-center gap-1 text-xs font-semibold ${isExpiringSoon ? 'text-tertiary' : 'text-on-surface-variant'}`}>
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span>{diffHours > 0 ? `Expires in ${diffHours}h` : 'Expiring now'}</span>
            </div>

            {listing.status === 'available' ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1 rounded-full bg-primary text-on-primary px-3.5 py-1.5 text-xs font-semibold shadow-xs hover:bg-on-primary-fixed-variant transition-all"
              >
                <span>Claim</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            ) : (
              <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-medium text-on-surface-variant">
                Claimed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Claim & Food Safety Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl bg-surface-container-lowest p-6 shadow-2xl border border-outline-variant/30">
            
            {/* Close Button */}
            <button
              onClick={() => {
                setIsModalOpen(false);
                setClaimedOtp(null);
              }}
              className="absolute top-4 right-4 rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            {!claimedOtp ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
                    <span className="material-symbols-outlined text-[24px]">soup_kitchen</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      Food Claim Protocol
                    </span>
                    <h3 className="text-lg font-bold text-on-surface">
                      Claim Surplus Food
                    </h3>
                  </div>
                </div>

                <div className="rounded-2xl bg-surface-container-low p-4 mb-4 border border-outline-variant/20">
                  <p className="font-semibold text-sm text-on-surface">
                    {listing.title}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Provided by: <span className="font-medium text-on-surface">{listing.donorName}</span> (~{listing.quantityServings} servings)
                  </p>
                  <div className="mt-2 text-xs flex items-center gap-1.5 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                    <span>Pickup Location: {listing.pickupAddress}</span>
                  </div>
                </div>

                {/* Volunteer Delivery Option */}
                {listing.isDeliveryAvailable && (
                  <div className="mb-4 rounded-2xl border border-secondary-container bg-secondary-container/20 p-3">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={needsDelivery}
                        onChange={(e) => setNeedsDelivery(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded text-secondary accent-secondary"
                      />
                      <div>
                        <p className="text-xs font-semibold text-on-surface">
                          Request Volunteer Courier Assistance
                        </p>
                        <p className="text-[11px] text-on-surface-variant">
                          If you cannot travel to the donor, an available community volunteer will transport this food.
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {/* Food Safety & Legal Disclaimer */}
                <div className="mb-5 rounded-2xl border border-tertiary-fixed bg-tertiary-fixed/30 p-3.5">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[18px] shrink-0 mt-0.5">warning</span>
                    <div className="text-[11px] leading-relaxed text-on-surface">
                      <strong>Food Safety Acknowledgement (PRD §7.7):</strong> Donors confirm food is wholesome; recipients inspect food upon pickup. Verify proper temperature upon handover.
                    </div>
                  </div>

                  <label className="mt-3 flex items-center gap-2 cursor-pointer border-t border-outline-variant/30 pt-2">
                    <input
                      type="checkbox"
                      checked={safetyAgreed}
                      onChange={(e) => setSafetyAgreed(e.target.checked)}
                      className="h-4 w-4 rounded text-primary accent-primary"
                    />
                    <span className="text-xs font-semibold text-on-surface">
                      I agree to the Food Safety Guidelines and Terms
                    </span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-full px-4 py-2 text-xs font-medium text-on-surface-variant hover:bg-surface-container"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!safetyAgreed}
                    onClick={handleClaim}
                    className="flex items-center gap-1.5 rounded-full bg-primary text-on-primary px-5 py-2 text-xs font-bold shadow-md hover:bg-on-primary-fixed-variant disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Confirm & Generate OTP</span>
                  </button>
                </div>
              </>
            ) : (
              /* Success / OTP Display View */
              <div className="text-center py-2">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container shadow-sm">
                  <span className="material-symbols-outlined text-[32px]">check_circle</span>
                </div>
                <h3 className="text-xl font-bold text-on-surface">
                  Food Claim Confirmed!
                </h3>
                <p className="mt-1 text-xs text-on-surface-variant">
                  Present this OTP code to the donor upon collection.
                </p>

                {/* OTP Box */}
                <div className="my-5 rounded-2xl border-2 border-dashed border-primary bg-primary-fixed/30 p-4">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider">
                    YOUR 6-DIGIT HANDOVER OTP
                  </p>
                  <p className="mt-1 font-mono text-3xl font-black tracking-widest text-primary">
                    {claimedOtp}
                  </p>
                  <p className="mt-1 text-[11px] text-on-surface-variant">
                    Secure Single-Use Handover Token
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    href="/claims"
                    className="flex-1 rounded-full bg-primary text-on-primary py-2.5 text-xs font-bold shadow-sm hover:bg-on-primary-fixed-variant text-center"
                  >
                    View in My Claims
                  </Link>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setClaimedOtp(null);
                    }}
                    className="rounded-full border border-outline-variant/40 px-4 py-2.5 text-xs font-medium text-on-surface hover:bg-surface-container"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}

'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { useAppStore } from '@/lib/store';

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { listings, claimListing } = useAppStore();

  const [quantity, setQuantity] = useState(1);
  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery'>('pickup');
  const [isSubsidized, setIsSubsidized] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [claimedOtp, setClaimedOtp] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);

  useEffect(() => {
    setCurrentTime(Date.now());
  }, []);

  // Find item by ID or default to the first one
  const item = listings.find((l) => l.id === id) || listings[0];

  const nowMs = currentTime || 1760500000000;
  const hoursLeft = Math.max(1, Math.round((new Date(item.expiresAt).getTime() - nowMs) / (1000 * 60 * 60)));

  const samplePhotos = [
    item.photoUrls[0],
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800&auto=format&fit=crop&q=80',
  ];

  const handleReserve = () => {
    try {
      const claim = claimListing(item.id, fulfillment === 'delivery');
      setClaimedOtp(claim.handoverOtp);
    } catch {
      alert('Unable to claim this listing at this moment.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Navbar />

      <main className="w-full pt-20">
        <div className="relative w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Breadcrumb Hierarchy */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-on-surface-variant text-xs mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <Link href="/feed" className="hover:text-primary transition-colors">Explore Food</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface font-semibold truncate max-w-[280px]">{item.title}</span>
          </nav>

          {/* Main 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column (7 of 12 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Image Gallery & Badges */}
              <div className="flex flex-col gap-3">
                <div className="relative w-full h-[360px] sm:h-[420px] rounded-3xl overflow-hidden shadow-md bg-surface-container">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={samplePhotos[activePhotoIdx]}
                    alt={item.title}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                  
                  {/* Inset Dynamic Badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-error-container text-on-error-container text-xs font-bold shadow-sm backdrop-blur-md">
                      <span className="w-2 h-2 rounded-full bg-error animate-ping" />
                      <span className="material-symbols-outlined text-[15px]">timer</span>
                      Pickup closes in {hoursLeft}h
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold shadow-sm">
                      <span className="material-symbols-outlined text-[16px]">eco</span>
                      1.8 kg CO₂ Saved
                    </span>
                  </div>

                  <div className="absolute bottom-4 right-4 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 text-on-surface text-xs font-bold">
                    <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                    <span>{item.quantityServings} servings available</span>
                  </div>
                </div>

                {/* Thumbnail Strip */}
                <div className="grid grid-cols-4 gap-2">
                  {samplePhotos.map((photoUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`relative h-20 rounded-2xl overflow-hidden transition-all border-2 ${
                        activePhotoIdx === idx
                          ? 'border-primary ring-2 ring-primary/20 opacity-100'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photoUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Donor Info Card */}
              <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm flex flex-col gap-4 border border-outline-variant/20">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1 text-xs">
                      <span className="font-bold uppercase tracking-wider text-primary">Surplus Rescue Batch</span>
                      <span className="text-outline">•</span>
                      <span className="text-on-surface-variant font-medium">Batch #{item.id}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-on-surface">{item.title}</h1>
                    <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: item.title, url: window.location.href });
                      } else {
                        alert('Link copied to clipboard!');
                      }
                    }}
                    className="p-2.5 rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container hover:text-primary transition-colors shrink-0"
                    title="Share listing"
                  >
                    <span className="material-symbols-outlined text-[20px]">share</span>
                  </button>
                </div>

                {/* Donor Bar */}
                <div className="bg-surface-container-low/70 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 border border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-fixed flex items-center justify-center font-bold text-primary text-lg shrink-0">
                      {item.donorName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-on-surface">{item.donorName}</span>
                        <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5">
                        <span className="text-tertiary font-bold flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[16px] text-tertiary">star</span>
                          4.9
                        </span>
                        <span>•</span>
                        <span className="text-secondary font-semibold">182 rescues completed</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest text-on-surface text-xs font-semibold shadow-xs">
                    <span className="material-symbols-outlined text-primary text-[16px]">near_me</span>
                    <span>{item.distanceKm} mi away</span>
                  </div>
                </div>

                {/* Pickup Instructions */}
                <div className="p-4 rounded-2xl bg-surface-container-low text-xs border border-outline-variant/20">
                  <div className="flex items-center gap-1.5 font-bold text-on-surface mb-1">
                    <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                    <span>Pickup Address & Counter:</span>
                  </div>
                  <p className="text-on-surface font-semibold">{item.pickupAddress}</p>
                  <p className="text-on-surface-variant mt-0.5">{item.pickupInstructions || 'Proceed to main front desk.'}</p>
                </div>

              </div>

            </div>

            {/* Right Column (5 of 12 cols, Sticky Reservation Panel) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-4">
              
              <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-xl flex flex-col gap-5 border border-outline-variant/20">
                
                {/* Pricing Header */}
                <div className="flex items-start justify-between pb-3 border-b border-surface-container">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
                      Community Rescue Price
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-black text-primary">
                        {isSubsidized ? '$0.00' : '$0.00 Free'}
                      </span>
                      <span className="text-sm line-through text-outline">$18.00</span>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-secondary text-on-secondary text-xs font-bold shadow-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">savings</span>
                    100% OFF
                  </div>
                </div>

                {/* Quantity Stepper */}
                <div className="p-4 rounded-2xl bg-surface-container-low flex items-center justify-between border border-outline-variant/20">
                  <div>
                    <span className="text-xs font-bold text-on-surface block">Servings to Claim</span>
                    <span className="text-[11px] text-on-surface-variant">Max {item.quantityServings} portions available</span>
                  </div>
                  <div className="flex items-center gap-2 bg-surface-container-lowest rounded-full p-1 shadow-xs border border-outline-variant/20">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container font-bold disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-black text-sm text-on-surface">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(item.quantityServings, quantity + 1))}
                      disabled={quantity >= item.quantityServings}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container font-bold disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Fulfillment Method Selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Fulfillment Method
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    <label
                      onClick={() => setFulfillment('pickup')}
                      className={`cursor-pointer flex items-center justify-between p-3.5 rounded-2xl transition-all border ${
                        fulfillment === 'pickup'
                          ? 'bg-primary-fixed/20 border-primary ring-2 ring-primary/20'
                          : 'bg-surface-container-low border-outline-variant/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="fulfillment"
                          checked={fulfillment === 'pickup'}
                          onChange={() => setFulfillment('pickup')}
                          className="w-4 h-4 text-primary accent-primary"
                        />
                        <div>
                          <span className="text-xs font-bold text-on-surface block">Self Pickup</span>
                          <span className="text-[11px] text-on-surface-variant">Walk-in at donor counter</span>
                        </div>
                      </div>
                      <span className="text-xs text-secondary font-bold">Free</span>
                    </label>

                    <label
                      onClick={() => setFulfillment('delivery')}
                      className={`cursor-pointer flex items-center justify-between p-3.5 rounded-2xl transition-all border ${
                        fulfillment === 'delivery'
                          ? 'bg-primary-fixed/20 border-primary ring-2 ring-primary/20'
                          : 'bg-surface-container-low border-outline-variant/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="fulfillment"
                          checked={fulfillment === 'delivery'}
                          onChange={() => setFulfillment('delivery')}
                          className="w-4 h-4 text-primary accent-primary"
                        />
                        <div>
                          <span className="text-xs font-bold text-on-surface block">Volunteer Delivery</span>
                          <span className="text-[11px] text-on-surface-variant">Dispatched courier for mobility aid</span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-secondary text-[20px]">directions_bike</span>
                    </label>
                  </div>
                </div>

                {/* Community Care Subsidy Checkbox */}
                <div className="p-4 rounded-2xl bg-surface-container-low flex items-start gap-3 border border-outline-variant/20">
                  <input
                    type="checkbox"
                    id="subsidy"
                    checked={isSubsidized}
                    onChange={(e) => setIsSubsidized(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-primary accent-primary cursor-pointer shrink-0"
                  />
                  <label htmlFor="subsidy" className="cursor-pointer text-xs select-none">
                    <span className="font-bold text-on-surface block">
                      Community Mutual Aid Guarantee
                    </span>
                    <span className="text-[11px] text-on-surface-variant mt-0.5 block">
                      100% confidential and free for neighbors in need. Supported by our civic network.
                    </span>
                  </label>
                </div>

                {/* Primary Reservation CTA Button */}
                <button
                  onClick={handleReserve}
                  className="w-full py-4 px-4 rounded-full bg-primary text-on-primary hover:bg-on-primary-fixed-variant font-bold text-sm shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                  <span>Reserve & Generate 6-Digit OTP</span>
                </button>

                <div className="text-center text-[11px] text-on-surface-variant">
                  Instant confirmation • Single-use secure handover token
                </div>

                {/* Trust Points */}
                <div className="pt-2 border-t border-surface-container space-y-1.5 text-xs text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[16px]">verified</span>
                    <span><strong>Contactless Handover:</strong> Instant OTP & QR verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[16px]">policy</span>
                    <span><strong>Food Safety Act:</strong> Protected under Good Samaritan standards</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

      </main>

      {/* Confirmation Modal Sheet with OTP */}
      {claimedOtp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface-container-lowest rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center border border-outline-variant/30">
            <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container mx-auto flex items-center justify-center mb-3 shadow-sm">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>
            <h3 className="text-2xl font-bold text-on-surface">Reservation Confirmed!</h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Your {quantity} portion(s) of <strong>{item.title}</strong> are held at {item.donorName}.
            </p>

            <div className="my-6 p-5 rounded-2xl bg-surface-container-low border-2 border-dashed border-primary/40 flex flex-col items-center w-full">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Pickup OTP Code
              </span>
              <span className="font-mono text-4xl font-black text-primary tracking-widest my-1">
                {claimedOtp}
              </span>
              <span className="text-xs text-secondary font-bold">
                Show to kitchen attendant upon collection
              </span>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <Link
                href="/claims"
                className="w-full py-3 rounded-full bg-primary text-on-primary font-bold text-xs shadow-md hover:bg-on-primary-fixed-variant transition-colors"
              >
                View in My Claims & Digital Passes
              </Link>
              <button
                onClick={() => setClaimedOtp(null)}
                className="w-full py-2.5 rounded-full border border-outline-variant/30 text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

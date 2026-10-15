'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { useAppStore } from '@/lib/store';
import { ListingItem } from '@/lib/mock-data';

export default function ExploreFeedPage() {
  const { listings, claimListing } = useAppStore();
  const [viewMode, setViewMode] = useState<'split' | 'grid' | 'map'>('split');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('urgent');
  const [selectedListing, setSelectedListing] = useState<ListingItem | null>(null);
  const [claimSuccessOtp, setClaimSuccessOtp] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);

  useEffect(() => {
    setCurrentTime(Date.now());
  }, []);

  // Filter listings
  const filtered = listings.filter((item) => {
    if (activeFilter === 'urgent') {
      const nowMs = currentTime || 1760500000000;
      const hours = (new Date(item.expiresAt).getTime() - nowMs) / (1000 * 60 * 60);
      if (hours > 3) return false;
    }
    if (activeFilter === 'bakery' && item.category !== 'bakery') return false;
    if (activeFilter === 'hot' && item.category !== 'cooked_meal') return false;
    if (activeFilter === 'produce' && item.category !== 'raw_ingredients') return false;
    if (activeFilter === 'vegetarian' && !item.dietaryTags.includes('Vegetarian')) return false;
    if (activeFilter === 'free' && item.quantityServings < 30) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.donorName.toLowerCase().includes(q) ||
        item.pickupAddress.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sort listings
  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === 'urgent') {
      return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
    }
    if (sortOption === 'distance') {
      return a.distanceKm - b.distanceKm;
    }
    if (sortOption === 'portions') {
      return b.quantityServings - a.quantityServings;
    }
    return 0;
  });

  const handleClaim = (listing: ListingItem) => {
    try {
      const claim = claimListing(listing.id, true);
      setClaimSuccessOtp(claim.handoverOtp);
    } catch {
      alert('Unable to claim this listing at this moment.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Navbar />

      <main className="w-full pt-20">
        
        {/* Top Control Bar Container */}
        <section className="w-full bg-surface-container-lowest shadow-sm z-30 border-b border-outline-variant/20">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
            
            {/* Search, Location, and View Segment */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              
              {/* Search and Location */}
              <div className="flex flex-1 items-center flex-wrap sm:flex-nowrap gap-3">
                
                {/* Search Bar */}
                <div className="relative flex-1 min-w-[260px] h-12 bg-surface-container-low rounded-full flex items-center px-4 shadow-sm border border-outline-variant/30 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-surface-container-lowest">
                  <span className="material-symbols-outlined text-primary text-[20px] mr-2 shrink-0">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search near-expiry meals, bakeries, groceries, hot dishes..."
                    className="w-full bg-transparent border-none text-on-surface placeholder:text-on-surface-variant text-xs focus:outline-none"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-on-surface-variant p-1">
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  )}
                </div>

                {/* Location Picker */}
                <div className="relative shrink-0">
                  <button className="h-12 px-4 bg-surface-container-low hover:bg-surface-container rounded-full flex items-center gap-2 text-xs font-semibold text-on-surface transition-colors shadow-sm border border-outline-variant/30">
                    <span className="material-symbols-outlined text-secondary text-[20px]">near_me</span>
                    <span>Downtown Metro • 3 mi radius</span>
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px]">expand_more</span>
                  </button>
                </div>

              </div>

              {/* Sort & View Switcher */}
              <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
                
                {/* Sort Selector */}
                <div className="flex items-center gap-1.5 bg-surface-container-low px-4 h-12 rounded-full text-on-surface border border-outline-variant/30">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">sort</span>
                  <label className="text-xs text-on-surface-variant hidden xl:inline">Sort:</label>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="bg-transparent text-xs font-bold text-on-surface focus:outline-none cursor-pointer"
                  >
                    <option value="urgent">Expiring Soonest</option>
                    <option value="distance">Distance: Closest</option>
                    <option value="portions">Portions Remaining</option>
                  </select>
                </div>

                {/* View Switcher Tabs */}
                <div className="inline-flex p-1 bg-surface-container rounded-full text-on-surface-variant shadow-inner border border-outline-variant/20">
                  <button
                    onClick={() => setViewMode('split')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      viewMode === 'split'
                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">view_agenda</span>
                    <span className="hidden md:inline">Split View</span>
                  </button>

                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      viewMode === 'grid'
                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">grid_view</span>
                    <span className="hidden md:inline">Grid Only</span>
                  </button>

                  <button
                    onClick={() => setViewMode('map')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      viewMode === 'map'
                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">map</span>
                    <span className="hidden md:inline">Map Only</span>
                  </button>
                </div>

              </div>

            </div>

            {/* Quick Filter Pills Strip */}
            <div className="mt-3 pt-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-t border-surface-container">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto py-1">
                {[
                  { id: 'all', label: 'All Listings' },
                  { id: 'urgent', label: 'Expiring < 2 hrs', pulse: true },
                  { id: 'free', label: '100% Free Mutual Aid', icon: 'volunteer_activism', textSec: true },
                  { id: 'bakery', label: '🥖 Bakery' },
                  { id: 'hot', label: '🍲 Hot Meals' },
                  { id: 'produce', label: '🥦 Fresh Produce' },
                  { id: 'vegetarian', label: '🌱 Vegetarian' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setActiveFilter(chip.id)}
                    className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      activeFilter === chip.id
                        ? 'bg-primary-container text-on-primary border-primary-container shadow-sm'
                        : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border-outline-variant/30'
                    }`}
                  >
                    {chip.pulse && <span className="w-2 h-2 rounded-full bg-tertiary animate-ping" />}
                    {chip.icon && <span className="material-symbols-outlined text-[14px] text-secondary">{chip.icon}</span>}
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0 text-xs text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span>Showing <strong className="text-on-surface">{sorted.length} offers</strong> within 3 miles</span>
              </div>
            </div>

          </div>
        </section>

        {/* Main Feed & Map Layout Canvas */}
        <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start relative min-h-[720px]">
            
            {/* Feed Column */}
            {(viewMode === 'split' || viewMode === 'grid') && (
              <div
                className={`w-full flex flex-col gap-4 transition-all duration-300 ${
                  viewMode === 'split' ? 'lg:w-[58%]' : 'w-full'
                }`}
              >
                {/* Urgent Rescue Alert Banner */}
                <div className="bg-gradient-to-r from-tertiary-fixed/60 via-surface-container-lowest to-surface-container-lowest p-4 rounded-2xl shadow-sm flex items-center justify-between gap-3 border border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shrink-0 shadow-sm">
                      <span className="material-symbols-outlined text-[20px]">timer</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-on-surface">Flash Rescue Alert: Near-expiry items prioritized</p>
                      <p className="text-xs text-on-surface-variant">Prevent good food from reaching landfill. Reserve for immediate pickup.</p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-tertiary/15 text-tertiary text-[11px] font-bold uppercase tracking-wider shrink-0">
                    High Urgency
                  </span>
                </div>

                {/* Cards Grid */}
                <div
                  className={`grid gap-4 ${
                    viewMode === 'grid'
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                      : 'grid-cols-1 md:grid-cols-2'
                  }`}
                >
                  {sorted.map((item) => {
                    const nowMs = currentTime || 1760500000000;
                    const hoursLeft = Math.max(1, Math.round((new Date(item.expiresAt).getTime() - nowMs) / (1000 * 60 * 60)));
                    return (
                      <article
                        key={item.id}
                        onClick={() => setSelectedListing(item)}
                        className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all cursor-pointer border border-outline-variant/20"
                      >
                        <div className="relative h-44 w-full overflow-hidden bg-surface-container">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.photoUrls[0]}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container text-[11px] font-bold flex items-center gap-1 shadow-md">
                              <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container animate-ping" />
                              Expires in {hoursLeft}h
                            </span>
                          </div>
                          <div className="absolute top-2.5 right-2.5">
                            <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface text-[11px] font-semibold flex items-center gap-0.5 shadow-sm">
                              <span className="material-symbols-outlined text-primary text-[14px]">pin_drop</span>
                              {item.distanceKm} mi
                            </span>
                          </div>
                          <div className="absolute bottom-2 left-2.5">
                            <span className="px-2 py-0.5 rounded-md bg-inverse-surface/85 backdrop-blur-xs text-inverse-on-surface text-[10px] font-bold">
                              {item.quantityServings} portions left
                            </span>
                          </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-on-surface-variant text-[11px] mb-1">
                              <span className="flex items-center gap-1 font-semibold text-on-surface truncate">
                                <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
                                {item.donorName}
                              </span>
                              <span className="text-secondary font-bold shrink-0">100% Free</span>
                            </div>
                            <h3 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                              {item.title}
                            </h3>
                            <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">
                              {item.description}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between">
                            <div>
                              <div className="flex items-baseline gap-1">
                                <span className="text-base font-extrabold text-primary">$0.00</span>
                                <span className="text-xs text-on-surface-variant line-through">$16.50</span>
                              </div>
                              <span className="text-[10px] text-secondary font-semibold">Rescues 1.8kg CO₂</span>
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedListing(item);
                              }}
                              className="px-4 py-1.5 rounded-full bg-primary text-on-primary hover:bg-on-primary-fixed-variant transition-colors text-xs font-bold shadow-sm flex items-center gap-1"
                            >
                              <span>Details & Claim</span>
                              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sticky Interactive Map Column */}
            {(viewMode === 'split' || viewMode === 'map') && (
              <div
                className={`sticky top-24 rounded-3xl overflow-hidden shadow-lg border border-outline-variant/30 relative flex flex-col transition-all duration-300 bg-surface-container-high ${
                  viewMode === 'map' ? 'w-full h-[calc(100vh-140px)]' : 'w-full lg:w-[42%] h-[680px]'
                }`}
              >
                {/* Simulated Radar Map View */}
                <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-low flex items-center justify-center">
                  
                  {/* Grid Lines */}
                  <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
                    <pattern id="streetGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#D32F2F" strokeWidth="0.5" strokeOpacity="0.3" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#streetGrid)" />
                    {/* Concentric distance rings */}
                    <circle cx="50%" cy="50%" r="80" fill="none" stroke="#2E7D32" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                    <circle cx="50%" cy="50%" r="160" fill="none" stroke="#2E7D32" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
                    <circle cx="50%" cy="50%" r="240" fill="none" stroke="#2E7D32" strokeWidth="1" strokeDasharray="4 4" opacity="0.2" />
                  </svg>

                  {/* Center Radar Dot (User Location) */}
                  <div className="absolute z-10 flex flex-col items-center pointer-events-none">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center ring-4 ring-primary/20 shadow-lg">
                      <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                    </div>
                    <span className="mt-1 px-2 py-0.5 rounded-full bg-inverse-surface text-inverse-on-surface text-[10px] font-bold shadow-sm">
                      You (Downtown)
                    </span>
                  </div>

                  {/* Donor Pins on Radar */}
                  {sorted.map((item, idx) => {
                    const angles = [45, 120, 200, 290, 340, 160];
                    const angle = angles[idx % angles.length];
                    const radius = 70 + (idx * 28);
                    const rad = (angle * Math.PI) / 180;
                    const x = Math.cos(rad) * radius;
                    const y = Math.sin(rad) * radius;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedListing(item)}
                        style={{ transform: `translate(${x}px, ${y}px)` }}
                        className="absolute z-20 flex flex-col items-center group cursor-pointer transition-transform hover:scale-110"
                        title={item.title}
                      >
                        <div className="px-2 py-1 rounded-full bg-surface-container-lowest text-primary shadow-md border border-primary/30 flex items-center gap-1 text-[11px] font-bold group-hover:bg-primary-container group-hover:text-on-primary">
                          <span className="material-symbols-outlined text-[14px]">restaurant</span>
                          <span>{item.distanceKm} mi</span>
                        </div>
                      </button>
                    );
                  })}

                  {/* Map Overlay Badge */}
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-outline-variant/30 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                    <span>PostGIS Radius Scanner • 3.0 mi radius active</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </main>

      {/* Detail & Claim Modal (Matching listing_detail_bakery_rescue_bag) */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-surface-container-lowest p-6 shadow-2xl border border-outline-variant/30 text-on-surface">
            
            <button
              onClick={() => {
                setSelectedListing(null);
                setClaimSuccessOtp(null);
              }}
              className="absolute top-4 right-4 rounded-full p-2 text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            {!claimSuccessOtp ? (
              <div className="flex flex-col gap-5">
                <div className="relative h-60 w-full rounded-2xl overflow-hidden bg-surface-container">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedListing.photoUrls[0]}
                    alt={selectedListing.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container text-xs font-bold shadow-sm">
                      Urgent Rescue Window
                    </span>
                    <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold shadow-sm">
                      1.8 kg CO₂ Saved
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
                    <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
                    <span className="font-bold text-on-surface">{selectedListing.donorName}</span>
                    <span>• {selectedListing.distanceKm} mi away</span>
                  </div>
                  <h2 className="text-xl font-bold text-on-surface mt-1">{selectedListing.title}</h2>
                  <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                    {selectedListing.description}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                      Community Rescue Price
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl font-black text-primary">$0.00</span>
                      <span className="text-sm line-through text-on-surface-variant">$18.00</span>
                      <span className="text-xs font-bold text-secondary bg-secondary-container px-2 py-0.5 rounded">
                        100% FREE MUTUAL AID
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-on-surface-variant block">Available Quantity</span>
                    <span className="text-lg font-bold text-on-surface">{selectedListing.quantityServings} servings</span>
                  </div>
                </div>

                <div className="rounded-xl border border-secondary/30 bg-secondary-container/20 p-3 text-xs text-on-surface flex items-start gap-2">
                  <span className="material-symbols-outlined text-[20px] text-secondary shrink-0 mt-0.5">verified_user</span>
                  <div>
                    <strong>Food Safety Protocol:</strong> This surplus batch is prepared under sanitary standards. Upon pickup, show your 6-digit OTP code to the attendant for verification.
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setSelectedListing(null)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleClaim(selectedListing)}
                    className="px-6 py-2.5 rounded-full bg-primary text-on-primary text-xs font-bold shadow-md hover:bg-on-primary-fixed-variant transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>Claim & Generate Instant OTP</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Claim Confirmation Sheet with OTP */
              <div className="py-4 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-3 shadow-md">
                  <span className="material-symbols-outlined text-[36px]">check_circle</span>
                </div>
                <h3 className="text-2xl font-bold text-on-surface">Reservation Confirmed!</h3>
                <p className="text-xs text-on-surface-variant mt-1 max-w-md">
                  Your claim for <strong>{selectedListing.title}</strong> is reserved at {selectedListing.donorName}.
                </p>

                <div className="my-6 p-5 rounded-2xl bg-surface-container-low border-2 border-dashed border-primary/40 flex flex-col items-center w-full max-w-sm">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Your 6-Digit Handover OTP
                  </span>
                  <span className="font-mono text-4xl font-black text-primary tracking-widest my-1">
                    {claimSuccessOtp}
                  </span>
                  <span className="text-xs text-secondary font-bold">
                    Single-use verification token • Valid for pickup today
                  </span>
                </div>

                <div className="flex gap-3 w-full max-w-sm">
                  <Link
                    href="/claims"
                    className="flex-1 py-3 rounded-full bg-primary text-on-primary font-bold text-xs shadow-md hover:bg-on-primary-fixed-variant text-center"
                  >
                    View in My Claims
                  </Link>
                  <button
                    onClick={() => {
                      setSelectedListing(null);
                      setClaimSuccessOtp(null);
                    }}
                    className="px-5 py-3 rounded-full border border-outline-variant/40 text-on-surface font-semibold text-xs hover:bg-surface-container"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

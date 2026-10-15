'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { useAppStore } from '@/lib/store';

export default function Home() {
  const { listings, savedMealsCount, claimListing } = useAppStore();
  const [selectedRadius, setSelectedRadius] = useState('3');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<{ title: string; sub: string; otp: string } | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);

  useEffect(() => {
    setCurrentTime(Date.now());
  }, []);

  // Filter listings based on category and search query
  const filteredListings = listings.filter((item) => {
    if (selectedCategory === 'bakery' && item.category !== 'bakery') return false;
    if (selectedCategory === 'prepared' && item.category !== 'cooked_meal') return false;
    if (selectedCategory === 'produce' && item.category !== 'raw_ingredients') return false;
    if (selectedCategory === 'vegan' && !item.dietaryTags.includes('Vegan')) return false;
    if (selectedCategory === 'halal' && !item.dietaryTags.includes('Halal')) return false;
    if (selectedCategory === 'free' && item.quantityServings < 30) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        item.title.toLowerCase().includes(q) ||
        item.donorName.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleQuickReserve = (listingId: string, title: string, donorName: string) => {
    try {
      const claim = claimListing(listingId, true);
      setToastMessage({
        title: `Reserved: ${title.slice(0, 32)}...`,
        sub: `Pickup OTP: ${claim.handoverOtp} at ${donorName}`,
        otp: claim.handoverOtp,
      });
      setTimeout(() => {
        setToastMessage(null);
      }, 7000);
    } catch {
      alert('This listing is already claimed or unavailable.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Navbar />

      {/* Interactive Reservation Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-4 p-4 rounded-2xl bg-inverse-surface text-inverse-on-surface shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-5 border border-outline-variant/30 max-w-md">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-on-secondary shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[22px]">check</span>
          </div>
          <div className="flex flex-col pr-2 flex-1">
            <span className="font-bold text-sm">{toastMessage.title}</span>
            <span className="text-xs text-surface-dim mt-0.5">{toastMessage.sub}</span>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="font-mono text-xs font-black tracking-widest px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant">
                OTP: {toastMessage.otp}
              </span>
              <Link href="/claims" className="text-[11px] text-secondary-fixed hover:underline font-semibold">
                View Digital Pass →
              </Link>
            </div>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-surface-dim hover:text-surface transition-colors p-1"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      <main className="w-full pt-20">
        
        {/* Hero Section */}
        <section className="relative w-full overflow-hidden bg-gradient-to-b from-primary-fixed/20 via-surface to-surface pb-12 sm:pb-16">
          <div className="absolute -top-24 right-1/4 w-[500px] h-[500px] rounded-full bg-primary-container/5 blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 -left-20 w-[420px] h-[420px] rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />

          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
            
            {/* Eyebrow Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-lowest shadow-sm mb-6 border border-outline-variant/20">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-primary font-bold uppercase tracking-wider">
                Hyperlocal Mutual Aid Network
              </span>
              <span className="text-outline-variant">•</span>
              <span className="text-xs text-on-surface-variant font-medium">
                Live in Downtown Metro
              </span>
            </div>

            {/* Headline */}
            <div className="max-w-4xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-on-surface tracking-tight leading-[1.1] mb-5">
                Rescue Good Food, <br />
                <span className="text-primary-container">Feed Your Community.</span>
              </h1>
              <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
                Connect directly with neighborhood bakeries, artisan grocers, and commercial kitchens to redistribute wholesome surplus meals before closing time. 100% free community mutual aid and rescue bags.
              </p>
            </div>

            {/* Dual Primary Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              
              {/* Donate Surplus Food Card */}
              <div className="relative overflow-hidden rounded-2xl bg-primary-container p-6 sm:p-8 text-on-primary shadow-xl hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between">
                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-on-primary/10 blur-2xl group-hover:scale-125 transition-transform duration-500" />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-on-primary/15 flex items-center justify-center text-on-primary">
                      <span className="material-symbols-outlined text-[28px]">storefront</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-on-primary/20 text-xs tracking-wide uppercase font-bold text-on-primary">
                      For Food Businesses
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-on-primary mb-2">
                    Donate Surplus Food
                  </h2>
                  <p className="text-sm text-on-primary-container opacity-90 max-w-md mb-6 leading-relaxed">
                    List any surplus batch in under 60 seconds. Full legal shield under the Bill Emerson Good Samaritan Act with immediate tax receipts and dispatch pickup.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 bg-on-primary/10 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-6 sm:p-8 rounded-b-2xl">
                  <div className="flex items-center gap-1.5 text-on-primary text-xs font-semibold">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>100% Liability Protected</span>
                  </div>
                  <Link
                    href="/donate"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-surface-container-lowest text-primary text-xs font-bold shadow-md hover:bg-surface-bright transition-all group-hover:translate-x-1"
                  >
                    <span>Start Donating</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* Find & Request Food Card */}
              <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-6 sm:p-8 text-on-surface shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col justify-between border border-outline-variant/30">
                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-primary-fixed/40 blur-2xl group-hover:scale-125 transition-transform duration-500" />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[28px]">lunch_dining</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-secondary-container/60 text-xs tracking-wide uppercase font-bold text-on-secondary-container">
                      Available Right Now
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-on-surface mb-2">
                    Find & Request Food
                  </h2>
                  <p className="text-sm text-on-surface-variant max-w-md mb-6 leading-relaxed">
                    Explore restaurant meals, fresh sourdough bread bags, and crisp produce bundles within walking distance. Ranging from $0.00 free mutual aid to pantry recovery rates.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 bg-surface-container-low/70 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-6 sm:p-8 rounded-b-2xl">
                  <div className="flex items-center gap-1.5 text-on-surface-variant text-xs font-semibold">
                    <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                    <span>No Income Verification Needed</span>
                  </div>
                  <Link
                    href="/feed"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary-container text-on-primary text-xs font-bold shadow-md hover:bg-primary transition-all group-hover:translate-x-1"
                  >
                    <span>Browse Nearby Food</span>
                    <span className="material-symbols-outlined text-[18px]">explore</span>
                  </Link>
                </div>
              </div>

            </div>

            {/* Quick Inline Search & Interactive Filter Bar */}
            <div className="mt-8 p-4 rounded-2xl bg-surface-container-lowest shadow-lg border border-outline-variant/20">
              <div className="flex flex-col lg:flex-row items-center gap-4">
                
                {/* Search input */}
                <div className="flex items-center flex-1 w-full px-4 py-2.5 rounded-full bg-surface-container-low focus-within:bg-surface-container-lowest focus-within:shadow-md transition-all border border-outline-variant/30">
                  <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by food item, bakery name, or cuisine (e.g. Biryani, Sourdough, Curry, Juices)..."
                    className="w-full bg-transparent border-none text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none text-sm"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-on-surface-variant p-1">
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  )}
                </div>

                {/* Radius Selector Pills */}
                <div className="flex items-center gap-1 shrink-0 bg-surface-container-low p-1 rounded-full border border-outline-variant/20">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px] pl-2">near_me</span>
                  {['1', '3', '5'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRadius(r)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        selectedRadius === r
                          ? 'bg-surface-container-lowest text-primary shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {r} mi
                    </button>
                  ))}
                </div>

                {/* Direct Feed Link Button */}
                <Link
                  href="/feed"
                  className="shrink-0 px-6 py-2.5 rounded-full bg-inverse-surface text-inverse-on-surface text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>Open Full Map Feed</span>
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                </Link>

              </div>

              {/* Dietary / Category Pill Filters */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-surface-container overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: `All Listings (${listings.length})`, icon: null },
                  { id: 'bakery', label: 'Bakery & Pastries', icon: 'bakery_dining' },
                  { id: 'prepared', label: 'Cooked Meals', icon: 'soup_kitchen' },
                  { id: 'produce', label: 'Fresh Produce', icon: 'nutrition' },
                  { id: 'halal', label: 'Halal Certified', icon: 'verified' },
                  { id: 'vegan', label: 'Vegan Plant-Based', icon: 'eco' },
                  { id: 'free', label: '100% Free Mutual Aid', icon: 'favorite' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setSelectedCategory(chip.id)}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                      selectedCategory === chip.id
                        ? 'bg-primary-container text-on-primary shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {chip.icon && (
                      <span className="material-symbols-outlined text-[16px]">{chip.icon}</span>
                    )}
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>

            </div>

          </div>
        </section>

        {/* Collective Impact Metrics Ledger Banner */}
        <section className="w-full bg-surface-container-low py-12 border-y border-outline-variant/20">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-2">
              <div>
                <span className="text-xs text-primary font-bold uppercase tracking-wider block mb-1">
                  Transparent Community Ledger
                </span>
                <h3 className="text-2xl font-bold text-on-surface">
                  Local Collective Impact This Month
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant bg-surface-container-lowest px-4 py-1.5 rounded-full shadow-sm border border-outline-variant/20">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span>Updated in real-time from verified handovers</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-all border border-outline-variant/20">
                <div className="flex items-center justify-between text-primary mb-4">
                  <span className="material-symbols-outlined text-[32px]">skillet</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-bold">
                    +18% MoM
                  </span>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-primary leading-none tracking-tight mb-1">
                    {savedMealsCount.toLocaleString()}
                  </div>
                  <div className="text-sm font-semibold text-on-surface">Meals Rescued</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">Kept out of city landfills</div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-all border border-outline-variant/20">
                <div className="flex items-center justify-between text-secondary mb-4">
                  <span className="material-symbols-outlined text-[32px]">savings</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold">
                    Direct Relief
                  </span>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-secondary leading-none tracking-tight mb-1">
                    $54,800
                  </div>
                  <div className="text-sm font-semibold text-on-surface">Family Food Savings</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">Returned to neighborhood pockets</div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-all border border-outline-variant/20">
                <div className="flex items-center justify-between text-tertiary mb-4">
                  <span className="material-symbols-outlined text-[32px]">co2</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-bold">
                    Climate Gain
                  </span>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-tertiary leading-none tracking-tight mb-1">
                    24.6 <span className="text-xl font-normal text-on-surface-variant">tons</span>
                  </div>
                  <div className="text-sm font-semibold text-on-surface">CO₂ Averted</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">Equals 62,000 driving miles</div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-all border border-outline-variant/20">
                <div className="flex items-center justify-between text-on-surface mb-4">
                  <span className="material-symbols-outlined text-[32px]">handshake</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-bold">
                    Active
                  </span>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-on-surface leading-none tracking-tight mb-1">
                    142
                  </div>
                  <div className="text-sm font-semibold text-on-surface">Community Donors</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">Bakeries, restaurants, caterers</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Urgent Rescue Needed Grid */}
        <section className="w-full py-16 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8" id="urgent-rescue">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-primary mb-1">
                <span className="material-symbols-outlined text-[20px] animate-pulse">timer</span>
                <span className="text-xs font-bold uppercase tracking-wider">Fast Action Window</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-on-surface">
                Expiring Today — Urgent Rescue Needed
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Prepared meals, bakery goods, and produce expiring within 4 hours.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant">
                Showing <strong>{filteredListings.length} rescue offers</strong>
              </span>
              <Link
                href="/feed"
                className="px-3.5 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-xs font-bold text-on-surface transition-colors flex items-center gap-1"
              >
                <span>View All on Map</span>
                <span className="material-symbols-outlined text-[16px]">map</span>
              </Link>
            </div>
          </div>

          {/* 4-Column Responsive Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredListings.map((listing) => {
              const expiresDate = new Date(listing.expiresAt);
              const nowMs = currentTime || 1760500000000;
              const diffHours = Math.max(1, Math.round((expiresDate.getTime() - nowMs) / (1000 * 60 * 60)));

              return (
                <div
                  key={listing.id}
                  className="group flex flex-col justify-between rounded-2xl bg-surface-container-lowest overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-outline-variant/20"
                >
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-surface-container">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={listing.photoUrls[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Expiry Badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container text-[11px] font-bold flex items-center gap-1 shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container animate-ping" />
                        Expires in {diffHours}h
                      </span>
                    </div>

                    {/* Distance Badge */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface text-[11px] font-semibold flex items-center gap-0.5 shadow-sm">
                        <span className="material-symbols-outlined text-[14px] text-primary">pin_drop</span>
                        {listing.distanceKm} mi
                      </span>
                    </div>

                    {/* Portions Badge */}
                    <div className="absolute bottom-2 left-2.5">
                      <span className="px-2 py-0.5 rounded-md bg-inverse-surface/85 backdrop-blur-xs text-inverse-on-surface text-[11px] font-bold">
                        {listing.quantityServings} portions left
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold text-[10px]">
                          {listing.donorName[0]}
                        </span>
                        <span className="text-xs font-semibold text-on-surface truncate">
                          {listing.donorName}
                        </span>
                        <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
                      </div>

                      <h3 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors line-clamp-1 mb-1">
                        {listing.title}
                      </h3>

                      <p className="text-xs text-on-surface-variant line-clamp-2 mb-3">
                        {listing.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-surface-container">
                      <div className="flex items-baseline justify-between mb-3">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-extrabold text-primary">100% FREE</span>
                          <span className="text-xs text-on-surface-variant/60 line-through">$18.00</span>
                        </div>
                        <span className="text-[11px] text-secondary font-bold bg-secondary-container/50 px-1.5 py-0.5 rounded">
                          MUTUAL AID
                        </span>
                      </div>

                      {listing.status === 'available' ? (
                        <button
                          onClick={() => handleQuickReserve(listing.id, listing.title, listing.donorName)}
                          className="w-full py-2 rounded-full bg-primary-container text-on-primary text-xs font-bold hover:bg-primary transition-colors shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <span>Reserve Now (OTP)</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>
                      ) : (
                        <div className="w-full py-2 rounded-full bg-surface-container text-on-surface-variant text-xs font-bold text-center">
                          Reserved / Claimed
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-16 bg-surface-container-low border-y border-outline-variant/20" id="how-it-works">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                PRD Verified Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-on-surface mt-1">
                How FoodBridge Rescues Surplus in 60 Minutes
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-surface-container-lowest shadow-sm text-center flex flex-col items-center border border-outline-variant/20">
                <div className="w-14 h-14 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[32px]">storefront</span>
                </div>
                <h3 className="font-bold text-lg text-on-surface mb-2">1. Donors Post Surplus</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Food businesses specify portions, shelf-life, and pickup instructions in under a minute with zero overhead.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-surface-container-lowest shadow-sm text-center flex flex-col items-center border border-outline-variant/20">
                <div className="w-14 h-14 rounded-2xl bg-secondary-fixed text-secondary flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[32px]">near_me</span>
                </div>
                <h3 className="font-bold text-lg text-on-surface mb-2">2. Hyperlocal Discovery</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Neighbors, shelters, and community kitchens discover available food within walking radius and claim instantly.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-surface-container-lowest shadow-sm text-center flex flex-col items-center border border-outline-variant/20">
                <div className="w-14 h-14 rounded-2xl bg-tertiary-fixed text-tertiary flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[32px]">qr_code_scanner</span>
                </div>
                <h3 className="font-bold text-lg text-on-surface mb-2">3. OTP / QR Handover</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  A single-use 6-digit OTP code or QR badge guarantees accountability, food safety verification, and transparent metrics.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant/20 bg-surface-container-lowest py-10 text-xs text-on-surface-variant">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-on-surface text-sm">FoodBridge</span>
            <span>— Open Community Zero Food Waste Network</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/feed" className="hover:text-primary transition-colors">Explore</Link>
            <Link href="/donate" className="hover:text-primary transition-colors">Donate</Link>
            <Link href="/claims" className="hover:text-primary transition-colors">Claims & OTP</Link>
            <Link href="/volunteer" className="hover:text-primary transition-colors">Volunteers</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

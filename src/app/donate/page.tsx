'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { useAppStore } from '@/lib/store';
import { FoodCategory } from '@/lib/mock-data';

export default function DonatePortalPage() {
  const router = useRouter();
  const { addListing } = useAppStore();

  const [title, setTitle] = useState('15x Fresh Assorted Deli Sandwiches & Artisan Sourdough');
  const [description, setDescription] = useState('Prepared fresh for catering lunch buffet. Neatly packed into biodegradable boxes, chilled at 38°F.');
  const [category, setCategory] = useState<FoodCategory>('cooked_meal');
  const [servings, setServings] = useState(15);
  const [dietaryTags, setDietaryTags] = useState<string[]>(['Vegetarian', 'Nut-Free']);
  const [address, setAddress] = useState('42 Brigade Road, Central District');
  const [instructions, setInstructions] = useState('Kitchen entrance Gate 3. Mention FoodBridge pickup.');
  const [allowVolunteer, setAllowVolunteer] = useState(true);
  const [pricingMode, setPricingMode] = useState<'free' | 'fee'>('free');
  const [published, setPublished] = useState(false);

  // Sample photo options for donors
  const samplePhotos = [
    { label: 'Sandwiches & Deli', url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800&auto=format&fit=crop&q=80' },
    { label: 'Artisan Bakery', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80' },
    { label: 'Hot Biryani / Rice', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80' },
    { label: 'Fresh Produce', url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&auto=format&fit=crop&q=80' },
  ];
  const [selectedPhoto, setSelectedPhoto] = useState(samplePhotos[0].url);

  const toggleTag = (tag: string) => {
    if (dietaryTags.includes(tag)) {
      setDietaryTags(dietaryTags.filter((t) => t !== tag));
    } else {
      setDietaryTags([...dietaryTags, tag]);
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) return;

    addListing({
      title,
      description,
      category,
      quantityServings: servings,
      dietaryTags,
      photoUrls: [selectedPhoto],
      pickupAddress: address,
      pickupInstructions: instructions,
      lat: 12.9716,
      lng: 77.5946,
      distanceKm: 0.8,
      preparedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      donorType: 'Restaurant',
      isDeliveryAvailable: allowVolunteer,
    });

    try {
      const categoryMap: Record<string, string> = {
        cooked_meal: 'COOKED_MEAL',
        raw_ingredients: 'RAW_INGREDIENTS',
        bakery: 'BAKERY',
        packaged: 'PACKAGED',
        beverages: 'BEVERAGES',
        other: 'OTHER',
      };

      const now = new Date();
      const expiry = new Date(Date.now() + 4 * 60 * 60 * 1000);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category: categoryMap[category] || 'COOKED_MEAL',
        quantityServings: Number(servings) || 10,
        dietaryTags: dietaryTags.join(','),
        photoUrl: selectedPhoto,
        pickupAddress: address.trim() || '42 Brigade Road, Central District',
        pickupInstructions: instructions.trim() || 'Standard pickup',
        latitude: 12.9716,
        longitude: 77.5946,
        preparedAt: now.toISOString().slice(0, 19),
        expiresAt: expiry.toISOString().slice(0, 19),
        isDeliveryAvailable: Boolean(allowVolunteer),
      };

      await fetch('http://localhost:8080/api/v1/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('Backend sync note:', err);
    }

    setPublished(true);
    setTimeout(() => {
      router.push('/feed');
    }, 2000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Navbar />

      <main className="w-full pt-20">
        
        {/* Top Context Header Bar */}
        <section className="w-full bg-surface-container-low px-4 sm:px-6 lg:px-8 py-8 sm:py-12 border-b border-outline-variant/20">
          <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-xs font-bold uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Emergency Food Rescue Dispatch
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
                Donate Surplus Food & Feed Neighbors
              </h1>
              <p className="text-sm sm:text-base text-on-surface-variant mt-2 leading-relaxed">
                Post surplus meals, bakery goods, and fresh produce in 60 seconds. Eliminate kitchen waste, earn green tax receipts, and protect local families from food insecurity.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="p-3 rounded-2xl bg-surface-container-lowest shadow-sm flex items-center gap-3 border border-outline-variant/20">
                <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">verified_user</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase block">
                    Verified Kitchen Status
                  </span>
                  <span className="text-xs font-bold text-on-surface">Civic Level 3 Partner</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Success Modal Toast if published */}
        {published && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm animate-in fade-in">
            <div className="p-8 rounded-3xl bg-surface-container-lowest shadow-2xl text-center max-w-sm w-full border border-outline-variant/30">
              <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container mx-auto flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[36px]">check_circle</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface">Surplus Published!</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Your donation is now broadcast live to neighbors and shelters within a 3-mile radius.
              </p>
              <div className="mt-4 text-xs font-semibold text-secondary">
                Redirecting to community feed...
              </div>
            </div>
          </div>
        )}

        {/* 2-Column Portal Workflow */}
        <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Form (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Category Selector Pills */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Select Donor Profile Category
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {[
                    { label: 'Restaurant / Cafe', icon: 'restaurant' },
                    { label: 'Bakery & Pastry', icon: 'bakery_dining' },
                    { label: 'Grocery Store', icon: 'local_grocery_store' },
                    { label: 'Catering & Events', icon: 'room_service' },
                    { label: 'Community Cook', icon: 'soup_kitchen' },
                  ].map((cat, idx) => (
                    <button
                      key={cat.label}
                      type="button"
                      className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all border ${
                        idx === 0
                          ? 'bg-primary text-on-primary border-primary shadow-sm'
                          : 'bg-surface-container-low text-on-surface hover:bg-surface-container border-outline-variant/30'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 1: Food Details */}
              <div className="p-6 rounded-3xl bg-surface-container-lowest shadow-sm flex flex-col gap-5 border border-outline-variant/20">
                <div className="flex items-center justify-between pb-1 border-b border-surface-container">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <h2 className="text-base font-bold text-on-surface">Surplus Item Overview</h2>
                  </div>
                  <span className="text-xs text-secondary font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">bolt</span> Real-time Live Preview
                  </span>
                </div>

                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface">Item Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-12 px-4 rounded-full bg-surface-container-low text-on-surface text-sm border border-outline-variant/30 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. 15x Fresh Assorted Deli Sandwiches & Artisan Sourdough"
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface">Description & Ingredients</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-surface-container-low text-on-surface text-xs border border-outline-variant/30 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Details about preparation, allergens, packaging, and shelf life..."
                  />
                </div>

                {/* Category & Servings Split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-on-surface">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as FoodCategory)}
                      className="w-full h-12 px-4 rounded-full bg-surface-container-low text-on-surface text-xs border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary font-semibold cursor-pointer"
                    >
                      <option value="cooked_meal">Prepared Meals & Hot Dishes</option>
                      <option value="bakery">Baked Goods & Breads</option>
                      <option value="raw_ingredients">Fresh Produce & Fruits</option>
                      <option value="packaged">Packaged Pantry Items</option>
                      <option value="beverages">Beverages & Juices</option>
                    </select>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-on-surface">Estimated Servings / Meals</label>
                    <div className="flex items-center justify-between h-12 px-3 rounded-full bg-surface-container-low border border-outline-variant/30">
                      <button
                        type="button"
                        onClick={() => setServings(Math.max(1, servings - 5))}
                        className="w-8 h-8 rounded-full bg-surface-container-lowest text-on-surface hover:bg-surface-container flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="text-base font-black text-primary">{servings} meals</span>
                      <button
                        type="button"
                        onClick={() => setServings(servings + 5)}
                        className="w-8 h-8 rounded-full bg-surface-container-lowest text-on-surface hover:bg-surface-container flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dietary Multi-Select Badges */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface">Dietary & Allergen Tags</label>
                  <div className="flex flex-wrap items-center gap-2">
                    {['Vegetarian', 'Vegan', 'Halal', 'Nut-Free', 'Gluten-Free', 'Dairy-Free'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                          dietaryTags.includes(tag)
                            ? 'bg-secondary-container text-on-secondary-container border-secondary-container shadow-xs'
                            : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border-outline-variant/30'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sample Photo Selector */}
                <div className="flex flex-col gap-2 pt-2 border-t border-surface-container">
                  <label className="text-xs font-bold text-on-surface">Attach Food Photo</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {samplePhotos.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setSelectedPhoto(p.url)}
                        className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all group ${
                          selectedPhoto === p.url ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 right-1 px-1 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold truncate">
                          {p.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* SECTION 2: Pickup Location & Logistics */}
              <div className="p-6 rounded-3xl bg-surface-container-lowest shadow-sm flex flex-col gap-5 border border-outline-variant/20">
                <div className="flex items-center gap-2.5 pb-1 border-b border-surface-container">
                  <span className="w-7 h-7 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <h2 className="text-base font-bold text-on-surface">Pickup & Volunteer Transport</h2>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface">Pickup Address (Public)</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-12 px-4 rounded-full bg-surface-container-low text-on-surface text-xs border border-outline-variant/30 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface">Kitchen Pickup Instructions</label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full h-12 px-4 rounded-full bg-surface-container-low text-on-surface text-xs border border-outline-variant/30 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Volunteer Delivery Toggle */}
                <div className="p-4 rounded-2xl bg-surface-container-low flex items-center justify-between gap-4 border border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[22px]">pedal_bike</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-on-surface">Allow Verified Volunteer Couriers</h3>
                      <p className="text-[11px] text-on-surface-variant">
                        Dispatches volunteer cyclists/drivers to deliver directly to local family shelters.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowVolunteer}
                    onChange={(e) => setAllowVolunteer(e.target.checked)}
                    className="h-5 w-5 rounded-md text-secondary accent-secondary cursor-pointer"
                  />
                </div>
              </div>

              {/* SECTION 3: Community Pricing Model */}
              <div className="p-6 rounded-3xl bg-surface-container-lowest shadow-sm flex flex-col gap-4 border border-outline-variant/20">
                <div className="flex items-center gap-2.5 pb-1 border-b border-surface-container">
                  <span className="w-7 h-7 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <h2 className="text-base font-bold text-on-surface">Mutual Aid Community Pricing Model</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => setPricingMode('free')}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                      pricingMode === 'free'
                        ? 'bg-primary-fixed/20 border-primary ring-2 ring-primary/20'
                        : 'bg-surface-container-low border-outline-variant/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-bold">
                        Recommended
                      </span>
                      <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                    </div>
                    <h3 className="font-bold text-sm text-on-surface">100% Free Mutual Aid Gift</h3>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Direct mutual aid for neighbors experiencing food hardship. Claims are reserved instantly.
                    </p>
                    <div className="mt-3 text-secondary text-[11px] font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">speed</span> Average claim time: 14 mins
                    </div>
                  </div>

                  <div
                    onClick={() => setPricingMode('fee')}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                      pricingMode === 'fee'
                        ? 'bg-primary-fixed/20 border-primary ring-2 ring-primary/20'
                        : 'bg-surface-container-low border-outline-variant/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-bold">
                        Container Subsidy
                      </span>
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px]">radio_button_unchecked</span>
                    </div>
                    <h3 className="font-bold text-sm text-on-surface">Packaging Fee ($2.00)</h3>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Offset compostable packaging and insulated cold-pack costs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20">
                <div className="flex items-center gap-1.5 text-on-surface-variant text-xs">
                  <span className="material-symbols-outlined text-[18px]">policy</span>
                  <span>Listing adheres to Safe Food Handling Act Standards</span>
                </div>
                <button
                  type="button"
                  onClick={handlePublish}
                  className="w-full sm:w-auto px-8 py-3 rounded-full bg-primary-container text-on-primary font-bold text-sm shadow-lg hover:bg-primary transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">publish</span>
                  <span>Publish Surplus Listing</span>
                </button>
              </div>

            </div>

            {/* Right Column: Sticky Live Desktop Preview (4 cols) */}
            <div className="lg:col-span-4 sticky top-24 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping" />
                  <span className="text-xs uppercase tracking-wider text-on-surface font-bold">
                    Community Feed Live Preview
                  </span>
                </div>
                <span className="text-[11px] text-on-surface-variant">What neighbors see</span>
              </div>

              {/* Live Preview Food Card */}
              <div className="rounded-2xl bg-surface-container-lowest shadow-xl overflow-hidden border border-outline-variant/30">
                <div className="relative w-full aspect-[16/10] bg-surface-container">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedPhoto} alt="Preview" className="w-full h-full object-cover" />
                  
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container/95 text-on-secondary-container text-[11px] font-bold shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    <span>Fresh Today</span>
                  </div>

                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-lowest/90 text-on-surface text-[11px] font-semibold shadow-xs">
                    <span className="material-symbols-outlined text-primary text-[14px]">near_me</span>
                    <span>0.4 mi</span>
                  </div>

                  <div className="absolute bottom-2.5 left-2.5">
                    <span className="px-3 py-1 rounded-full bg-primary text-on-primary text-xs font-bold shadow-md">
                      {pricingMode === 'free' ? '100% Free Gift' : 'Packaging $2.00'}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-2">
                  <h3 className="font-bold text-sm text-on-surface line-clamp-2">
                    {title || 'Surplus Item Title'}
                  </h3>

                  <div className="flex items-center gap-1 flex-wrap">
                    {dietaryTags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-surface-container-low text-[10px] text-on-surface-variant font-medium">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-surface-container flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-on-surface block">Your Organization</span>
                      <span className="text-[11px] text-on-surface-variant">{address.slice(0, 24)}...</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-primary block leading-none">{servings}</span>
                      <span className="text-[10px] text-on-surface-variant uppercase">Meals</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Environmental Impact Estimator Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-surface-container-lowest via-surface-container-lowest to-primary-fixed/20 shadow-sm border border-outline-variant/20 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Estimated Rescue Impact
                  </span>
                  <span className="material-symbols-outlined text-secondary text-[20px]">eco</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-3 rounded-xl bg-surface-container-low">
                    <span className="text-xl font-black text-primary block leading-none">
                      {(servings * 0.7).toFixed(1)} kg
                    </span>
                    <span className="text-[10px] text-on-surface-variant mt-1 block">CO₂e Prevented</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low">
                    <span className="text-xl font-black text-secondary block leading-none">
                      {servings}
                    </span>
                    <span className="text-[10px] text-on-surface-variant mt-1 block">Meals to Neighbors</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </main>
    </div>
  );
}

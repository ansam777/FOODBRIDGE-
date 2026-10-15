'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { UserRole } from '@/lib/mock-data';

type DestinationOption = {
  id: 'feed' | 'donate' | 'volunteer' | 'admin';
  role: UserRole;
  title: string;
  badge: string;
  desc: string;
  icon: string;
  path: string;
};

const OPTIONS: DestinationOption[] = [
  {
    id: 'feed',
    role: 'recipient',
    title: 'Find & Rescue Food',
    badge: 'Recipients & NGOs',
    desc: 'Browse available meals, bakery bags & produce nearby',
    icon: 'lunch_dining',
    path: '/feed',
  },
  {
    id: 'donate',
    role: 'donor',
    title: 'Donate Surplus Food',
    badge: 'Food Businesses & Donors',
    desc: 'Post kitchen excess, catered batches & bakery surplus',
    icon: 'storefront',
    path: '/donate',
  },
  {
    id: 'volunteer',
    role: 'volunteer',
    title: 'Volunteer Courier',
    badge: 'Community Logistics',
    desc: 'Pick up and deliver meals to mobility-impaired neighbors',
    icon: 'directions_bike',
    path: '/volunteer',
  },
];

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setRole } = useAppStore();

  const [selectedOptionId, setSelectedOptionId] = useState<'feed' | 'donate' | 'volunteer' | 'admin'>('feed');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectNotice, setRedirectNotice] = useState<string | null>(null);

  // Auto-detect destination option from URL params if provided (e.g. ?redirect=/donate or ?role=donor)
  useEffect(() => {
    const roleParam = searchParams.get('role');
    const redirectParam = searchParams.get('redirect');

    if (redirectParam === '/donate' || roleParam === 'donor') {
      setSelectedOptionId('donate');
    } else if (redirectParam === '/volunteer' || roleParam === 'volunteer') {
      setSelectedOptionId('volunteer');
    } else if (redirectParam === '/feed' || roleParam === 'recipient') {
      setSelectedOptionId('feed');
    }
  }, [searchParams]);

  const activeOption = OPTIONS.find((o) => o.id === selectedOptionId) || OPTIONS[0];

  const executeLoginAndRedirect = (option: DestinationOption, userEmail?: string) => {
    setIsSubmitting(true);
    setRedirectNotice(`Redirecting to ${option.title}...`);

    // 1. Update application state store with selected role
    setRole(option.role);

    // 2. Perform navigation to selected destination
    router.push(option.path);

    // 3. Fallback safety timer: ensure navigation fires even if client-router was throttled
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.location.pathname !== option.path) {
        window.location.assign(option.path);
      }
    }, 450);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLoginAndRedirect(activeOption, email);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-on-primary shadow-md group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[26px]">restaurant</span>
          </div>
          <span className="text-3xl font-extrabold text-primary tracking-tight font-sans">
            FoodBridge
          </span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
          Sign In to FoodBridge
        </h1>
        <p className="mt-1.5 text-xs text-on-surface-variant max-w-sm mx-auto">
          Choose where you want to go, enter your details, and we will take you straight to your selected portal.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-surface-container-lowest py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-outline-variant/30">
          
          {/* Step 1: Select Your Activity / Destination */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[11px] flex items-center justify-center">1</span>
                <span>Select Your Activity</span>
              </label>
              <span className="text-[11px] text-secondary font-bold">Direct Destination</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {OPTIONS.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={`text-left p-3.5 rounded-2xl transition-all border-2 flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-primary-fixed/20 border-primary ring-2 ring-primary/20 shadow-sm'
                        : 'bg-surface-container-low border-transparent hover:border-outline-variant/40 hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-primary text-on-primary shadow-sm'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[22px]">{opt.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-on-surface truncate">
                            {opt.title}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-primary-container text-on-primary'
                                : 'bg-surface-container-high text-on-surface-variant'
                            }`}
                          >
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant truncate mt-0.5">
                          {opt.desc}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center">
                      <span
                        className={`material-symbols-outlined text-[20px] ${
                          isSelected ? 'text-primary' : 'text-outline-variant'
                        }`}
                      >
                        {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Login Details */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[11px] flex items-center justify-center">2</span>
                <span>Account Credentials</span>
              </label>
              <span className="text-[11px] text-on-surface-variant">Demo or Personal</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  selectedOptionId === 'donate'
                    ? 'donor@saffrongrand.com'
                    : selectedOptionId === 'volunteer'
                    ? 'volunteer@foodbridge.org'
                    : 'shelter@communityaid.org'
                }
                className="w-full h-11 px-4 rounded-xl bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-on-surface">
                  Password
                </label>
                <span className="text-[11px] text-on-surface-variant">Demo mode active</span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-4 rounded-xl bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
              />
            </div>

            {/* Direct Submit & Action Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-4 rounded-full bg-primary-container text-on-primary font-bold text-xs sm:text-sm shadow-lg shadow-primary-container/25 hover:bg-primary transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                  <span>{redirectNotice || 'Signing In & Redirecting...'}</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  <span>
                    Sign In & Go to{' '}
                    {selectedOptionId === 'donate'
                      ? 'Donation Page'
                      : selectedOptionId === 'volunteer'
                      ? 'Volunteer Hub'
                      : 'Find Food Feed'}
                  </span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Feedback Banner if redirecting */}
          {redirectNotice && (
            <div className="mt-4 p-3 rounded-xl bg-secondary-container/50 border border-secondary/30 text-center animate-in fade-in">
              <p className="text-xs font-bold text-on-secondary-container">
                {redirectNotice}
              </p>
              <Link
                href={activeOption.path}
                className="text-[11px] text-secondary font-semibold hover:underline mt-0.5 inline-block"
              >
                Click here if you are not redirected automatically →
              </Link>
            </div>
          )}

          {/* Quick 1-Click Persona Simulator */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-container" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-surface-container-lowest text-on-surface-variant font-medium">
                Or 1-Click Instant Persona Sign-In
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedOptionId('feed');
                executeLoginAndRedirect(OPTIONS[0]);
              }}
              className="p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-bold text-on-surface flex items-center gap-2 transition-all border border-outline-variant/20 hover:scale-[1.02]"
            >
              <span className="text-base">🤲</span>
              <div className="text-left">
                <div className="leading-tight">Find Food</div>
                <div className="text-[10px] text-secondary font-semibold">Recipient NGO</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedOptionId('donate');
                executeLoginAndRedirect(OPTIONS[1]);
              }}
              className="p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-bold text-on-surface flex items-center gap-2 transition-all border border-outline-variant/20 hover:scale-[1.02]"
            >
              <span className="text-base">🏪</span>
              <div className="text-left">
                <div className="leading-tight">Donate Food</div>
                <div className="text-[10px] text-primary font-semibold">Food Donor</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedOptionId('volunteer');
                executeLoginAndRedirect(OPTIONS[2]);
              }}
              className="p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-bold text-on-surface flex items-center gap-2 transition-all border border-outline-variant/20 hover:scale-[1.02]"
            >
              <span className="text-base">🚴</span>
              <div className="text-left">
                <div className="leading-tight">Deliveries</div>
                <div className="text-[10px] text-tertiary font-semibold">Volunteer</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedOptionId('admin');
                executeLoginAndRedirect({
                  id: 'admin',
                  role: 'admin',
                  title: 'System Admin',
                  badge: 'Admin',
                  desc: 'View audits and platform ledger',
                  icon: 'shield_person',
                  path: '/',
                });
              }}
              className="p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-bold text-on-surface flex items-center gap-2 transition-all border border-outline-variant/20 hover:scale-[1.02]"
            >
              <span className="text-base">🛡️</span>
              <div className="text-left">
                <div className="leading-tight">Admin Ledger</div>
                <div className="text-[10px] text-on-surface-variant font-semibold">System Admin</div>
              </div>
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-on-surface-variant">
            Want to explore without signing in?{' '}
            <Link href="/" className="font-bold text-primary hover:underline">
              Return to Homepage
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { UserRole } from '@/lib/mock-data';

export function Navbar() {
  const pathname = usePathname();
  const { currentRole, setRole, claims, deliveries, currentUserName } = useAppStore();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeClaimsCount = claims.filter((c) => c.status !== 'completed' && c.status !== 'cancelled').length;
  const activeDeliveriesCount = deliveries.filter((d) => d.status !== 'delivered' && d.status !== 'cancelled').length;

  const roles: { role: UserRole; title: string; desc: string; icon: string }[] = [
    { role: 'recipient', title: 'Neighbor / NGO Recipient', desc: 'Browse & claim nearby food', icon: '🤲' },
    { role: 'donor', title: 'Food Business Donor', desc: 'Post kitchen & bakery surplus', icon: '🏪' },
    { role: 'volunteer', title: 'Volunteer Courier', desc: 'Pick up & transport food', icon: '🚴' },
    { role: 'admin', title: 'System Administrator', desc: 'View audits, stats & ledger', icon: '🛡️' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container">
      <div className="h-20 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Location */}
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-on-primary shadow-sm group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">restaurant</span>
            </div>
            <span className="font-bold text-xl text-primary tracking-tight font-sans">
              FoodBridge
            </span>
          </Link>

          {/* Location Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low text-on-surface cursor-pointer hover:bg-surface-container transition-colors text-xs font-semibold">
            <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
            <span>Downtown Metro • 2.5 mi</span>
            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">expand_more</span>
          </div>
        </div>

        {/* Global Search Input */}
        <div className="hidden lg:flex items-center flex-1 max-w-xs mx-3">
          <div className="flex items-center w-full h-10 px-3 rounded-full bg-surface-container-lowest shadow-[0_2px_8px_rgba(26,26,26,0.04)] focus-within:ring-2 focus-within:ring-primary/20 transition-all border border-outline-variant/30">
            <span className="material-symbols-outlined text-on-surface-variant mr-2 text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search meals, pantry, produce..."
              className="w-full bg-transparent border-none text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none text-xs"
            />
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-5 shrink-0 text-sm">
          <Link
            href="/feed"
            className={`transition-colors font-semibold ${
              pathname === '/feed'
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Explore Food
          </Link>

          <Link
            href="/donate"
            className={`transition-colors font-semibold ${
              pathname === '/donate'
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Donate Surplus
          </Link>

          <Link
            href="/claims"
            className={`relative transition-colors font-semibold flex items-center gap-1 ${
              pathname === '/claims'
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Claims & OTP</span>
            {activeClaimsCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary">
                {activeClaimsCount}
              </span>
            )}
          </Link>

          <Link
            href="/volunteer"
            className={`relative transition-colors font-semibold flex items-center gap-1 ${
              pathname === '/volunteer'
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Volunteer Hub</span>
            {activeDeliveriesCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-tertiary text-[10px] font-bold text-on-tertiary">
                {activeDeliveriesCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Right Action CTAs & Profile */}
        <div className="flex items-center gap-3 shrink-0">
          
          <div className="hidden sm:flex items-center gap-2">
            <Link
              href="/feed"
              className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-surface-container-lowest text-primary text-xs font-bold shadow-[0_2px_8px_rgba(26,26,26,0.04)] hover:bg-primary-fixed hover:text-on-primary-fixed-variant transition-all border border-outline-variant/40"
            >
              Find Food
            </Link>
            <Link
              href="/donate"
              className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary-container text-on-primary text-xs font-bold shadow-[0_4px_16px_rgba(211,47,47,0.25)] hover:bg-primary transition-all"
            >
              Donate Food
            </Link>
          </div>

          <div className="h-6 w-[1px] bg-outline-variant/40 hidden sm:block"></div>

          {/* Persona Switcher Trigger */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer border border-outline-variant/30"
              title="Switch persona to test features"
            >
              <div className="w-7 h-7 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs uppercase">
                {currentRole[0]}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[11px] font-bold text-on-surface leading-none capitalize">
                  {currentRole}
                </span>
                <span className="text-[10px] text-secondary font-medium leading-none mt-0.5">
                  Demo Active
                </span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-[16px]">
                unfold_more
              </span>
            </button>

            {/* Persona Switcher Dropdown */}
            {roleMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-72 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setRoleMenuOpen(false)}
              >
                <div className="px-3 py-2 border-b border-surface-container">
                  <p className="text-xs font-bold text-on-surface">Persona Perspective</p>
                  <p className="text-[11px] text-on-surface-variant truncate">Logged in as {currentUserName}</p>
                </div>
                <div className="py-1">
                  {roles.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => setRole(r.role)}
                      className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                        currentRole === r.role
                          ? 'bg-primary-fixed text-on-primary-fixed font-bold'
                          : 'text-on-surface hover:bg-surface-container-low'
                      }`}
                    >
                      <span className="text-base">{r.icon}</span>
                      <div>
                        <p className="font-semibold">{r.title}</p>
                        <p className="text-[10px] text-on-surface-variant">{r.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-on-surface-variant hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-container bg-surface-container-lowest px-4 py-3 space-y-2">
          <Link
            href="/feed"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-semibold text-on-surface hover:text-primary"
          >
            <span className="material-symbols-outlined text-primary text-[20px]">explore</span>
            Explore Food Nearby
          </Link>
          <Link
            href="/donate"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-semibold text-on-surface hover:text-primary"
          >
            <span className="material-symbols-outlined text-primary text-[20px]">volunteer_activism</span>
            Donate Surplus Food
          </Link>
          <Link
            href="/claims"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-semibold text-on-surface hover:text-primary"
          >
            <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
            My Claims & OTP ({activeClaimsCount})
          </Link>
          <Link
            href="/volunteer"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-semibold text-on-surface hover:text-primary"
          >
            <span className="material-symbols-outlined text-tertiary text-[20px]">directions_bike</span>
            Volunteer Courier Hub ({activeDeliveriesCount})
          </Link>
        </div>
      )}
    </header>
  );
}

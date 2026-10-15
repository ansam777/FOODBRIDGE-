'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { useAppStore } from '@/lib/store';

export default function VolunteerHubPage() {
  const { deliveries, advanceDeliveryStatus } = useAppStore();
  const [isAvailable, setIsAvailable] = useState(true);
  const [serviceRadius, setServiceRadius] = useState('5');

  const activeDeliveries = deliveries.filter((d) => d.status !== 'delivered' && d.status !== 'cancelled');
  const completedDeliveries = deliveries.filter((d) => d.status === 'delivered');

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Navbar />

      <main className="w-full pt-20">
        
        {/* Header */}
        <section className="w-full bg-surface-container-low px-4 sm:px-6 lg:px-8 py-8 sm:py-12 border-b border-outline-variant/20">
          <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container text-xs font-bold uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-[16px]">directions_bike</span>
                Volunteer Logistics Network (PRD §5.5)
              </div>
              <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">
                Volunteer Courier Dispatch Hub
              </h1>
              <p className="text-sm text-on-surface-variant mt-1">
                Transport wholesome surplus meals from local kitchens to family shelters in your neighbourhood.
              </p>
            </div>

            {/* Availability Toggle */}
            <div className="p-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-secondary animate-pulse' : 'bg-outline'}`} />
              <div className="text-left">
                <span className="text-xs font-bold text-on-surface block">
                  {isAvailable ? 'Available for Pickups' : 'Offline / Inactive'}
                </span>
                <span className="text-[10px] text-on-surface-variant">{serviceRadius} mi delivery radius</span>
              </div>
              <button
                onClick={() => setIsAvailable(!isAvailable)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  isAvailable
                    ? 'bg-secondary-container text-on-secondary-container'
                    : 'bg-surface-container-high text-on-surface'
                }`}
              >
                {isAvailable ? 'Go Offline' : 'Go Online'}
              </button>
            </div>
          </div>
        </section>

        {/* Dashboard Content */}
        <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          
          {/* Volunteer Impact Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 shadow-xs">
              <span className="text-2xl font-black text-primary block leading-none">12</span>
              <span className="text-xs text-on-surface-variant mt-1 block">Deliveries Completed</span>
            </div>
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 shadow-xs">
              <span className="text-2xl font-black text-secondary block leading-none">38.4 km</span>
              <span className="text-xs text-on-surface-variant mt-1 block">Distance Cycled</span>
            </div>
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 shadow-xs">
              <span className="text-2xl font-black text-tertiary block leading-none">520</span>
              <span className="text-xs text-on-surface-variant mt-1 block">Meals Delivered</span>
            </div>
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 shadow-xs">
              <span className="text-2xl font-black text-on-surface block leading-none">5.0 ⭐</span>
              <span className="text-xs text-on-surface-variant mt-1 block">Courier Trust Score</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-on-surface mb-4">
            Active Transport Deliveries ({activeDeliveries.length})
          </h2>

          {activeDeliveries.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              {activeDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="p-6 rounded-3xl bg-surface-container-lowest shadow-md border border-outline-variant/30 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container text-[11px] font-bold uppercase">
                          {delivery.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-on-surface font-semibold">{delivery.distanceKm} km route</span>
                      </div>
                      <span className="text-xs text-secondary font-bold">Priority Rescue</span>
                    </div>

                    <h3 className="text-lg font-bold text-on-surface mt-3">{delivery.listingTitle}</h3>

                    {/* Step Timeline */}
                    <div className="my-5 p-4 rounded-2xl bg-surface-container-low flex flex-col gap-3">
                      
                      {/* Step 1: Donor Pickup */}
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          A
                        </span>
                        <div>
                          <span className="text-xs font-bold text-on-surface block">Pickup from Donor</span>
                          <span className="text-xs text-on-surface-variant">{delivery.donorAddress}</span>
                          <div className="mt-1 text-[11px] font-mono font-bold text-primary">
                            Pickup OTP: {delivery.pickupOtp}
                          </div>
                        </div>
                      </div>

                      <div className="border-l-2 border-dashed border-outline-variant ml-3 h-4" />

                      {/* Step 2: Shelter Dropoff */}
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          B
                        </span>
                        <div>
                          <span className="text-xs font-bold text-on-surface block">Deliver to Shelter</span>
                          <span className="text-xs text-on-surface-variant">{delivery.recipientAddress}</span>
                          <div className="mt-1 text-[11px] font-mono font-bold text-secondary">
                            Dropoff OTP: {delivery.dropoffOtp}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Advance status action */}
                  <div className="pt-3 border-t border-surface-container flex items-center justify-between gap-2">
                    <span className="text-[11px] text-on-surface-variant">Step: {delivery.status}</span>
                    <button
                      onClick={() => advanceDeliveryStatus(delivery.id)}
                      className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-xs font-bold shadow-sm hover:bg-on-primary-fixed-variant transition-colors flex items-center gap-1.5"
                    >
                      <span>Advance Task Status</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/20 max-w-md mx-auto mb-12">
              <span className="material-symbols-outlined text-[36px] text-secondary mb-2">check_circle</span>
              <h3 className="text-base font-bold text-on-surface">All Deliveries Complete!</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                No active delivery dispatches right now in your radius. We will alert you when a shelter requests transport.
              </p>
            </div>
          )}

          {/* Past Completed Deliveries */}
          {completedDeliveries.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-on-surface mb-3">Completed Transport Runs</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedDeliveries.map((del) => (
                  <div key={del.id} className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 text-xs">
                    <span className="text-secondary font-bold flex items-center gap-1 mb-1">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      Delivered Successfully
                    </span>
                    <p className="font-bold text-on-surface">{del.listingTitle}</p>
                    <p className="text-on-surface-variant mt-1">{del.distanceKm} km completed</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}

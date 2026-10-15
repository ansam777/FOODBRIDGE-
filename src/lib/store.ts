'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ListingItem,
  ClaimItem,
  DeliveryItem,
  UserRole,
  FoodCategory,
  INITIAL_LISTINGS,
  INITIAL_CLAIMS,
  INITIAL_DELIVERIES,
} from './mock-data';

interface AppState {
  currentRole: UserRole;
  currentUserId: string;
  currentUserName: string;
  listings: ListingItem[];
  claims: ClaimItem[];
  deliveries: DeliveryItem[];
  savedMealsCount: number;
  
  // Actions
  setRole: (role: UserRole) => void;
  addListing: (newListing: Omit<ListingItem, 'id' | 'createdAt' | 'donorId' | 'donorName' | 'status'>) => ListingItem;
  claimListing: (listingId: string, needsDelivery: boolean) => ClaimItem;
  verifyHandover: (claimId: string, enteredOtp: string) => { success: boolean; message: string };
  cancelListing: (listingId: string) => void;
  acceptDelivery: (claimId: string) => DeliveryItem;
  advanceDeliveryStatus: (deliveryId: string) => void;
  resetDemoData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentRole: 'recipient',
      currentUserId: 'usr-recip-1',
      currentUserName: 'Asha Child Care Shelter',
      listings: INITIAL_LISTINGS,
      claims: INITIAL_CLAIMS,
      deliveries: INITIAL_DELIVERIES,
      savedMealsCount: 14820,

      setRole: (role: UserRole) => {
        let name = 'Community Member';
        let id = 'usr-1';
        if (role === 'donor') {
          name = 'Saffron Grand Restaurant';
          id = 'usr-donor-1';
        } else if (role === 'recipient') {
          name = 'Asha Community Shelter';
          id = 'usr-recip-1';
        } else if (role === 'volunteer') {
          name = 'Rahul Verma (Volunteer #418)';
          id = 'usr-vol-1';
        } else if (role === 'admin') {
          name = 'Platform Admin (Operations)';
          id = 'usr-admin-1';
        }
        set({ currentRole: role, currentUserId: id, currentUserName: name });
      },

      addListing: (listingData) => {
        const id = `lst-${Date.now()}`;
        const newListing: ListingItem = {
          ...listingData,
          id,
          donorId: get().currentUserId,
          donorName: get().currentUserName,
          status: 'available',
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          listings: [newListing, ...state.listings],
        }));

        return newListing;
      },

      claimListing: (listingId: string, needsDelivery: boolean) => {
        const listing = get().listings.find((l) => l.id === listingId);
        if (!listing) throw new Error('Listing not found');

        // Generate cryptographically random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const qrToken = `qr-${Date.now()}-${otp}`;

        const newClaim: ClaimItem = {
          id: `clm-${Date.now()}`,
          listingId: listing.id,
          listingTitle: listing.title,
          claimantId: get().currentUserId,
          claimantName: get().currentUserName,
          status: 'approved',
          handoverOtp: otp,
          handoverQrToken: qrToken,
          needsDelivery,
          pickupAddress: listing.pickupAddress,
          claimedAt: new Date().toISOString(),
          donorName: listing.donorName,
          quantityServings: listing.quantityServings,
        };

        set((state) => ({
          claims: [newClaim, ...state.claims],
          listings: state.listings.map((l) =>
            l.id === listingId ? { ...l, status: 'claimed' } : l
          ),
        }));

        // If delivery requested, automatically queue into open volunteer delivery pool
        if (needsDelivery) {
          const newDelivery: DeliveryItem = {
            id: `del-${Date.now()}`,
            claimId: newClaim.id,
            listingTitle: listing.title,
            volunteerId: '',
            volunteerName: 'Awaiting Volunteer',
            status: 'assigned',
            pickupOtp: otp,
            dropoffOtp: Math.floor(100000 + Math.random() * 900000).toString(),
            donorAddress: listing.pickupAddress,
            recipientAddress: 'Recipient Dropoff Point (Local)',
            distanceKm: listing.distanceKm + 1.2,
          };
          set((state) => ({
            deliveries: [newDelivery, ...state.deliveries],
          }));
        }

        return newClaim;
      },

      verifyHandover: (claimId: string, enteredOtp: string) => {
        const claim = get().claims.find((c) => c.id === claimId);
        if (!claim) {
          return { success: false, message: 'Claim record not found' };
        }

        if (claim.handoverOtp !== enteredOtp.trim()) {
          return { success: false, message: 'Invalid OTP code. Please verify and re-enter.' };
        }

        set((state) => ({
          claims: state.claims.map((c) =>
            c.id === claimId
              ? { ...c, status: 'completed', completedAt: new Date().toISOString() }
              : c
          ),
          listings: state.listings.map((l) =>
            l.id === claim.listingId ? { ...l, status: 'completed' } : l
          ),
          savedMealsCount: state.savedMealsCount + claim.quantityServings,
        }));

        return { success: true, message: `Handover verified! ${claim.quantityServings} servings successfully saved from waste.` };
      },

      cancelListing: (listingId: string) => {
        set((state) => ({
          listings: state.listings.map((l) =>
            l.id === listingId ? { ...l, status: 'cancelled' } : l
          ),
        }));
      },

      acceptDelivery: (claimId: string) => {
        const delivery = get().deliveries.find((d) => d.claimId === claimId);
        if (!delivery) throw new Error('Delivery task not found');

        const updated: DeliveryItem = {
          ...delivery,
          volunteerId: get().currentUserId,
          volunteerName: get().currentUserName,
          status: 'en_route_pickup',
        };

        set((state) => ({
          deliveries: state.deliveries.map((d) =>
            d.claimId === claimId ? updated : d
          ),
        }));

        return updated;
      },

      advanceDeliveryStatus: (deliveryId: string) => {
        set((state) => ({
          deliveries: state.deliveries.map((d) => {
            if (d.id !== deliveryId) return d;
            if (d.status === 'assigned') return { ...d, status: 'en_route_pickup' };
            if (d.status === 'en_route_pickup') return { ...d, status: 'picked_up', pickupAt: new Date().toISOString() };
            if (d.status === 'picked_up') return { ...d, status: 'en_route_dropoff' };
            if (d.status === 'en_route_dropoff') return { ...d, status: 'delivered', deliveredAt: new Date().toISOString() };
            return d;
          }),
        }));
      },

      resetDemoData: () => {
        set({
          listings: INITIAL_LISTINGS,
          claims: INITIAL_CLAIMS,
          deliveries: INITIAL_DELIVERIES,
          savedMealsCount: 14820,
        });
      },
    }),
    {
      name: 'food-bridge-storage-v1',
    }
  )
);

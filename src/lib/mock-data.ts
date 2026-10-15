/**
 * Food Bridge Data Store & Mock Data Provider
 * Provides realistic initial community food surplus listings, active claims,
 * and delivery logistics with localStorage persistence for local testing.
 */

export type UserRole = 'donor' | 'recipient' | 'volunteer' | 'admin';
export type FoodCategory = 'cooked_meal' | 'raw_ingredients' | 'packaged' | 'bakery' | 'beverages' | 'other';
export type ListingStatus = 'available' | 'claimed' | 'in_transit' | 'completed' | 'expired' | 'cancelled';
export type ClaimStatus = 'pending' | 'approved' | 'picked_up' | 'completed' | 'cancelled' | 'expired';
export type DeliveryStatus = 'assigned' | 'en_route_pickup' | 'picked_up' | 'en_route_dropoff' | 'delivered' | 'cancelled';

export interface ListingItem {
  id: string;
  donorId: string;
  donorName: string;
  donorType: string;
  title: string;
  description: string;
  category: FoodCategory;
  quantityServings: number;
  dietaryTags: string[];
  photoUrls: string[];
  pickupAddress: string;
  pickupInstructions?: string;
  lat: number;
  lng: number;
  distanceKm: number;
  preparedAt: string;
  expiresAt: string;
  status: ListingStatus;
  isDeliveryAvailable: boolean;
  createdAt: string;
}

export interface ClaimItem {
  id: string;
  listingId: string;
  listingTitle: string;
  claimantId: string;
  claimantName: string;
  status: ClaimStatus;
  handoverOtp: string;
  handoverQrToken: string;
  needsDelivery: boolean;
  pickupAddress: string;
  claimedAt: string;
  completedAt?: string;
  donorName: string;
  quantityServings: number;
}

export interface DeliveryItem {
  id: string;
  claimId: string;
  listingTitle: string;
  volunteerId: string;
  volunteerName: string;
  status: DeliveryStatus;
  pickupOtp: string;
  dropoffOtp: string;
  donorAddress: string;
  recipientAddress: string;
  distanceKm: number;
  pickupAt?: string;
  deliveredAt?: string;
}

export const INITIAL_LISTINGS: ListingItem[] = [
  {
    id: 'lst-1',
    donorId: 'usr-donor-1',
    donorName: 'Saffron Grand Restaurant & Banquets',
    donorType: 'Restaurant',
    title: '45 Servings of Fresh Vegetable Biryani & Raita',
    description: 'Surplus from afternoon banquet event. Kept in food-grade thermal containers at 65°C+. Packaged with sterile spoons.',
    category: 'cooked_meal',
    quantityServings: 45,
    dietaryTags: ['Vegetarian', 'Halal'],
    photoUrls: [
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    ],
    pickupAddress: '42 Brigade Road, Central District',
    pickupInstructions: 'Pick up via Kitchen Back Door (Gate 3). Ask for Chef Anand.',
    lat: 12.9716,
    lng: 77.5946,
    distanceKm: 1.8,
    preparedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    status: 'available',
    isDeliveryAvailable: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lst-2',
    donorId: 'usr-donor-2',
    donorName: 'Artisan Oven Bakehouse',
    donorType: 'Bakery',
    title: '30 Assorted Sourdough Loaves & Croissants',
    description: 'Freshly baked this morning. Sealed in clean kraft paper bakery bags, ready for distribution.',
    category: 'bakery',
    quantityServings: 30,
    dietaryTags: ['Vegetarian'],
    photoUrls: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
    ],
    pickupAddress: '15 Indiranagar 100ft Road',
    pickupInstructions: 'Ring bell at side alley entrance.',
    lat: 12.9784,
    lng: 77.6408,
    distanceKm: 2.6,
    preparedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    status: 'available',
    isDeliveryAvailable: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lst-3',
    donorId: 'usr-donor-3',
    donorName: 'Harvest Greens Wholesale Market',
    donorType: 'Wholesaler',
    title: '50 kg Crisp Farm Fresh Apples, Oranges & Carrots',
    description: 'Grade-A surplus produce from morning wholesale arrival. Sorted and packed into 5 clean crates.',
    category: 'raw_ingredients',
    quantityServings: 75,
    dietaryTags: ['Vegan', 'Gluten-Free'],
    photoUrls: [
      'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&auto=format&fit=crop&q=80',
    ],
    pickupAddress: 'Market Yard Gate B, South Ring',
    pickupInstructions: 'Loading bay 4. Loading assistance provided.',
    lat: 12.9279,
    lng: 77.6271,
    distanceKm: 4.2,
    preparedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    status: 'available',
    isDeliveryAvailable: true,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lst-4',
    donorId: 'usr-donor-4',
    donorName: 'Corporate Tech Park Bistro',
    donorType: 'Cafeteria',
    title: '60 Portions of Steamed Basmati Rice & Dal Makhani',
    description: 'Untouched executive buffet batch. Packaged in sanitized aluminum foil trays.',
    category: 'cooked_meal',
    quantityServings: 60,
    dietaryTags: ['Vegetarian', 'Gluten-Free'],
    photoUrls: [
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    ],
    pickupAddress: 'Block 4, Outer Ring Road Tech Campus',
    pickupInstructions: 'Security pass arranged at Visitor Desk. Tell them "Food Bridge Donation".',
    lat: 12.9352,
    lng: 77.6946,
    distanceKm: 5.7,
    preparedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    status: 'available',
    isDeliveryAvailable: true,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lst-5',
    donorId: 'usr-donor-5',
    donorName: 'Pure Squeeze Juice Bar',
    donorType: 'Cafe',
    title: '40 Bottled Cold-Pressed Citrus & Berry Juices (300ml)',
    description: 'Cold-pressed today, kept chilled at 4°C. 100% natural with no preservatives.',
    category: 'beverages',
    quantityServings: 40,
    dietaryTags: ['Vegan', 'Gluten-Free'],
    photoUrls: [
      'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&auto=format&fit=crop&q=80',
    ],
    pickupAddress: '88 Church Street Promenade',
    pickupInstructions: 'Counter pickup. Chilled cooler bags recommended.',
    lat: 12.9752,
    lng: 77.6012,
    distanceKm: 2.1,
    preparedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString(),
    status: 'available',
    isDeliveryAvailable: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lst-6',
    donorId: 'usr-donor-1',
    donorName: 'Saffron Grand Restaurant & Banquets',
    donorType: 'Restaurant',
    title: '35 Gourmet Pasta Bowls & Garlic Baguettes',
    description: 'Penne Arrabiata and Creamy Alfredo pasta, stored in heated chafers.',
    category: 'cooked_meal',
    quantityServings: 35,
    dietaryTags: ['Vegetarian'],
    photoUrls: [
      'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=800&auto=format&fit=crop&q=80',
    ],
    pickupAddress: '42 Brigade Road, Central District',
    pickupInstructions: 'Kitchen door.',
    lat: 12.9716,
    lng: 77.5946,
    distanceKm: 1.8,
    preparedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    status: 'claimed',
    isDeliveryAvailable: true,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

export const INITIAL_CLAIMS: ClaimItem[] = [
  {
    id: 'clm-1',
    listingId: 'lst-6',
    listingTitle: '35 Gourmet Pasta Bowls & Garlic Baguettes',
    claimantId: 'usr-recip-1',
    claimantName: 'Asha Child Care Home & Shelter',
    status: 'approved',
    handoverOtp: '648291',
    handoverQrToken: 'token-uuid-648291-handover',
    needsDelivery: true,
    pickupAddress: '42 Brigade Road, Central District',
    claimedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    donorName: 'Saffron Grand Restaurant & Banquets',
    quantityServings: 35,
  },
];

export const INITIAL_DELIVERIES: DeliveryItem[] = [
  {
    id: 'del-1',
    claimId: 'clm-1',
    listingTitle: '35 Gourmet Pasta Bowls & Garlic Baguettes',
    volunteerId: 'usr-vol-1',
    volunteerName: 'Rahul Verma (Volunteer #418)',
    status: 'en_route_pickup',
    pickupOtp: '648291',
    dropoffOtp: '912834',
    donorAddress: '42 Brigade Road, Central District',
    recipientAddress: '19 Hosur Main Road, Shelter Home',
    distanceKm: 3.4,
    pickupAt: undefined,
  },
];

export const CATEGORY_LABELS: Record<FoodCategory, { label: string; icon: string }> = {
  cooked_meal: { label: 'Cooked Meals', icon: '🍲' },
  raw_ingredients: { label: 'Raw Produce', icon: '🥦' },
  packaged: { label: 'Packaged Goods', icon: '📦' },
  bakery: { label: 'Bakery & Bread', icon: '🥖' },
  beverages: { label: 'Beverages', icon: '🧃' },
  other: { label: 'Other Groceries', icon: '🍱' },
};

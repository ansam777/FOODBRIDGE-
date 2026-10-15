/**
 * Food Bridge Database Types
 *
 * TypeScript definitions mirroring the PostgreSQL schema and PostGIS extensions
 * configured in Supabase. Compatible with @supabase/supabase-js and @supabase/ssr.
 *
 * All types strictly use `type` aliases rather than interfaces for consistency
 * with Supabase client patterns.
 *
 * @version 1.0.0
 * @author Food Bridge Architecture Team
 */

// ============================================================================
// 1. Enum Types Mirroring PostgreSQL Enums
// ============================================================================

/**
 * User roles within the Food Bridge ecosystem.
 * - `donor`: Restaurants, caterers, households posting surplus food
 * - `recipient`: NGOs, shelters, community kitchens, individuals in need
 * - `volunteer`: Community couriers handling pickup and dropoff logistics
 * - `admin`: Platform moderators and operators
 */
export type UserRole = 'donor' | 'recipient' | 'volunteer' | 'admin';

/**
 * Predefined food categories for surplus food listings.
 * - `cooked_meal`: Freshly prepared meals ready for consumption
 * - `raw_ingredients`: Uncooked vegetables, produce, or groceries
 * - `packaged`: Factory sealed or pre-packaged goods
 * - `bakery`: Bread, pastries, and baked items
 * - `beverages`: Bottled drinks, juices, or dairy beverages
 * - `other`: Miscellaneous edible items
 */
export type FoodCategory =
  | 'cooked_meal'
  | 'raw_ingredients'
  | 'packaged'
  | 'bakery'
  | 'beverages'
  | 'other';

/**
 * Status of a surplus food listing throughout its redistribution cycle.
 * - `available`: Open for claiming by recipients
 * - `claimed`: Reserved by a recipient; pickup or dispatch pending
 * - `in_transit`: Handed over to volunteer; on the way to recipient
 * - `completed`: Confirmed delivered and handed over
 * - `expired`: Surpassed safe consumption deadline before handover
 * - `cancelled`: Revoked by the donor prior to handover
 */
export type ListingStatus =
  | 'available'
  | 'claimed'
  | 'in_transit'
  | 'completed'
  | 'expired'
  | 'cancelled';

/**
 * Status of a recipient's claim on an active food listing.
 * - `pending`: Initiated by claimant; awaiting approval or pickup scheduling
 * - `approved`: Confirmed by donor
 * - `picked_up`: Retrieved from donor (for volunteer delivery flow)
 * - `completed`: Handover completed and verified via OTP/QR
 * - `cancelled`: Cancelled by claimant or donor
 * - `expired`: Associated listing expired before handover
 */
export type ClaimStatus =
  | 'pending'
  | 'approved'
  | 'picked_up'
  | 'completed'
  | 'cancelled'
  | 'expired';

/**
 * Lifecycle status of a volunteer delivery assignment.
 * - `assigned`: Volunteer matched to claim; awaiting route start
 * - `en_route_pickup`: Volunteer actively traveling to donor location
 * - `picked_up`: Volunteer verified pickup OTP with donor; transport in progress
 * - `en_route_dropoff`: Volunteer traveling towards recipient address
 * - `delivered`: Recipient verified dropoff OTP; handover complete
 * - `cancelled`: Delivery cancelled or volunteer aborted
 */
export type DeliveryStatus =
  | 'assigned'
  | 'en_route_pickup'
  | 'picked_up'
  | 'en_route_dropoff'
  | 'delivered'
  | 'cancelled';

/**
 * Discriminator for in-app and push notifications.
 * - `claim_received`: Donor notified that listing has been claimed
 * - `claim_approved`: Recipient notified that claim has been approved
 * - `delivery_assigned`: Notification for volunteer assignment
 * - `handover_complete`: Notification confirming successful handover
 * - `listing_expired`: Notification that listing expired without claim
 * - `system`: Administrative or platform announcements
 */
export type NotificationType =
  | 'claim_received'
  | 'claim_approved'
  | 'delivery_assigned'
  | 'handover_complete'
  | 'listing_expired'
  | 'system';

// ============================================================================
// 2. Spatial & Auxiliary Types
// ============================================================================

/**
 * GeoJSON Point type for PostGIS geography(Point, 4326) columns.
 */
export type GeoPoint = {
  /** Geometry type */
  type: 'Point';
  /** Coordinates in [longitude, latitude] format (WGS 84 / EPSG:4326) */
  coordinates: [longitude: number, latitude: number];
};

/**
 * Notification channel preference configuration for a user profile.
 */
export type NotificationPrefs = {
  /** Push notifications enabled (FCM / Web Push) */
  push: boolean;
  /** Email notifications enabled */
  email: boolean;
  /** SMS text notifications enabled */
  sms: boolean;
};

// ============================================================================
// 3. Database Row Types
// ============================================================================

/**
 * Profile record extending Supabase auth.users.
 */
export type Profile = {
  /** Primary Key matching auth.users UID */
  id: string;
  /** Contact email address synced from auth */
  email: string;
  /** Display name of the individual or organisation */
  full_name: string;
  /** Phone number for SMS and OTP notifications */
  phone: string | null;
  /** User role determining authorization and views */
  role: UserRole;
  /** Supabase Storage URL for profile avatar */
  avatar_url: string | null;
  /** Street address line */
  address_line: string | null;
  /** City name */
  city: string | null;
  /** State or province name */
  state: string | null;
  /** PostGIS Point representing base geographic coordinates */
  location: GeoPoint | null;
  /** Administrative verification status for NGOs */
  is_verified_ngo: boolean;
  /** Whether the profile account is active */
  is_active: boolean;
  /** User notification channel preferences stored as JSONB */
  notification_prefs: NotificationPrefs;
  /** ISO 8601 timestamp of user agreeing to food safety disclaimer */
  accepted_food_safety_disclaimer_at?: string | null;
  /** ISO 8601 timestamp of profile creation */
  created_at: string;
  /** ISO 8601 timestamp of last profile update */
  updated_at: string;
  /** ISO 8601 timestamp for soft-deletion (null if active) */
  deleted_at: string | null;
};

/**
 * Listing record representing surplus food offered by a donor.
 */
export type Listing = {
  /** Primary Key UUID */
  id: string;
  /** Foreign key referencing donor's profiles.id */
  donor_id: string;
  /** Food title (max 120 characters) */
  title: string;
  /** Detailed description and allergen information (max 500 characters) */
  description: string | null;
  /** Food category classification */
  category: FoodCategory;
  /** Number of servings available (CHECK > 0) */
  quantity_servings: number;
  /** Dietary classifications (e.g., 'vegetarian', 'halal', 'vegan') */
  dietary_tags: string[];
  /** Supabase Storage URLs of food photographs */
  photo_urls: string[];
  /** Human-readable pickup street address */
  pickup_address: string;
  /** Specific instructions for collecting food */
  pickup_instructions: string | null;
  /** PostGIS Point coordinates of pickup location */
  location: GeoPoint;
  /** ISO 8601 timestamp when food was prepared */
  prepared_at: string;
  /** ISO 8601 timestamp when listing expires */
  expires_at: string;
  /** Current state of listing */
  status: ListingStatus;
  /** Whether volunteer delivery pickup is enabled */
  is_delivery_available: boolean;
  /** ISO 8601 timestamp of creation */
  created_at: string;
  /** ISO 8601 timestamp of last update */
  updated_at: string;
  /** ISO 8601 timestamp for soft-deletion (null if active) */
  deleted_at: string | null;
};

/**
 * Claim record representing a recipient claiming a food listing.
 */
export type Claim = {
  /** Primary Key UUID */
  id: string;
  /** Foreign key referencing the listings.id */
  listing_id: string;
  /** Foreign key referencing the recipient claimant profiles.id */
  claimant_id: string;
  /** Current claim lifecycle status */
  status: ClaimStatus;
  /** 6-digit cryptographic verification code for handover */
  handover_otp: string;
  /** Secure UUID token encoded in recipient QR code */
  handover_qr_token: string;
  /** ISO 8601 timestamp when claim was created */
  claimed_at: string;
  /** ISO 8601 timestamp when handover verification completed */
  completed_at: string | null;
  /** ISO 8601 timestamp if claim was cancelled */
  cancelled_at: string | null;
  /** Reason provided for claim cancellation */
  cancellation_reason: string | null;
  /** Whether recipient requested volunteer delivery */
  needs_delivery: boolean;
  /** ISO 8601 timestamp of claim creation */
  created_at: string;
  /** ISO 8601 timestamp of last update */
  updated_at: string;
};

/**
 * Delivery record tracking volunteer logistics from donor to recipient.
 */
export type Delivery = {
  /** Primary Key UUID */
  id: string;
  /** Foreign key referencing claims.id */
  claim_id: string;
  /** Foreign key referencing volunteer's profiles.id */
  volunteer_id: string;
  /** Current delivery route status */
  status: DeliveryStatus;
  /** 6-digit verification code presented by volunteer to donor at pickup */
  pickup_otp: string;
  /** 6-digit verification code presented by volunteer to recipient at dropoff */
  dropoff_otp: string;
  /** ISO 8601 timestamp of physical food pickup */
  pickup_at: string | null;
  /** ISO 8601 timestamp of physical food delivery */
  delivered_at: string | null;
  /** Traveled distance in kilometers */
  distance_km: number | null;
  /** Encoded polyline path for map replay */
  route_polyline: string | null;
  /** Notes logged by volunteer */
  notes: string | null;
  /** ISO 8601 timestamp of delivery record creation */
  created_at: string;
  /** ISO 8601 timestamp of last update */
  updated_at: string;
};

/**
 * Notification record logged for a user.
 */
export type Notification = {
  /** Primary Key UUID */
  id: string;
  /** Foreign key referencing recipient profiles.id */
  user_id: string;
  /** Notification type category */
  type: NotificationType;
  /** Title header text */
  title: string;
  /** Message body */
  body: string;
  /** JSON payload with entity references for deep linking */
  data: Record<string, unknown> | null;
  /** Read status flag */
  is_read: boolean;
  /** ISO 8601 timestamp of notification creation */
  created_at: string;
};

/**
 * Post-handover rating and review record.
 */
export type Feedback = {
  /** Primary Key UUID */
  id: string;
  /** Foreign key referencing claims.id */
  claim_id: string;
  /** Foreign key referencing reviewer profiles.id */
  from_user_id: string;
  /** Foreign key referencing reviewed profiles.id */
  to_user_id: string;
  /** Rating score between 1 and 5 */
  rating: number;
  /** Optional review text commentary (max 500 characters) */
  comment: string | null;
  /** ISO 8601 timestamp of feedback submission */
  created_at: string;
};

/**
 * Immutable audit log record for compliance and security auditing.
 */
export type AuditLog = {
  /** Auto-incrementing primary key identifier */
  id: number;
  /** Actor profile ID (null for automated system events) */
  actor_id: string | null;
  /** Action executed (e.g., 'listing.created', 'handover.verified') */
  action: string;
  /** Target entity domain table */
  entity_type: string;
  /** Target entity UUID */
  entity_id: string;
  /** JSONB metadata capturing changes, client IP, or user agent */
  metadata: Record<string, unknown> | null;
  /** ISO 8601 timestamp of audit event */
  created_at: string;
};

// ============================================================================
// 4. Insert & Update Partial Types
// ============================================================================

/**
 * Insert payload type for creating a profile record.
 */
export type ProfileInsert = {
  /** Primary Key matching auth.users UID */
  id: string;
  /** Contact email */
  email: string;
  /** Full name */
  full_name: string;
  /** Phone number */
  phone?: string | null;
  /** Assigned role */
  role: UserRole;
  /** Avatar image URL */
  avatar_url?: string | null;
  /** Street address line */
  address_line?: string | null;
  /** City name */
  city?: string | null;
  /** State or province */
  state?: string | null;
  /** PostGIS Point location */
  location?: GeoPoint | null;
  /** NGO verified status (default: false) */
  is_verified_ngo?: boolean;
  /** Active status (default: true) */
  is_active?: boolean;
  /** Channel notification preferences */
  notification_prefs?: NotificationPrefs;
  /** Food safety disclaimer acknowledgement timestamp */
  accepted_food_safety_disclaimer_at?: string | null;
  /** Creation timestamp (default: now()) */
  created_at?: string;
  /** Update timestamp (default: now()) */
  updated_at?: string;
  /** Soft deletion timestamp */
  deleted_at?: string | null;
};

/**
 * Update payload type for modifying an existing profile record.
 */
export type ProfileUpdate = {
  /** Profile ID */
  id?: string;
  /** Contact email */
  email?: string;
  /** Full name */
  full_name?: string;
  /** Phone number */
  phone?: string | null;
  /** Assigned role */
  role?: UserRole;
  /** Avatar image URL */
  avatar_url?: string | null;
  /** Street address line */
  address_line?: string | null;
  /** City name */
  city?: string | null;
  /** State or province */
  state?: string | null;
  /** PostGIS Point location */
  location?: GeoPoint | null;
  /** NGO verified status */
  is_verified_ngo?: boolean;
  /** Active status */
  is_active?: boolean;
  /** Channel notification preferences */
  notification_prefs?: NotificationPrefs;
  /** Food safety disclaimer acknowledgement timestamp */
  accepted_food_safety_disclaimer_at?: string | null;
  /** Creation timestamp */
  created_at?: string;
  /** Update timestamp */
  updated_at?: string;
  /** Soft deletion timestamp */
  deleted_at?: string | null;
};

/**
 * Insert payload type for publishing a new surplus food listing.
 */
export type ListingInsert = {
  /** Optional UUID (default: gen_random_uuid()) */
  id?: string;
  /** Donor profile ID */
  donor_id: string;
  /** Food listing title */
  title: string;
  /** Optional description and allergens */
  description?: string | null;
  /** Food category */
  category: FoodCategory;
  /** Approximate number of servings */
  quantity_servings: number;
  /** Dietary classifications (default: []) */
  dietary_tags?: string[];
  /** Photograph URLs */
  photo_urls: string[];
  /** Pickup street address */
  pickup_address: string;
  /** Specific pickup instructions */
  pickup_instructions?: string | null;
  /** PostGIS Point pickup coordinates */
  location: GeoPoint;
  /** Preparation timestamp */
  prepared_at: string;
  /** Expiration timestamp */
  expires_at: string;
  /** Initial listing status (default: 'available') */
  status?: ListingStatus;
  /** Volunteer delivery toggle (default: false) */
  is_delivery_available?: boolean;
  /** Creation timestamp */
  created_at?: string;
  /** Update timestamp */
  updated_at?: string;
  /** Soft deletion timestamp */
  deleted_at?: string | null;
};

/**
 * Update payload type for editing an existing surplus food listing.
 */
export type ListingUpdate = {
  /** Listing ID */
  id?: string;
  /** Donor profile ID */
  donor_id?: string;
  /** Food listing title */
  title?: string;
  /** Description and allergens */
  description?: string | null;
  /** Food category */
  category?: FoodCategory;
  /** Approximate number of servings */
  quantity_servings?: number;
  /** Dietary classifications */
  dietary_tags?: string[];
  /** Photograph URLs */
  photo_urls?: string[];
  /** Pickup street address */
  pickup_address?: string;
  /** Specific pickup instructions */
  pickup_instructions?: string | null;
  /** PostGIS Point pickup coordinates */
  location?: GeoPoint;
  /** Preparation timestamp */
  prepared_at?: string;
  /** Expiration timestamp */
  expires_at?: string;
  /** Current listing status */
  status?: ListingStatus;
  /** Volunteer delivery toggle */
  is_delivery_available?: boolean;
  /** Creation timestamp */
  created_at?: string;
  /** Update timestamp */
  updated_at?: string;
  /** Soft deletion timestamp */
  deleted_at?: string | null;
};

/**
 * Insert payload type for claiming a food listing.
 */
export type ClaimInsert = {
  /** Optional claim UUID (default: gen_random_uuid()) */
  id?: string;
  /** Listing ID */
  listing_id: string;
  /** Recipient claimant profile ID */
  claimant_id: string;
  /** Initial claim status (default: 'pending') */
  status?: ClaimStatus;
  /** 6-digit handover OTP code */
  handover_otp: string;
  /** Secure QR token UUID (default: gen_random_uuid()) */
  handover_qr_token?: string;
  /** Claim timestamp (default: now()) */
  claimed_at?: string;
  /** Handover completion timestamp */
  completed_at?: string | null;
  /** Cancellation timestamp */
  cancelled_at?: string | null;
  /** Reason for cancellation */
  cancellation_reason?: string | null;
  /** Delivery assistance flag (default: false) */
  needs_delivery?: boolean;
  /** Creation timestamp */
  created_at?: string;
  /** Update timestamp */
  updated_at?: string;
};

/**
 * Update payload type for modifying an existing claim.
 */
export type ClaimUpdate = {
  /** Claim UUID */
  id?: string;
  /** Listing ID */
  listing_id?: string;
  /** Recipient claimant profile ID */
  claimant_id?: string;
  /** Updated claim status */
  status?: ClaimStatus;
  /** Handover OTP code */
  handover_otp?: string;
  /** QR token UUID */
  handover_qr_token?: string;
  /** Claim timestamp */
  claimed_at?: string;
  /** Handover completion timestamp */
  completed_at?: string | null;
  /** Cancellation timestamp */
  cancelled_at?: string | null;
  /** Reason for cancellation */
  cancellation_reason?: string | null;
  /** Delivery assistance flag */
  needs_delivery?: boolean;
  /** Creation timestamp */
  created_at?: string;
  /** Update timestamp */
  updated_at?: string;
};

/**
 * Insert payload type for assigning a volunteer delivery.
 */
export type DeliveryInsert = {
  /** Optional delivery task UUID (default: gen_random_uuid()) */
  id?: string;
  /** Associated claim ID */
  claim_id: string;
  /** Assigned volunteer profile ID */
  volunteer_id: string;
  /** Initial delivery status (default: 'assigned') */
  status?: DeliveryStatus;
  /** Pickup verification code for donor */
  pickup_otp: string;
  /** Dropoff verification code for recipient */
  dropoff_otp: string;
  /** Actual pickup timestamp */
  pickup_at?: string | null;
  /** Actual delivery timestamp */
  delivered_at?: string | null;
  /** Distance in kilometers */
  distance_km?: number | null;
  /** Encoded polyline path */
  route_polyline?: string | null;
  /** Delivery notes */
  notes?: string | null;
  /** Creation timestamp */
  created_at?: string;
  /** Update timestamp */
  updated_at?: string;
};

/**
 * Update payload type for updating a volunteer delivery task.
 */
export type DeliveryUpdate = {
  /** Delivery task UUID */
  id?: string;
  /** Associated claim ID */
  claim_id?: string;
  /** Assigned volunteer profile ID */
  volunteer_id?: string;
  /** Updated delivery status */
  status?: DeliveryStatus;
  /** Pickup verification code */
  pickup_otp?: string;
  /** Dropoff verification code */
  dropoff_otp?: string;
  /** Actual pickup timestamp */
  pickup_at?: string | null;
  /** Actual delivery timestamp */
  delivered_at?: string | null;
  /** Distance in kilometers */
  distance_km?: number | null;
  /** Encoded polyline path */
  route_polyline?: string | null;
  /** Delivery notes */
  notes?: string | null;
  /** Creation timestamp */
  created_at?: string;
  /** Update timestamp */
  updated_at?: string;
};

/**
 * Insert payload type for submitting feedback post-handover.
 */
export type FeedbackInsert = {
  /** Optional feedback UUID */
  id?: string;
  /** Associated completed claim ID */
  claim_id: string;
  /** Reviewer user profile ID */
  from_user_id: string;
  /** Reviewed user profile ID */
  to_user_id: string;
  /** Numerical score between 1 and 5 */
  rating: number;
  /** Optional commentary (max 500 characters) */
  comment?: string | null;
  /** Submission timestamp */
  created_at?: string;
};

// ============================================================================
// 5. Supabase Database Type Structure
// ============================================================================

/**
 * Supabase Database schema definition conforming to official @supabase/supabase-js typing.
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      listings: {
        Row: Listing;
        Insert: ListingInsert;
        Update: ListingUpdate;
      };
      claims: {
        Row: Claim;
        Insert: ClaimInsert;
        Update: ClaimUpdate;
      };
      deliveries: {
        Row: Delivery;
        Insert: DeliveryInsert;
        Update: DeliveryUpdate;
      };
      notifications: {
        Row: Notification;
        Insert: never;
        Update: {
          /** Update notification read status */
          is_read: boolean;
        };
      };
      feedback: {
        Row: Feedback;
        Insert: FeedbackInsert;
        Update: never;
      };
      audit_log: {
        Row: AuditLog;
        Insert: never;
        Update: never;
      };
    };
    Enums: {
      user_role: UserRole;
      food_category: FoodCategory;
      listing_status: ListingStatus;
      claim_status: ClaimStatus;
      delivery_status: DeliveryStatus;
      notification_type: NotificationType;
    };
  };
};

// ============================================================================
// 6. Generic Type Extraction Helpers
// ============================================================================

/**
 * Convenience helper to extract the Row type for any table name in Database.
 */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

/**
 * Convenience helper to extract the Insert type for any table name in Database.
 */
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

/**
 * Convenience helper to extract the Update type for any table name in Database.
 */
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

/**
 * Convenience helper to extract the Enum type for any enum name in Database.
 */
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

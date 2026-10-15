-- ============================================================================
-- Migration: 00002_tables_and_indexes.sql
-- Description: Core tables, constraints, indexes, and triggers
-- Project: Food Bridge Phase 1
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Profiles Table
-- ----------------------------------------------------------------------------
-- Extends Supabase auth.users with application-specific user profile metadata
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL UNIQUE,
    full_name text NOT NULL DEFAULT '',
    phone text UNIQUE,
    role public.user_role NOT NULL DEFAULT 'donor',
    avatar_url text,
    address_line text,
    city text,
    state text,
    location geography(POINT, 4326),
    is_verified_ngo boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,
    notification_prefs jsonb NOT NULL DEFAULT '{"push": true, "email": true, "sms": false}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth.users with roles and location';
COMMENT ON COLUMN public.profiles.location IS 'Geographic coordinates (Point, WGS84 SRID 4326) for distance-based discovery';
COMMENT ON COLUMN public.profiles.is_verified_ngo IS 'Verification flag for non-profit recipient organizations';

-- ----------------------------------------------------------------------------
-- 2. Listings Table
-- ----------------------------------------------------------------------------
-- Surplus food posts made by donors (restaurants, bakeries, individuals, caterers)
CREATE TABLE IF NOT EXISTS public.listings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL CHECK (char_length(title) BETWEEN 5 AND 120),
    description text CHECK (char_length(description) <= 500),
    category public.food_category NOT NULL,
    quantity_servings integer NOT NULL CHECK (quantity_servings > 0),
    dietary_tags text[] NOT NULL DEFAULT '{}',
    photo_urls text[] NOT NULL CHECK (array_length(photo_urls, 1) >= 1),
    pickup_address text NOT NULL,
    pickup_instructions text,
    location geography(POINT, 4326) NOT NULL,
    prepared_at timestamptz NOT NULL,
    expires_at timestamptz NOT NULL,
    status public.listing_status NOT NULL DEFAULT 'available',
    is_delivery_available boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    CONSTRAINT check_expiration_after_prepared CHECK (expires_at > prepared_at)
);

COMMENT ON TABLE public.listings IS 'Food donation listings with spatial pickup coordinates and expiration windows';
COMMENT ON COLUMN public.listings.photo_urls IS 'Array of storage URLs representing photos of the food donation';

-- ----------------------------------------------------------------------------
-- 3. Claims Table
-- ----------------------------------------------------------------------------
-- Claims placed on available food listings by registered recipients
CREATE TABLE IF NOT EXISTS public.claims (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    claimant_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status public.claim_status NOT NULL DEFAULT 'pending',
    handover_otp char(6) NOT NULL,
    handover_qr_token uuid NOT NULL DEFAULT gen_random_uuid(),
    claimed_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    cancelled_at timestamptz,
    cancellation_reason text,
    needs_delivery boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.claims IS 'Recipient claims on listings with dual-factor verification (OTP & QR)';
COMMENT ON COLUMN public.claims.handover_otp IS '6-digit OTP code presented at pickup/dropoff';

-- ----------------------------------------------------------------------------
-- 4. Deliveries Table
-- ----------------------------------------------------------------------------
-- Delivery coordination for claims that require volunteer courier transport
CREATE TABLE IF NOT EXISTS public.deliveries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id uuid NOT NULL UNIQUE REFERENCES public.claims(id) ON DELETE CASCADE,
    volunteer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status public.delivery_status NOT NULL DEFAULT 'assigned',
    pickup_otp char(6) NOT NULL,
    dropoff_otp char(6) NOT NULL,
    pickup_at timestamptz,
    delivered_at timestamptz,
    distance_km numeric(6,2),
    route_polyline text,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.deliveries IS 'Volunteer delivery task tracking with pickup/dropoff OTP codes and routing info';

-- ----------------------------------------------------------------------------
-- 5. Notifications Table
-- ----------------------------------------------------------------------------
-- In-app notifications and transactional alert history for users
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type public.notification_type NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    data jsonb NOT NULL DEFAULT '{}'::jsonb,
    is_read boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.notifications IS 'User notifications for listing updates, claim states, and deliveries';

-- ----------------------------------------------------------------------------
-- 6. Feedback Table
-- ----------------------------------------------------------------------------
-- Ratings and reviews exchanged following completed donations or deliveries
CREATE TABLE IF NOT EXISTS public.feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id uuid NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
    from_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    to_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment text CHECK (char_length(comment) <= 500),
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_feedback_claim_from UNIQUE (claim_id, from_user_id)
);

COMMENT ON TABLE public.feedback IS 'Post-completion reviews between donors, recipients, and volunteers';

-- ----------------------------------------------------------------------------
-- 7. Audit Log Table
-- ----------------------------------------------------------------------------
-- Immutable security and compliance event ledger
CREATE TABLE IF NOT EXISTS public.audit_log (
    id bigserial PRIMARY KEY,
    actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.audit_log IS 'System and administrative audit trail for compliance and dispute inspection';

-- ----------------------------------------------------------------------------
-- 8. Indexes (Performance & Spatial Optimization)
-- ----------------------------------------------------------------------------

-- Spatial index on profiles location
CREATE INDEX IF NOT EXISTS idx_profiles_location
    ON public.profiles
    USING GiST (location);

-- Index on profiles role for filtering users by role
CREATE INDEX IF NOT EXISTS idx_profiles_role
    ON public.profiles (role);

-- Spatial index on listings location for geospatial radius / bounding box search
CREATE INDEX IF NOT EXISTS idx_listings_location
    ON public.listings
    USING GiST (location);

-- Partial index on active, non-deleted listings by status
CREATE INDEX IF NOT EXISTS idx_listings_status
    ON public.listings (status)
    WHERE deleted_at IS NULL;

-- Index on listing expiration timestamp for scheduled cleanup and discovery filtering
CREATE INDEX IF NOT EXISTS idx_listings_expires_at
    ON public.listings (expires_at);

-- Index on listing donor for profile dashboard queries
CREATE INDEX IF NOT EXISTS idx_listings_donor_id
    ON public.listings (donor_id);

-- Enforce exactly ONE active claim per listing (excluding cancelled and expired claims)
CREATE UNIQUE INDEX IF NOT EXISTS idx_claims_active_listing
    ON public.claims (listing_id)
    WHERE status NOT IN ('cancelled', 'expired');

-- Index on claimant foreign key for user claim history
CREATE INDEX IF NOT EXISTS idx_claims_claimant_id
    ON public.claims (claimant_id);

-- Index on delivery volunteer for courier task queries
CREATE INDEX IF NOT EXISTS idx_deliveries_volunteer_id
    ON public.deliveries (volunteer_id);

-- Index on notifications user_id
CREATE INDEX IF NOT EXISTS idx_notifications_user_id
    ON public.notifications (user_id);

-- Partial index on unread notifications for fast badge counts
CREATE INDEX IF NOT EXISTS idx_notifications_is_read
    ON public.notifications (user_id, is_read)
    WHERE is_read = false;

-- Feedback indexes for lookups by claim and recipient
CREATE INDEX IF NOT EXISTS idx_feedback_claim_id
    ON public.feedback (claim_id);

CREATE INDEX IF NOT EXISTS idx_feedback_to_user_id
    ON public.feedback (to_user_id);

-- Audit log indexes by entity and actor
CREATE INDEX IF NOT EXISTS idx_audit_log_entity
    ON public.audit_log (entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_actor_id
    ON public.audit_log (actor_id);

-- ----------------------------------------------------------------------------
-- 9. Trigger: Auto-update updated_at timestamp
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_updated_at() IS 'Automatically refreshes updated_at timestamp on row modification';

-- Apply handle_updated_at trigger to tables with updated_at column
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_listings_updated_at ON public.listings;
CREATE TRIGGER trg_listings_updated_at
    BEFORE UPDATE ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_claims_updated_at ON public.claims;
CREATE TRIGGER trg_claims_updated_at
    BEFORE UPDATE ON public.claims
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_deliveries_updated_at ON public.deliveries;
CREATE TRIGGER trg_deliveries_updated_at
    BEFORE UPDATE ON public.deliveries
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 10. Trigger: Auto-create Profile on auth.users Signup
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    default_role public.user_role := 'donor';
    meta_role text;
BEGIN
    -- Extract role from user metadata if provided during signup
    meta_role := NEW.raw_user_meta_data->>'role';
    IF meta_role IN ('donor', 'recipient', 'volunteer', 'admin') THEN
        default_role := meta_role::public.user_role;
    END IF;

    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        phone,
        role,
        avatar_url,
        is_verified_ngo
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        NEW.phone,
        default_role,
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE((NEW.raw_user_meta_data->>'is_verified_ngo')::boolean, false)
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = CASE WHEN profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END,
        updated_at = now();

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger function to initialize a public.profiles record on auth.users registration';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

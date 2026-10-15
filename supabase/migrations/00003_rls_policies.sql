-- ============================================================================
-- Migration: 00003_rls_policies.sql
-- Description: Row Level Security (RLS) policies and security helper functions
-- Project: Food Bridge Phase 1
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Helper Functions
-- ----------------------------------------------------------------------------

-- Extract role claim from Supabase Auth JWT
CREATE OR REPLACE FUNCTION public.role_from_jwt()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN COALESCE(
        auth.jwt() -> 'app_metadata' ->> 'role',
        auth.jwt() -> 'user_metadata' ->> 'role',
        auth.jwt() ->> 'role'
    );
END;
$$;

COMMENT ON FUNCTION public.role_from_jwt() IS 'Extracts the user role from JWT claims (app_metadata or user_metadata)';

-- Check if current authenticated user is an active participant in a claim
-- Participants include: claimant, donor of the listing, or assigned delivery volunteer
CREATE OR REPLACE FUNCTION public.is_claim_participant(claim_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.claims c
        JOIN public.listings l ON l.id = c.listing_id
        LEFT JOIN public.deliveries d ON d.claim_id = c.id
        WHERE c.id = claim_uuid
          AND (
              c.claimant_id = auth.uid()
              OR l.donor_id = auth.uid()
              OR d.volunteer_id = auth.uid()
          )
    );
END;
$$;

COMMENT ON FUNCTION public.is_claim_participant(uuid) IS 'Evaluates whether auth.uid() is claimant, listing donor, or assigned courier for a claim';

-- ----------------------------------------------------------------------------
-- 2. Enable Row Level Security (RLS) on all tables
-- ----------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. Profiles Policies
-- ----------------------------------------------------------------------------

-- Users can read their own entire profile
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Authenticated users can view active public profiles
DROP POLICY IF EXISTS profiles_select_public ON public.profiles;
CREATE POLICY profiles_select_public
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (is_active = true AND deleted_at IS NULL);

-- Users can update only their own profile
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can insert their own profile on registration if not created by trigger
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Secure definer view exposing only non-sensitive columns to client queries
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
    id,
    full_name,
    avatar_url,
    role,
    is_verified_ngo,
    city,
    state
FROM public.profiles
WHERE is_active = true AND deleted_at IS NULL;

-- ----------------------------------------------------------------------------
-- 4. Listings Policies
-- ----------------------------------------------------------------------------

-- Any authenticated user can view available, active, non-expired listings
DROP POLICY IF EXISTS listings_select_available ON public.listings;
CREATE POLICY listings_select_available
    ON public.listings
    FOR SELECT
    TO authenticated
    USING (
        status = 'available'
        AND deleted_at IS NULL
        AND expires_at > now()
    );

-- Donors can select all their own listings (including expired, claimed, cancelled)
DROP POLICY IF EXISTS listings_select_own ON public.listings;
CREATE POLICY listings_select_own
    ON public.listings
    FOR SELECT
    TO authenticated
    USING (auth.uid() = donor_id);

-- Claimants and assigned delivery couriers can view listings tied to their claims
DROP POLICY IF EXISTS listings_select_involved ON public.listings;
CREATE POLICY listings_select_involved
    ON public.listings
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.claims c
            LEFT JOIN public.deliveries d ON d.claim_id = c.id
            WHERE c.listing_id = listings.id
              AND (c.claimant_id = auth.uid() OR d.volunteer_id = auth.uid())
        )
    );

-- Donors can insert listings where they are the donor_id
DROP POLICY IF EXISTS listings_insert_donor ON public.listings;
CREATE POLICY listings_insert_donor
    ON public.listings
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = donor_id);

-- Donors can update their own listings
DROP POLICY IF EXISTS listings_update_donor ON public.listings;
CREATE POLICY listings_update_donor
    ON public.listings
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = donor_id)
    WITH CHECK (auth.uid() = donor_id);

-- ----------------------------------------------------------------------------
-- 5. Claims Policies
-- ----------------------------------------------------------------------------

-- Participants (claimant, listing donor, or assigned delivery volunteer) can view claims
DROP POLICY IF EXISTS claims_select_involved ON public.claims;
CREATE POLICY claims_select_involved
    ON public.claims
    FOR SELECT
    TO authenticated
    USING (
        claimant_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = claims.listing_id AND l.donor_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.deliveries d
            WHERE d.claim_id = claims.id AND d.volunteer_id = auth.uid()
        )
    );

-- Recipients can insert a claim for themselves
DROP POLICY IF EXISTS claims_insert_recipient ON public.claims;
CREATE POLICY claims_insert_recipient
    ON public.claims
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = claimant_id);

-- Involved participants can update claim status (e.g. approve, pick up, complete, cancel)
DROP POLICY IF EXISTS claims_update_involved ON public.claims;
CREATE POLICY claims_update_involved
    ON public.claims
    FOR UPDATE
    TO authenticated
    USING (
        claimant_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = claims.listing_id AND l.donor_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.deliveries d
            WHERE d.claim_id = claims.id AND d.volunteer_id = auth.uid()
        )
    )
    WITH CHECK (
        claimant_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = claims.listing_id AND l.donor_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.deliveries d
            WHERE d.claim_id = claims.id AND d.volunteer_id = auth.uid()
        )
    );

-- ----------------------------------------------------------------------------
-- 6. Deliveries Policies
-- ----------------------------------------------------------------------------

-- Assigned volunteer, claimant, and donor can view delivery records
DROP POLICY IF EXISTS deliveries_select_involved ON public.deliveries;
CREATE POLICY deliveries_select_involved
    ON public.deliveries
    FOR SELECT
    TO authenticated
    USING (
        volunteer_id = auth.uid()
        OR EXISTS (
            SELECT 1
            FROM public.claims c
            JOIN public.listings l ON l.id = c.listing_id
            WHERE c.id = deliveries.claim_id
              AND (c.claimant_id = auth.uid() OR l.donor_id = auth.uid())
        )
    );

-- Volunteers can update their assigned delivery status
DROP POLICY IF EXISTS deliveries_update_volunteer ON public.deliveries;
CREATE POLICY deliveries_update_volunteer
    ON public.deliveries
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = volunteer_id)
    WITH CHECK (auth.uid() = volunteer_id);

-- Volunteers can claim/insert an available delivery assignment
DROP POLICY IF EXISTS deliveries_insert_volunteer ON public.deliveries;
CREATE POLICY deliveries_insert_volunteer
    ON public.deliveries
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = volunteer_id);

-- ----------------------------------------------------------------------------
-- 7. Notifications Policies
-- ----------------------------------------------------------------------------

-- Users can only view their own notifications
DROP POLICY IF EXISTS notif_select_own ON public.notifications;
CREATE POLICY notif_select_own
    ON public.notifications
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
DROP POLICY IF EXISTS notif_update_own ON public.notifications;
CREATE POLICY notif_update_own
    ON public.notifications
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 8. Feedback Policies
-- ----------------------------------------------------------------------------

-- All authenticated users can view feedback and ratings
DROP POLICY IF EXISTS feedback_select_public ON public.feedback;
CREATE POLICY feedback_select_public
    ON public.feedback
    FOR SELECT
    TO authenticated
    USING (true);

-- Authenticated users can insert feedback authored by themselves
DROP POLICY IF EXISTS feedback_insert_involved ON public.feedback;
CREATE POLICY feedback_insert_involved
    ON public.feedback
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = from_user_id);

-- ----------------------------------------------------------------------------
-- 9. Audit Log Policies
-- ----------------------------------------------------------------------------

-- Only administrators can select and review audit logs
DROP POLICY IF EXISTS audit_select_admin ON public.audit_log;
CREATE POLICY audit_select_admin
    ON public.audit_log
    FOR SELECT
    TO authenticated
    USING (
        public.role_from_jwt() = 'admin'
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- No INSERT/UPDATE/DELETE policies for authenticated users.
-- Audit logs are written strictly via SECURITY DEFINER triggers and Edge Functions (service_role).

-- ============================================================================
-- Migration: 00001_extensions_and_enums.sql
-- Description: Enable PostgreSQL extensions and create custom ENUM types
-- Project: Food Bridge Phase 1
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PostgreSQL Extensions
-- ----------------------------------------------------------------------------

-- Enable PostGIS for geospatial queries and location geography types
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Enable pgcrypto for cryptographic functions and UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable pg_trgm for trigram-based fuzzy string search and indexing
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- NOTE: pg_cron
-- pg_cron is enabled at the Supabase project level via Dashboard -> Database -> Extensions.
-- It operates in the postgres maintenance background worker and runs scheduled jobs.
-- Tenant migrations cannot enable pg_cron directly if not permitted by instance permissions.
-- Once enabled in Supabase Dashboard, cron jobs can be scheduled via `cron.schedule(...)`.

-- ----------------------------------------------------------------------------
-- 2. Custom ENUM Types
-- ----------------------------------------------------------------------------

-- user_role: Defines system access tiers and profile roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM (
            'donor',
            'recipient',
            'volunteer',
            'admin'
        );
    END IF;
END $$;

-- food_category: Categorization for surplus food donations
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'food_category') THEN
        CREATE TYPE public.food_category AS ENUM (
            'cooked_meal',
            'raw_ingredients',
            'packaged',
            'bakery',
            'beverages',
            'other'
        );
    END IF;
END $$;

-- listing_status: Lifecycle states of a food donation listing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_status') THEN
        CREATE TYPE public.listing_status AS ENUM (
            'available',
            'claimed',
            'in_transit',
            'completed',
            'expired',
            'cancelled'
        );
    END IF;
END $$;

-- claim_status: Lifecycle states of a claim made by a recipient
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'claim_status') THEN
        CREATE TYPE public.claim_status AS ENUM (
            'pending',
            'approved',
            'picked_up',
            'completed',
            'cancelled',
            'expired'
        );
    END IF;
END $$;

-- delivery_status: Lifecycle states for volunteer delivery tasks
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'delivery_status') THEN
        CREATE TYPE public.delivery_status AS ENUM (
            'assigned',
            'en_route_pickup',
            'picked_up',
            'en_route_dropoff',
            'delivered',
            'cancelled'
        );
    END IF;
END $$;

-- notification_type: Categories for transactional and system notifications
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE public.notification_type AS ENUM (
            'claim_received',
            'claim_approved',
            'delivery_assigned',
            'handover_complete',
            'listing_expired',
            'system'
        );
    END IF;
END $$;

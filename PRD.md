# Food Bridge — Product Requirements Document (PRD)

> **Version:** 1.0  
> **Last Updated:** 2026-10-14  
> **Author:** Product & Architecture Team  
> **Status:** Draft → Review

---

## Table of Contents

1. [Executive Summary & Core Mission](#1-executive-summary--core-mission)
2. [User Personas & Primary Use Cases](#2-user-personas--primary-use-cases)
3. [Technical Architecture & Tech Stack](#3-technical-architecture--tech-stack)
4. [Database Entity-Relationship (ER) Overview](#4-database-entity-relationship-er-overview)
5. [Core Feature Specifications & User Flows](#5-core-feature-specifications--user-flows)
6. [Row-Level Security (RLS) & Data Access Requirements](#6-row-level-security-rls--data-access-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Phased Implementation Roadmap](#8-phased-implementation-roadmap)
9. [Appendices](#9-appendices)

---

## 1. Executive Summary & Core Mission

### 1.1 Problem Statement

Approximately **1.3 billion tonnes** of food is wasted globally every year (FAO, 2024) while **828 million people** face hunger. At the local level, restaurants, caterers, event organisers, and households regularly discard surplus edible food because no convenient, trust-worthy mechanism exists to redirect it to people who need it most.

### 1.2 Solution — Food Bridge

**Food Bridge** is a community-driven web and mobile application that creates a real-time bridge between:

| Actor | Description |
|-------|-------------|
| **Donors** | Restaurants, caterers, event managers, households with surplus food |
| **Recipients** | NGOs, shelters, community kitchens, individuals in need |
| **Volunteers** | Local community members who provide transport logistics |

The platform enables donors to list surplus food in seconds, lets recipients discover and claim it via a map-based feed, and coordinates volunteer-driven pickup & delivery — all verified through a secure OTP/QR handover protocol.

### 1.3 Core Mission

> *Reduce food waste and fight hunger by making surplus-food redistribution as seamless as ordering a ride.*

### 1.4 Success Metrics (North Stars)

| Metric | Target (Year 1) |
|--------|-----------------|
| Monthly Active Users (MAU) | 25,000 |
| Food Listings Created / month | 5,000 |
| Successful Handovers / month | 3,500 (70 % claim-to-handover rate) |
| Average Listing-to-Claim time | < 30 minutes |
| Donor Retention (monthly) | ≥ 40 % |
| Platform Food Safety Incident Rate | < 0.1 % |

### 1.5 Key Design Principles

1. **Speed over Perfection** — Surplus food is perishable; every flow must be optimisable to < 60 seconds.
2. **Trust & Verification** — OTP/QR-based handover ensures accountability.
3. **Hyperlocal First** — Radius-based discovery centres every interaction around the user's neighbourhood.
4. **Inclusive by Default** — Multi-language, WCAG 2.1 AA accessible, low-bandwidth friendly.
5. **Privacy & Safety** — Exact donor addresses are revealed only after a claim is confirmed.

---

## 2. User Personas & Primary Use Cases

### 2.1 Persona: Donor

| Attribute | Detail |
|-----------|--------|
| **Who** | Restaurant owner, caterer, event organiser, household cook |
| **Goal** | Dispose of surplus food responsibly in < 2 minutes |
| **Pain Point** | No convenient channel; guilt about waste; liability concerns |
| **Tech Comfort** | Moderate — uses WhatsApp/Instagram daily |

#### Primary Use Cases — Donor

| UC-ID | Use Case | Description |
|-------|----------|-------------|
| UC-D1 | **Post Surplus Food** | Donor logs in → fills a quick form (title, category, quantity, expiry window, photo, pickup location) → publishes listing. |
| UC-D2 | **Manage Active Listings** | Donor views dashboard of active/claimed/expired listings; can edit, extend expiry, or cancel. |
| UC-D3 | **Handover Verification** | Donor shows/scans OTP or QR code presented by recipient/volunteer to confirm pickup. |
| UC-D4 | **View Impact** | Donor sees lifetime stats: meals donated, CO₂ saved, community badges. |

---

### 2.2 Persona: Recipient / NGO

| Attribute | Detail |
|-----------|--------|
| **Who** | NGO coordinator, shelter manager, community kitchen lead, individual in need |
| **Goal** | Find and secure free, safe food near their location quickly |
| **Pain Point** | Unreliable food supply; wasted commute to empty donation points |
| **Tech Comfort** | Varies — NGO staff are moderate; individuals may be low-tech |

#### Primary Use Cases — Recipient

| UC-ID | Use Case | Description |
|-------|----------|-------------|
| UC-R1 | **Discover Available Food** | Recipient opens map/list feed → filters by radius, category, dietary tags → sees real-time availability. |
| UC-R2 | **Claim a Listing** | Recipient selects a listing → claims it → receives pickup details + OTP. |
| UC-R3 | **Self-Pickup Handover** | Recipient visits donor location → presents OTP/QR → donor verifies → handover confirmed. |
| UC-R4 | **Request Volunteer Delivery** | Recipient flags "Need delivery" during claim → system dispatches available volunteer. |
| UC-R5 | **Rate & Feedback** | Post-handover, recipient rates food quality (optional, anonymous). |

---

### 2.3 Persona: Volunteer

| Attribute | Detail |
|-----------|--------|
| **Who** | Student, retiree, civic-minded professional with personal vehicle or bicycle |
| **Goal** | Contribute to the community; earn recognition / gamification rewards |
| **Pain Point** | Wants flexible, on-demand volunteering; no long-term commitments |
| **Tech Comfort** | High — comfortable with navigation apps |

#### Primary Use Cases — Volunteer

| UC-ID | Use Case | Description |
|-------|----------|-------------|
| UC-V1 | **Set Availability** | Volunteer marks themselves "available" with a service radius. |
| UC-V2 | **Accept Delivery Task** | Volunteer receives push notification → reviews route → accepts/declines. |
| UC-V3 | **Navigate & Pickup** | Volunteer gets directions to donor → picks up food → scans donor QR/enters OTP. |
| UC-V4 | **Deliver & Handover** | Volunteer delivers to recipient → recipient confirms with OTP/QR. |
| UC-V5 | **View Stats & Badges** | Volunteer tracks deliveries completed, distance covered, badges earned. |

---

### 2.4 Persona: System Administrator

| Attribute | Detail |
|-----------|--------|
| **Who** | Food Bridge ops team member |
| **Goal** | Monitor platform health, moderate content, manage disputes, view analytics |
| **Pain Point** | Needs full visibility without compromising user privacy |
| **Tech Comfort** | High |

#### Primary Use Cases — Admin

| UC-ID | Use Case | Description |
|-------|----------|-------------|
| UC-A1 | **Dashboard Overview** | Admin views real-time metrics: active listings, claims in progress, deliveries en route. |
| UC-A2 | **User Management** | Admin can verify NGO status, suspend/ban accounts, reset passwords. |
| UC-A3 | **Content Moderation** | Admin reviews flagged listings or reports; can hide or remove content. |
| UC-A4 | **Analytics & Reporting** | Admin generates reports on food saved, geographic heatmaps, user growth. |
| UC-A5 | **System Configuration** | Admin manages categories, dietary tags, radius defaults, notification templates. |

---

## 3. Technical Architecture & Tech Stack

### 3.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                 │
│  ┌───────────────────────┐    ┌──────────────────────────────────┐  │
│  │   Next.js App (SSR)   │    │   PWA / Mobile (Responsive)      │  │
│  │   TypeScript           │    │   Installable on Home Screen     │  │
│  │   Tailwind CSS         │    │   Push via Web Push API          │  │
│  │   React 18+ (RSC)      │    │                                  │  │
│  └──────────┬────────────┘    └──────────┬───────────────────────┘  │
│             │                            │                          │
│             ▼                            ▼                          │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              Next.js Server Actions / API Routes             │   │
│  │              (Data Mutations, Validation, Auth Checks)       │   │
│  └──────────────────────────┬───────────────────────────────────┘   │
└─────────────────────────────┼───────────────────────────────────────┘
                              │ HTTPS / WSS
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       SUPABASE PLATFORM                             │
│  ┌────────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ Supabase Auth   │  │ Realtime     │  │ Supabase Storage       │  │
│  │ (Email, OAuth,  │  │ (WebSocket   │  │ (Food Photos,          │  │
│  │  Magic Link)    │  │  Subscriptions│  │  Profile Avatars)      │  │
│  └────────┬───────┘  └──────┬───────┘  └──────────┬─────────────┘  │
│           │                 │                      │                │
│           ▼                 ▼                      ▼                │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                   PostgreSQL Database                        │   │
│  │         Row-Level Security (RLS) Policies                   │   │
│  │         PostGIS Extension (Geospatial Queries)              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              Supabase Edge Functions (Deno)                  │   │
│  │  • OTP Generation & Validation                              │   │
│  │  • Push Notification Dispatch                               │   │
│  │  • Listing Expiry Cron (pg_cron)                            │   │
│  │  • Analytics Aggregation                                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Mapbox /      │  │ Firebase     │  │ Resend / SendGrid       │  │
│  │ Google Maps   │  │ Cloud        │  │ (Transactional Email)   │  │
│  │ (Geocoding,   │  │ Messaging    │  │                          │  │
│  │  Map Tiles)   │  │ (Push Notifs)│  │                          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Tech Stack Detail

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend Framework** | Next.js 14+ (App Router, React Server Components) | SSR for SEO; RSC for reduced client JS; Server Actions for mutations |
| **Language** | TypeScript (strict mode) | Type safety across full stack; shared types for DB schema |
| **Styling** | Tailwind CSS 3.4+ | Utility-first; rapid prototyping; small bundle with purging |
| **UI Components** | shadcn/ui + Radix Primitives | Accessible, composable, unstyled primitives |
| **Maps** | Mapbox GL JS / Leaflet + OpenStreetMap | Interactive map feed; geocoding; directions |
| **Backend / BaaS** | Supabase (self-hosted or cloud) | PostgreSQL, Auth, Realtime, Storage, Edge Functions in one platform |
| **Database** | PostgreSQL 15+ with PostGIS | Geospatial indexing (`ST_DWithin`), JSONB, full-text search |
| **Auth** | Supabase Auth (GoTrue) | Email/password, Google OAuth, Magic Link; JWT-based sessions |
| **Realtime** | Supabase Realtime (WebSocket) | Live listing status updates, delivery tracking |
| **File Storage** | Supabase Storage (S3-compatible) | Food photos with auto-resize via image transformations |
| **Serverless Functions** | Supabase Edge Functions (Deno) | OTP logic, cron jobs, webhook handlers |
| **State Management** | React Server Components + `nuqs` (URL state) + Zustand (minimal client state) | Minimal client state; URL-driven filters |
| **API Layer** | Next.js Server Actions + Supabase JS Client (`@supabase/ssr`) | Co-located data fetching; RLS-enforced queries |
| **Push Notifications** | Web Push API + Firebase Cloud Messaging (mobile) | Cross-platform push |
| **Email** | Resend or SendGrid | Transactional emails: verification, claim alerts |
| **CI/CD** | GitHub Actions → Vercel (frontend) + Supabase CLI (migrations) | Automated deployments, migration safety |
| **Monitoring** | Sentry (errors), Vercel Analytics (web vitals), Supabase Dashboard | Production observability |

### 3.3 Key Architectural Decisions

| # | Decision | Context & Consequence |
|---|----------|----------------------|
| ADR-1 | **Server Actions over REST API routes** | Reduces boilerplate; co-locates mutation logic with UI; type-safe end-to-end. Trade-off: tighter coupling to Next.js. |
| ADR-2 | **PostGIS for geospatial queries** | Enables radius-based discovery (`ST_DWithin`) with spatial indexing (GiST). Avoids client-side distance filtering. |
| ADR-3 | **Supabase RLS as primary authorization layer** | Security at the database level; every query (even from Edge Functions) is governed by policies. Reduces surface area for auth bugs. |
| ADR-4 | **PWA over native mobile app (Phase 1)** | Faster time-to-market; single codebase; installable on Android/iOS. Native app deferred to Phase 3. |
| ADR-5 | **OTP + QR dual-mode verification** | OTP for low-tech users (SMS/in-app code); QR for speed. Both generate a single `handover_token`. |
| ADR-6 | **Soft deletes across all entities** | Compliance, audit trail, and analytics. `deleted_at` timestamp; RLS policies filter soft-deleted rows. |

---

## 4. Database Entity-Relationship (ER) Overview

### 4.1 ER Diagram

```
┌────────────────────┐         ┌─────────────────────────┐
│      profiles      │         │       listings          │
├────────────────────┤         ├─────────────────────────┤
│ id (PK, FK→auth)   │◄───┐    │ id (PK, uuid)           │
│ email              │    │    │ donor_id (FK→profiles)   │───┐
│ full_name          │    │    │ title                    │   │
│ phone              │    │    │ description              │   │
│ role (enum)        │    │    │ category (enum)          │   │
│ avatar_url         │    │    │ quantity_servings (int)   │   │
│ address_line       │    │    │ dietary_tags (text[])     │   │
│ city               │    │    │ photo_urls (text[])       │   │
│ state              │    │    │ pickup_address           │   │
│ location (POINT)   │    │    │ pickup_instructions      │   │
│ is_verified_ngo    │    │    │ location (POINT)         │   │
│ is_active          │    │    │ prepared_at (timestamptz)│   │
│ notification_prefs │    │    │ expires_at (timestamptz) │   │
│ created_at         │    │    │ status (enum)            │   │
│ updated_at         │    │    │ is_delivery_available    │   │
│ deleted_at         │    │    │ created_at               │   │
└────────────────────┘    │    │ updated_at               │   │
        ▲                 │    │ deleted_at               │   │
        │                 │    └─────────────┬────────────┘   │
        │                 │                  │                 │
        │                 │                  │ 1:N             │
        │                 │                  ▼                 │
        │                 │    ┌─────────────────────────┐    │
        │                 │    │        claims            │    │
        │                 │    ├─────────────────────────┤    │
        │                 ├────│ claimant_id (FK→profiles)│    │
        │                 │    │ listing_id (FK→listings) │────┘
        │                 │    │ id (PK, uuid)            │
        │                 │    │ status (enum)            │
        │                 │    │ handover_otp (char 6)    │
        │                 │    │ handover_qr_token (uuid) │
        │                 │    │ claimed_at (timestamptz) │
        │                 │    │ completed_at (timestamptz│
        │                 │    │ cancelled_at (timestamptz│
        │                 │    │ cancellation_reason      │
        │                 │    │ created_at               │
        │                 │    │ updated_at               │
        │                 │    └──────────┬──────────────┘
        │                 │               │ 1:0..1
        │                 │               ▼
        │                 │    ┌─────────────────────────┐
        │                 │    │      deliveries         │
        │                 │    ├─────────────────────────┤
        │                 └────│ volunteer_id (FK→profiles│
        │                      │ claim_id (FK→claims)     │
        │                      │ id (PK, uuid)            │
        │                      │ status (enum)            │
        │                      │ pickup_otp (char 6)      │
        │                      │ dropoff_otp (char 6)     │
        │                      │ pickup_at (timestamptz)  │
        │                      │ delivered_at (timestamptz│
        │                      │ distance_km (numeric)    │
        │                      │ notes                    │
        │                      │ created_at               │
        │                      │ updated_at               │
        │                      └─────────────────────────┘
        │
        │    ┌─────────────────────────┐
        │    │      notifications      │
        │    ├─────────────────────────┤
        └────│ user_id (FK→profiles)   │
             │ id (PK, uuid)           │
             │ type (enum)             │
             │ title                   │
             │ body                    │
             │ data (jsonb)            │
             │ is_read (bool)          │
             │ created_at              │
             └─────────────────────────┘

        ┌─────────────────────────┐
        │       feedback          │
        ├─────────────────────────┤
        │ id (PK, uuid)           │
        │ claim_id (FK→claims)    │
        │ from_user_id (FK)       │
        │ to_user_id (FK)         │
        │ rating (1-5)            │
        │ comment (text)          │
        │ created_at              │
        └─────────────────────────┘

        ┌─────────────────────────┐
        │     audit_log           │
        ├─────────────────────────┤
        │ id (PK, bigserial)      │
        │ actor_id (FK→profiles)  │
        │ action (text)           │
        │ entity_type (text)      │
        │ entity_id (uuid)        │
        │ metadata (jsonb)        │
        │ created_at              │
        └─────────────────────────┘
```

### 4.2 Entity Detail

#### 4.2.1 `profiles`

Extends Supabase `auth.users`. Created via a database trigger on `auth.users` insert.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, FK → `auth.users.id` | Matches Supabase auth UID |
| `email` | `text` | NOT NULL, UNIQUE | Synced from auth |
| `full_name` | `text` | NOT NULL | Display name |
| `phone` | `text` | UNIQUE, nullable | For OTP SMS fallback |
| `role` | `enum('donor','recipient','volunteer','admin')` | NOT NULL | Selected during onboarding |
| `avatar_url` | `text` | nullable | Supabase Storage URL |
| `address_line` | `text` | nullable | Human-readable address |
| `city` | `text` | nullable | |
| `state` | `text` | nullable | |
| `location` | `geography(POINT, 4326)` | nullable | PostGIS point for geospatial queries |
| `is_verified_ngo` | `boolean` | DEFAULT false | Admin-verified NGO status |
| `is_active` | `boolean` | DEFAULT true | Soft active/inactive toggle |
| `notification_prefs` | `jsonb` | DEFAULT `{}` | `{ push: true, email: true, sms: false }` |
| `created_at` | `timestamptz` | DEFAULT now() | |
| `updated_at` | `timestamptz` | DEFAULT now() | Updated via trigger |
| `deleted_at` | `timestamptz` | nullable | Soft delete |

**Indexes:**
- `idx_profiles_location` — GiST index on `location`
- `idx_profiles_role` — B-tree on `role`

---

#### 4.2.2 `listings`

Represents a surplus food posting by a donor.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `donor_id` | `uuid` | FK → `profiles.id`, NOT NULL | Creator |
| `title` | `text` | NOT NULL, max 120 chars | e.g., "50 servings of biryani" |
| `description` | `text` | nullable, max 500 chars | Optional details |
| `category` | `enum('cooked_meal','raw_ingredients','packaged','bakery','beverages','other')` | NOT NULL | |
| `quantity_servings` | `integer` | NOT NULL, CHECK > 0 | Approximate number of servings |
| `dietary_tags` | `text[]` | DEFAULT `{}` | `['vegetarian','vegan','halal','gluten_free']` |
| `photo_urls` | `text[]` | NOT NULL, min 1 | At least one photo required |
| `pickup_address` | `text` | NOT NULL | Human-readable |
| `pickup_instructions` | `text` | nullable | "Use back entrance", etc. |
| `location` | `geography(POINT, 4326)` | NOT NULL | Geocoded pickup point |
| `prepared_at` | `timestamptz` | NOT NULL | When food was prepared/packaged |
| `expires_at` | `timestamptz` | NOT NULL | Claim deadline; auto-expire via cron |
| `status` | `enum('available','claimed','in_transit','completed','expired','cancelled')` | DEFAULT `'available'` | Finite state machine |
| `is_delivery_available` | `boolean` | DEFAULT false | Donor flags if volunteer pickup is welcome |
| `created_at` | `timestamptz` | DEFAULT now() | |
| `updated_at` | `timestamptz` | DEFAULT now() | |
| `deleted_at` | `timestamptz` | nullable | |

**Indexes:**
- `idx_listings_location` — GiST index on `location` (critical for `ST_DWithin`)
- `idx_listings_status` — B-tree on `status` WHERE `deleted_at IS NULL`
- `idx_listings_expires_at` — B-tree on `expires_at` (for cron expiry query)
- `idx_listings_donor_id` — B-tree on `donor_id`

**State Machine — `listings.status`:**

```
                ┌──────────────┐
                │  available   │
                └──────┬───────┘
                       │ claim accepted
            ┌──────────▼──────────┐
            │      claimed        │
            └──────┬──────┬───────┘
     volunteer     │      │ self-pickup
     assigned      │      │ completed
        ┌──────────▼┐   ┌▼───────────┐
        │ in_transit │   │ completed  │
        └──────┬─────┘   └────────────┘
               │ delivered
        ┌──────▼──────┐
        │  completed  │
        └─────────────┘

  * Any active status ──► expired  (cron job when now() > expires_at)
  * Any active status ──► cancelled (donor cancels)
```

---

#### 4.2.3 `claims`

Represents a recipient claiming a food listing.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `listing_id` | `uuid` | FK → `listings.id`, NOT NULL | |
| `claimant_id` | `uuid` | FK → `profiles.id`, NOT NULL | Recipient user |
| `status` | `enum('pending','approved','picked_up','completed','cancelled','expired')` | DEFAULT `'pending'` | |
| `handover_otp` | `char(6)` | NOT NULL | 6-digit code generated on claim creation |
| `handover_qr_token` | `uuid` | NOT NULL, DEFAULT `gen_random_uuid()` | Encoded in QR |
| `claimed_at` | `timestamptz` | DEFAULT now() | |
| `completed_at` | `timestamptz` | nullable | Handover verified |
| `cancelled_at` | `timestamptz` | nullable | |
| `cancellation_reason` | `text` | nullable | |
| `needs_delivery` | `boolean` | DEFAULT false | If true, volunteer delivery requested |
| `created_at` | `timestamptz` | DEFAULT now() | |
| `updated_at` | `timestamptz` | DEFAULT now() | |

**Constraints:**
- `UNIQUE(listing_id)` WHERE `status NOT IN ('cancelled','expired')` — only one active claim per listing.
- `CHECK(claimant_id != listing.donor_id)` — enforced via RLS/trigger.

---

#### 4.2.4 `deliveries`

Tracks volunteer-mediated transport from donor to recipient.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `claim_id` | `uuid` | FK → `claims.id`, NOT NULL, UNIQUE | One delivery per claim |
| `volunteer_id` | `uuid` | FK → `profiles.id`, NOT NULL | |
| `status` | `enum('assigned','en_route_pickup','picked_up','en_route_dropoff','delivered','cancelled')` | DEFAULT `'assigned'` | |
| `pickup_otp` | `char(6)` | NOT NULL | Volunteer presents to donor |
| `dropoff_otp` | `char(6)` | NOT NULL | Volunteer presents to recipient |
| `pickup_at` | `timestamptz` | nullable | Actual pickup time |
| `delivered_at` | `timestamptz` | nullable | Actual delivery time |
| `distance_km` | `numeric(6,2)` | nullable | Calculated or GPS-reported |
| `route_polyline` | `text` | nullable | Encoded polyline for map replay |
| `notes` | `text` | nullable | Volunteer notes |
| `created_at` | `timestamptz` | DEFAULT now() | |
| `updated_at` | `timestamptz` | DEFAULT now() | |

---

#### 4.2.5 `notifications`

In-app notification log.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK | |
| `user_id` | `uuid` | FK → `profiles.id`, NOT NULL | |
| `type` | `enum('claim_received','claim_approved','delivery_assigned','handover_complete','listing_expired','system')` | NOT NULL | |
| `title` | `text` | NOT NULL | |
| `body` | `text` | NOT NULL | |
| `data` | `jsonb` | DEFAULT `{}` | Deep-link payload |
| `is_read` | `boolean` | DEFAULT false | |
| `created_at` | `timestamptz` | DEFAULT now() | |

---

#### 4.2.6 `feedback`

Post-handover ratings.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK | |
| `claim_id` | `uuid` | FK → `claims.id`, NOT NULL | |
| `from_user_id` | `uuid` | FK → `profiles.id` | Rater |
| `to_user_id` | `uuid` | FK → `profiles.id` | Rated |
| `rating` | `smallint` | NOT NULL, CHECK 1–5 | |
| `comment` | `text` | nullable, max 500 chars | |
| `created_at` | `timestamptz` | DEFAULT now() | |

**Constraint:** `UNIQUE(claim_id, from_user_id)` — one rating per user per claim.

---

#### 4.2.7 `audit_log`

Immutable event log for compliance and debugging.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `bigserial` | PK | |
| `actor_id` | `uuid` | FK → `profiles.id`, nullable | NULL for system actions |
| `action` | `text` | NOT NULL | e.g., `listing.created`, `claim.approved`, `handover.verified` |
| `entity_type` | `text` | NOT NULL | `listing`, `claim`, `delivery` |
| `entity_id` | `uuid` | NOT NULL | |
| `metadata` | `jsonb` | DEFAULT `{}` | Diff, IP, user-agent |
| `created_at` | `timestamptz` | DEFAULT now() | |

---

### 4.3 PostgreSQL Extensions Required

| Extension | Purpose |
|-----------|---------|
| `postgis` | Geospatial data types and functions (`geography`, `ST_DWithin`, `ST_Distance`) |
| `pg_cron` | Scheduled jobs (listing expiry, analytics rollup) |
| `pgcrypto` | `gen_random_uuid()`, OTP generation |
| `pg_trgm` | Trigram-based fuzzy text search on listing titles |

---

## 5. Core Feature Specifications & User Flows

### 5.1 Authentication & User Role Selection

#### 5.1.1 Supported Auth Methods

| Method | Priority | Notes |
|--------|----------|-------|
| Email + Password | P0 (MVP) | Standard registration |
| Google OAuth 2.0 | P0 (MVP) | One-tap sign-in |
| Magic Link (Email) | P1 | Passwordless option |
| Phone OTP | P2 | For low-tech users |

#### 5.1.2 Onboarding Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────────┐
│  Landing Page   │────▶│  Sign Up / Login  │────▶│  Role Selection      │
│                 │     │  (Email/Google)   │     │  ○ I want to donate  │
└─────────────────┘     └──────────────────┘     │  ○ I need food       │
                                                  │  ○ I want to volunteer│
                                                  └──────────┬───────────┘
                                                             │
                                                             ▼
                                                  ┌──────────────────────┐
                                                  │  Profile Setup       │
                                                  │  • Name              │
                                                  │  • Phone (optional)  │
                                                  │  • Address / Location│
                                                  │  • Avatar (optional) │
                                                  │  • NGO cert (if NGO) │
                                                  └──────────┬───────────┘
                                                             │
                                                             ▼
                                                  ┌──────────────────────┐
                                                  │  Dashboard (role-    │
                                                  │  specific home)      │
                                                  └──────────────────────┘
```

#### 5.1.3 Technical Notes

- On `auth.users` insert, a PostgreSQL trigger creates a corresponding `profiles` row.
- Role is stored in `profiles.role` and included in the JWT via a Supabase custom claim (`app_metadata.role`) for RLS policies.
- Session managed via `@supabase/ssr` with cookie-based storage (httpOnly, Secure, SameSite=Lax).

---

### 5.2 Food Posting Flow (Donor Side)

#### 5.2.1 Listing Creation Form

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Title | text input | ✅ | 5–120 characters |
| Category | select | ✅ | One of predefined enum values |
| Quantity (servings) | number input | ✅ | Integer, 1–1000 |
| Dietary Tags | multi-select chips | ❌ | From predefined list |
| Description | textarea | ❌ | Max 500 chars |
| Photo(s) | file upload | ✅ (min 1) | JPEG/PNG/WebP, max 5 MB each, max 4 photos |
| Pickup Address | text + map pin | ✅ | Geocoded to lat/lng via Mapbox |
| Pickup Instructions | textarea | ❌ | Max 200 chars |
| Prepared At | datetime picker | ✅ | Cannot be in the future (>1 hr margin) |
| Expires At | datetime picker | ✅ | Must be > now + 30 min; max now + 24 hr |
| Delivery Available? | toggle | ❌ | Default: off |

#### 5.2.2 Flow Diagram

```
Donor opens app
       │
       ▼
[Dashboard] ──── Tap "Donate Food" (FAB button)
       │
       ▼
[Listing Form - Step 1: Food Details]
  • Title, Category, Quantity, Tags, Description
       │
       ▼
[Listing Form - Step 2: Photo Upload]
  • Camera capture or gallery select
  • Client-side compression (< 1 MB)
  • Upload to Supabase Storage → signed URL
       │
       ▼
[Listing Form - Step 3: Pickup Details]
  • Address auto-complete (Mapbox)
  • Drag pin to adjust
  • Pickup instructions
  • Prepared at / Expires at
  • Delivery toggle
       │
       ▼
[Preview & Confirm]
  • Full listing preview card
  • "Post Listing" CTA
       │
       ▼
[Server Action: createListing()]
  • Validate all fields server-side
  • Insert into `listings` table
  • Status = 'available'
  • Return success → redirect to listing detail
       │
       ▼
[Listing Live] ──── Visible on map feed within 2 seconds (Realtime broadcast)
```

#### 5.2.3 Photo Upload Strategy

1. Client compresses image to ≤ 1 MB using `browser-image-compression`.
2. Client calls Server Action `getUploadUrl()` → returns Supabase Storage signed upload URL.
3. Client uploads directly to Storage (bypasses server for speed).
4. Server Action `createListing()` receives Storage paths, validates they exist, stores in `photo_urls[]`.

---

### 5.3 Food Discovery & Map/List Feed (Recipient Side)

#### 5.3.1 Feed Modes

| Mode | Description |
|------|-------------|
| **Map View** (default) | Interactive Mapbox/Leaflet map with listing pins; user's location centred |
| **List View** | Sorted cards; distance badge on each; infinite scroll |

#### 5.3.2 Filters & Controls

| Filter | Type | Default |
|--------|------|---------|
| Radius | slider (1–25 km) | 5 km |
| Category | multi-select | All |
| Dietary Tags | multi-select | None (show all) |
| Status | toggle | Available only |
| Sort | dropdown | Nearest / Expiring Soon |

#### 5.3.3 Discovery Query (PostGIS)

```sql
SELECT
  l.id, l.title, l.category, l.quantity_servings,
  l.photo_urls[1] AS thumbnail,
  l.expires_at,
  ST_Distance(l.location, ST_SetSRID(ST_MakePoint($lng, $lat), 4326)::geography) AS distance_m
FROM listings l
WHERE l.status = 'available'
  AND l.deleted_at IS NULL
  AND l.expires_at > now()
  AND ST_DWithin(
        l.location,
        ST_SetSRID(ST_MakePoint($lng, $lat), 4326)::geography,
        $radius_meters
      )
ORDER BY distance_m ASC
LIMIT 50;
```

#### 5.3.4 Real-Time Updates

- Client subscribes to Supabase Realtime channel: `listings:status=available`
- On `INSERT` → new pin appears on map / card appears in list.
- On `UPDATE` (status change) → pin/card updates or disappears.
- On `DELETE` (soft) → pin/card removed.

#### 5.3.5 Listing Detail View

Tapping a pin or card opens a detail sheet/page showing:

- All photos (carousel)
- Title, description, category, dietary tags
- Quantity (servings)
- Donor name + avatar (anonymised until claim)
- Distance & approximate area (not exact address)
- Prepared at & time remaining
- Delivery available badge
- **"Claim This Food" CTA button**

---

### 5.4 Claiming Mechanism & OTP/QR Handover Verification

#### 5.4.1 Claim Flow

```
Recipient views listing detail
       │
       ▼
Tap "Claim This Food"
       │
       ▼
[Confirmation Modal]
  "You are claiming ~50 servings of biryani.
   Pickup at: Koramangala (exact address revealed after claim).
   ☐ I need delivery help (volunteer)
   [Confirm Claim]  [Cancel]"
       │
       ▼
[Server Action: claimListing()]
  • Check listing.status == 'available'
  • Check claimant != donor
  • Insert into `claims` table
    - Generate 6-digit OTP (cryptographically random)
    - Generate QR token (UUID)
    - Set status = 'pending'
  • Update listing.status = 'claimed'
  • Send notification to donor (push + in-app)
  • If needs_delivery → flag for volunteer dispatch
  • Return claim details including OTP + QR
       │
       ▼
[Claim Confirmation Screen]
  • Exact pickup address revealed
  • OTP displayed prominently: "Your pickup code: 483921"
  • QR code rendered (encoding handover_qr_token)
  • Map with directions to pickup point
  • Timer showing time remaining until expiry
  • "Cancel Claim" option
```

#### 5.4.2 Handover Verification

**Self-Pickup (No Volunteer):**

```
Recipient arrives at donor location
       │
       ▼
Recipient shows OTP code or QR on their phone screen
       │
       ▼
Donor enters OTP in app     ── OR ──     Donor scans QR with app camera
       │                                         │
       ▼                                         ▼
[Server Action: verifyHandover({ claimId, otp | qrToken })]
  • Validate OTP/QR matches claim record
  • Update claim.status = 'completed', claim.completed_at = now()
  • Update listing.status = 'completed'
  • Create audit_log entry
  • Send confirmation notifications to both parties
  • Trigger feedback prompt (delayed 30 min)
       │
       ▼
[Success Screen - Both Parties]
  "🎉 Handover complete! 50 servings saved from waste."
  • Impact stat animation
  • Optional: rate the other party
```

**Volunteer-Mediated Delivery:**

```
Volunteer picks up from donor:
  • Volunteer presents pickup_otp → Donor verifies
  • claim.status → 'picked_up'
  • delivery.status → 'picked_up'

Volunteer delivers to recipient:
  • Recipient presents their handover_otp → Volunteer verifies
  • claim.status → 'completed'
  • delivery.status → 'delivered'
  • listing.status → 'completed'
```

#### 5.4.3 OTP Security Rules

| Rule | Detail |
|------|--------|
| OTP Length | 6 digits, cryptographically random |
| OTP Expiry | Same as listing `expires_at` |
| Max Attempts | 5 incorrect attempts → claim locked, admin notified |
| Regeneration | Claimant can request new OTP (invalidates previous) |
| Visibility | OTP visible only to claimant (RLS enforced) |

---

### 5.5 Volunteer Pickup & Logistics Management

#### 5.5.1 Volunteer Availability

- Volunteer sets status: **Available** / **Unavailable** (toggle in app header).
- Volunteer sets **service radius** (1–15 km from their current location).
- Volunteer location updated periodically (with consent) via Geolocation API.

#### 5.5.2 Delivery Task Assignment

```
Claim created with needs_delivery = true
       │
       ▼
[Edge Function: dispatchVolunteer()]
  • Query available volunteers within radius of donor location
  • Rank by: distance (nearest first), rating, active delivery count (< 2)
  • Send push notification to top 3 candidates simultaneously
       │
       ▼
First volunteer to accept gets the task
  • delivery.status = 'assigned'
  • Other candidates notified: "Task taken"
       │
       ▼
[Volunteer Delivery Flow]
  1. View task details: donor location, recipient location, route map
  2. Tap "Start Pickup" → status = 'en_route_pickup'
  3. Arrive at donor → Enter/scan pickup_otp
  4. Donor verifies → status = 'picked_up'
  5. Tap "Start Delivery" → status = 'en_route_dropoff'
  6. Arrive at recipient → Recipient verifies with handover_otp
  7. Handover complete → status = 'delivered'
```

#### 5.5.3 Logistics Dashboard (Volunteer)

| Section | Content |
|---------|---------|
| Active Tasks | Current delivery with live map, ETAs |
| Available Tasks | Nearby unclaimed delivery requests |
| History | Past deliveries with dates, distances, ratings |
| Stats | Total deliveries, total distance, meals facilitated |

---

## 6. Row-Level Security (RLS) & Data Access Requirements

> [!IMPORTANT]
> All tables have RLS **enabled**. No table is accessible without a valid policy. The Supabase `service_role` key is **never** exposed to the client.

### 6.1 Policy Matrix

#### `profiles`

| Operation | Policy | Condition |
|-----------|--------|-----------|
| SELECT | `profiles_select_own` | `auth.uid() = id` |
| SELECT | `profiles_select_public` | Always (limited columns: `id, full_name, avatar_url, role, is_verified_ngo`) |
| UPDATE | `profiles_update_own` | `auth.uid() = id` |
| DELETE | — | Not allowed (soft delete only via update) |
| INSERT | — | Via trigger on `auth.users` only |

#### `listings`

| Operation | Policy | Condition |
|-----------|--------|-----------|
| SELECT | `listings_select_available` | `status = 'available' AND deleted_at IS NULL AND expires_at > now()` (any authenticated user) |
| SELECT | `listings_select_own` | `auth.uid() = donor_id` (donor sees all own listings) |
| SELECT | `listings_select_claimed` | `auth.uid()` is the claimant of an active claim on this listing |
| INSERT | `listings_insert_donor` | `auth.uid() = donor_id AND role_from_jwt() = 'donor'` |
| UPDATE | `listings_update_donor` | `auth.uid() = donor_id` (restricted columns) |
| DELETE | — | Soft delete only |

#### `claims`

| Operation | Policy | Condition |
|-----------|--------|-----------|
| SELECT | `claims_select_involved` | `auth.uid() = claimant_id` OR `auth.uid()` is the donor of the listing OR `auth.uid()` is the assigned volunteer |
| INSERT | `claims_insert_recipient` | `auth.uid() = claimant_id AND role_from_jwt() IN ('recipient')` |
| UPDATE | `claims_update_involved` | User is claimant, donor, or assigned volunteer (status transitions validated by trigger) |

#### `deliveries`

| Operation | Policy | Condition |
|-----------|--------|-----------|
| SELECT | `deliveries_select_involved` | `auth.uid() = volunteer_id` OR user is claimant OR user is donor |
| INSERT | `deliveries_insert_system` | Only via Edge Function (service role) |
| UPDATE | `deliveries_update_volunteer` | `auth.uid() = volunteer_id` (status transitions validated) |

#### `notifications`

| Operation | Policy | Condition |
|-----------|--------|-----------|
| SELECT | `notif_select_own` | `auth.uid() = user_id` |
| UPDATE | `notif_read_own` | `auth.uid() = user_id` (only `is_read` column) |
| INSERT | — | Only via Edge Function / trigger |

#### `feedback`

| Operation | Policy | Condition |
|-----------|--------|-----------|
| SELECT | `feedback_select_public` | Any authenticated user (for transparency) |
| INSERT | `feedback_insert_involved` | `auth.uid() = from_user_id` AND user is involved in the claim |

#### `audit_log`

| Operation | Policy | Condition |
|-----------|--------|-----------|
| SELECT | `audit_select_admin` | `role_from_jwt() = 'admin'` |
| INSERT | — | Only via triggers / Edge Functions |
| UPDATE / DELETE | — | Never (immutable) |

### 6.2 Admin Override

Admin users (`role = 'admin'`) have additional policies granting `SELECT` on all tables and `UPDATE` on select columns for moderation. Admin policies check `auth.jwt() ->> 'role' = 'admin'` via custom claims set at login.

### 6.3 Helper SQL Functions

```sql
-- Extract role from JWT for use in RLS policies
CREATE OR REPLACE FUNCTION public.role_from_jwt()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT coalesce(
    current_setting('request.jwt.claims', true)::json ->> 'role',
    (SELECT role FROM public.profiles WHERE id = auth.uid())
  );
$$;

-- Check if user is involved in a claim (as claimant, donor, or volunteer)
CREATE OR REPLACE FUNCTION public.is_claim_participant(claim_uuid uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM claims c
    JOIN listings l ON l.id = c.listing_id
    LEFT JOIN deliveries d ON d.claim_id = c.id
    WHERE c.id = claim_uuid
      AND (
        c.claimant_id = auth.uid()
        OR l.donor_id = auth.uid()
        OR d.volunteer_id = auth.uid()
      )
  );
$$;
```

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint (FCP) | < 1.2 s | Vercel Analytics / Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5 s | Web Vitals |
| Time to Interactive (TTI) | < 3.5 s | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Web Vitals |
| API Response (p95) | < 300 ms | Supabase Dashboard |
| Realtime event propagation | < 500 ms | Custom telemetry |
| Map tile load | < 1 s | Mapbox metrics |

### 7.2 Scalability

| Dimension | Phase 1 Target | Phase 3 Target |
|-----------|---------------|----------------|
| Concurrent users | 500 | 10,000 |
| Database rows (listings) | 50,000 | 2,000,000 |
| Storage (photos) | 50 GB | 2 TB |
| Realtime connections | 200 | 5,000 |

### 7.3 Latency & Caching

- **PostGIS queries** — GiST indexed; query plans target < 50 ms for radius searches.
- **Next.js ISR** — Static pages (landing, about) revalidate every 60 s.
- **SWR / React Query** — Client-side cache for feed data; stale-while-revalidate pattern.
- **Image CDN** — Supabase Storage + Vercel Image Optimization; WebP/AVIF auto-format.
- **Edge Middleware** — Redirect unauthenticated users at the edge (< 10 ms).

### 7.4 Mobile Responsiveness

| Requirement | Detail |
|-------------|--------|
| Breakpoints | Mobile-first: 320px, 640px (sm), 768px (md), 1024px (lg), 1280px (xl) |
| Touch targets | Minimum 44×44 px (WCAG 2.5.5) |
| Offline support | Service Worker caches shell; shows "offline" banner; queues listing creation for retry |
| PWA | `manifest.json`, installable, splash screen, app icon |
| Native feel | Bottom navigation bar (mobile), sheet modals, pull-to-refresh |

### 7.5 Accessibility (a11y)

| Standard | Target |
|----------|--------|
| WCAG Level | 2.1 AA |
| Screen reader | Full ARIA labels on interactive elements; live regions for realtime updates |
| Keyboard navigation | All flows completable via keyboard; visible focus rings |
| Colour contrast | Minimum 4.5:1 (text), 3:1 (large text / UI components) |
| Reduced motion | `prefers-reduced-motion` respected; disable map animations |
| Language | English (Phase 1); i18n framework (`next-intl`) scaffolded for Phase 2 |

### 7.6 Security

| Area | Requirement |
|------|-------------|
| Authentication | Supabase Auth with PKCE flow; httpOnly cookies; CSRF protection |
| Authorization | RLS on every table; no client-side `service_role` key |
| Data encryption | TLS 1.3 in transit; AES-256 at rest (Supabase managed) |
| Input validation | Zod schemas on Server Actions; parameterised queries (no SQL injection) |
| File uploads | MIME type validation; max size 5 MB; virus scan (Phase 2) |
| Rate limiting | Supabase built-in + custom Edge Function rate limiter (100 req/min per user) |
| OTP security | Cryptographic randomness; 5-attempt lockout; expiry tied to listing |
| PII handling | Exact addresses visible only to confirmed claim participants; GDPR-aware deletion |

### 7.7 Food Safety Disclaimer

> [!CAUTION]
> **Legal Disclaimer (Displayed at Listing Creation & Claim Confirmation):**
>
> *"Food Bridge is a platform that connects food donors with recipients. Food Bridge does not inspect, prepare, or guarantee the safety of any food listed on this platform. Donors are solely responsible for ensuring that donated food is safe for consumption, properly stored, and accurately described. Recipients accept food at their own risk. By using this platform, you agree to our Terms of Service and Food Safety Guidelines."*

**Implementation:**
- Displayed as a dismissible but mandatory acknowledgement checkbox on:
  - First listing creation (donor)
  - First claim (recipient)
- Stored as `accepted_food_safety_disclaimer_at` on `profiles`.
- Link to full Food Safety Guidelines page (static content).

### 7.8 Reliability & Availability

| Metric | Target |
|--------|--------|
| Uptime | 99.5 % (monthly) |
| RPO (Recovery Point Objective) | 1 hour (Supabase PITR) |
| RTO (Recovery Time Objective) | 4 hours |
| Backup | Daily automated backups (Supabase Pro plan); 7-day retention |
| Error budget | 0.5 % monthly downtime ≈ 3.6 hours |

---

## 8. Phased Implementation Roadmap

### Phase Overview

```
Phase 1: MVP Core Flow           Phase 2: Logistics & Tracking      Phase 3: Analytics & Gamification
─────────────────────────        ──────────────────────────────      ──────────────────────────────────
Weeks 1–8                        Weeks 9–16                          Weeks 17–24
```

---

### Phase 1: MVP Core Flow (Weeks 1–8)

> **Goal:** End-to-end flow from food posting → discovery → claim → self-pickup handover.

| Week | Sprint | Deliverables |
|------|--------|-------------|
| 1–2 | **Foundation** | • Supabase project setup (DB, Auth, Storage) |
| | | • PostgreSQL schema migration (profiles, listings, claims) |
| | | • PostGIS extension + spatial indexes |
| | | • RLS policies for all Phase 1 tables |
| | | • Next.js project scaffold (App Router, TypeScript, Tailwind) |
| | | • shadcn/ui component library setup |
| | | • Supabase Auth integration (email + Google OAuth) |
| | | • Onboarding flow (sign up → role selection → profile setup) |
| 3–4 | **Donor Flow** | • Listing creation form (multi-step) |
| | | • Photo upload to Supabase Storage |
| | | • Address autocomplete + geocoding (Mapbox) |
| | | • Listing management dashboard (active, claimed, expired) |
| | | • Listing expiry cron job (pg_cron) |
| 5–6 | **Recipient Flow** | • Map feed with listing pins (Mapbox GL JS / Leaflet) |
| | | • List view with distance badges |
| | | • Radius filter + category/dietary filters |
| | | • Realtime subscription (new/updated/removed listings) |
| | | • Listing detail view |
| | | • Claim flow + OTP/QR generation |
| 7–8 | **Handover & Polish** | • OTP entry / QR scan verification |
| | | • Handover confirmation screen with impact stats |
| | | • In-app notifications (Supabase Realtime) |
| | | • Food safety disclaimer implementation |
| | | • Responsive design polish (mobile breakpoints) |
| | | • PWA manifest + service worker (basic shell caching) |
| | | • Error handling, loading states, empty states |
| | | • End-to-end testing (Playwright) |
| | | • **MVP Launch** 🚀 |

**Phase 1 Exit Criteria:**
- [ ] Donor can post a listing with photo, location, and expiry
- [ ] Recipient can discover listings on map within radius
- [ ] Recipient can claim and receive OTP/QR
- [ ] Donor can verify handover via OTP or QR scan
- [ ] Listing status transitions work correctly
- [ ] RLS policies pass security audit
- [ ] Lighthouse score ≥ 90 (Performance, Accessibility)

---

### Phase 2: Logistics & Tracking (Weeks 9–16)

> **Goal:** Volunteer delivery system, real-time tracking, and enhanced notifications.

| Week | Sprint | Deliverables |
|------|--------|-------------|
| 9–10 | **Volunteer Onboarding** | • Volunteer role profile setup |
| | | • Availability toggle + service radius setting |
| | | • Volunteer location tracking (Geolocation API, opt-in) |
| | | • `deliveries` table + RLS policies |
| 11–12 | **Delivery Assignment** | • "Need delivery" flag on claim flow |
| | | • Volunteer dispatch Edge Function (nearest + rating ranked) |
| | | • Push notifications to candidate volunteers (Web Push API + FCM) |
| | | • Accept/decline task flow |
| | | • Dual OTP system (pickup_otp + dropoff_otp) |
| 13–14 | **Live Tracking** | • Volunteer location broadcast (Supabase Realtime) |
| | | • Recipient sees volunteer on map (live pin) |
| | | • ETA calculation (Mapbox Directions API) |
| | | • Delivery status timeline (assigned → picked up → delivered) |
| | | • Route polyline recording |
| 15–16 | **Notifications & Feedback** | • Push notification system (FCM integration) |
| | | • Email notifications (Resend: claim alerts, delivery updates) |
| | | • `feedback` table + post-handover rating flow |
| | | • Notification preferences management |
| | | • `audit_log` implementation |
| | | • Admin moderation panel (basic) |
| | | • **Phase 2 Release** 🚀 |

**Phase 2 Exit Criteria:**
- [ ] Volunteer can set availability and receive delivery requests
- [ ] Volunteer delivery flow works end-to-end with dual OTP
- [ ] Recipient can track volunteer on map in real-time
- [ ] Push notifications delivered within 5 s of trigger event
- [ ] Post-handover feedback system operational
- [ ] Admin can view audit log and moderate flagged content

---

### Phase 3: Analytics, Gamification & Scale (Weeks 17–24)

> **Goal:** Community engagement, impact visibility, operational analytics, and scalability.

| Week | Sprint | Deliverables |
|------|--------|-------------|
| 17–18 | **Impact Dashboard** | • Donor impact page (meals donated, CO₂ saved, streak) |
| | | • Recipient stats (meals received) |
| | | • Volunteer stats (deliveries, distance, time saved) |
| | | • Platform-wide public impact counter (landing page) |
| | | • CO₂ calculation logic (based on food weight/category) |
| 19–20 | **Gamification** | • Achievement badges system |
| | | ◦ First Donation, 10 Meals, 100 Meals, Neighbourhood Hero |
| | | ◦ First Delivery, Speed Demon (< 30 min), Marathon (50+ km) |
| | | • Leaderboards (opt-in, anonymisable) |
| | | • Streak tracking (consecutive days/weeks of activity) |
| | | • In-app celebrations (confetti, milestone toasts) |
| 21–22 | **Admin Analytics** | • Admin analytics dashboard |
| | | ◦ Listings over time (created, claimed, expired) |
| | | ◦ Geographic heatmap of activity |
| | | ◦ User growth and retention cohorts |
| | | ◦ Average time-to-claim and claim-to-handover |
| | | ◦ Food category distribution |
| | | • CSV/PDF report export |
| | | • Anomaly alerts (spike in cancellations, etc.) |
| 23–24 | **Scale & Optimise** | • Multi-language support (next-intl: Hindi, Tamil, etc.) |
| | | • Advanced search (fuzzy text search via pg_trgm) |
| | | • Image virus scanning (ClamAV via Edge Function) |
| | | • Performance optimisation (query tuning, connection pooling) |
| | | • Load testing (k6: 1000 concurrent users) |
| | | • Security audit + penetration testing |
| | | • Documentation & API reference |
| | | • Native mobile app evaluation (React Native / Expo) |
| | | • **Phase 3 Release** 🚀 |

**Phase 3 Exit Criteria:**
- [ ] Impact dashboards live for all roles
- [ ] Gamification badges awarding correctly
- [ ] Admin analytics dashboard with all specified metrics
- [ ] i18n framework operational with at least 2 languages
- [ ] Load test passes at 1000 concurrent users
- [ ] Security audit completed with no critical findings

---

## 9. Appendices

### Appendix A: Glossary

| Term | Definition |
|------|-----------|
| **Listing** | A post by a donor describing surplus food available for pickup |
| **Claim** | A recipient's assertion that they will pick up (or receive delivery of) a listing |
| **Handover** | The physical transfer of food, verified via OTP or QR code |
| **OTP** | One-Time Password — a 6-digit code used to verify handovers |
| **RLS** | Row-Level Security — PostgreSQL feature that restricts data access per row |
| **PostGIS** | PostgreSQL extension for geographic data types and spatial queries |
| **PWA** | Progressive Web App — installable web app with native-like capabilities |
| **RSC** | React Server Components — components rendered on the server |
| **FAB** | Floating Action Button — primary CTA button anchored to screen edge |

### Appendix B: Enum Definitions

```sql
-- User roles
CREATE TYPE user_role AS ENUM ('donor', 'recipient', 'volunteer', 'admin');

-- Food categories
CREATE TYPE food_category AS ENUM (
  'cooked_meal', 'raw_ingredients', 'packaged',
  'bakery', 'beverages', 'other'
);

-- Listing statuses
CREATE TYPE listing_status AS ENUM (
  'available', 'claimed', 'in_transit',
  'completed', 'expired', 'cancelled'
);

-- Claim statuses
CREATE TYPE claim_status AS ENUM (
  'pending', 'approved', 'picked_up',
  'completed', 'cancelled', 'expired'
);

-- Delivery statuses
CREATE TYPE delivery_status AS ENUM (
  'assigned', 'en_route_pickup', 'picked_up',
  'en_route_dropoff', 'delivered', 'cancelled'
);

-- Notification types
CREATE TYPE notification_type AS ENUM (
  'claim_received', 'claim_approved', 'delivery_assigned',
  'handover_complete', 'listing_expired', 'system'
);
```

### Appendix C: API / Server Action Inventory (Phase 1)

| Action | Input | Output | Auth |
|--------|-------|--------|------|
| `signUp` | email, password, role | session | Public |
| `signIn` | email, password | session | Public |
| `completeProfile` | name, phone, address, location | profile | Authenticated |
| `createListing` | title, category, qty, photos, location, expiry... | listing | Donor |
| `updateListing` | listingId, partial fields | listing | Donor (owner) |
| `cancelListing` | listingId | void | Donor (owner) |
| `getListingsFeed` | lat, lng, radius, filters | listing[] | Authenticated |
| `getListingDetail` | listingId | listing + donor info | Authenticated |
| `claimListing` | listingId, needsDelivery | claim (with OTP) | Recipient |
| `cancelClaim` | claimId, reason | void | Claimant |
| `verifyHandover` | claimId, otp \| qrToken | void | Donor |
| `getMyListings` | status filter | listing[] | Donor |
| `getMyClaims` | status filter | claim[] | Recipient |
| `getNotifications` | cursor | notification[] | Authenticated |
| `markNotificationRead` | notificationId | void | Owner |

### Appendix D: Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # Server-side only, NEVER exposed to client

# Mapbox
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ...

# Push Notifications (FCM)
FCM_SERVER_KEY=AAAA...
NEXT_PUBLIC_FCM_VAPID_KEY=BG...

# Email (Resend)
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=https://foodbridge.app
NEXT_PUBLIC_APP_NAME=Food Bridge
```

### Appendix E: References

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [PostGIS Reference](https://postgis.net/docs/)
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- [FAO Food Waste Data](https://www.fao.org/food-loss-and-food-waste/en/)

---

> **Document Control**
>
> | Version | Date | Author | Changes |
> |---------|------|--------|---------|
> | 1.0 | 2026-10-14 | Product & Architecture Team | Initial PRD |

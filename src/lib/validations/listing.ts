/**
 * Zod validation schemas for food listings.
 * Validates listing creation and updates across client and server boundaries.
 *
 * @module lib/validations/listing
 */

import { z } from 'zod';
import type { FoodCategory as DBFoodCategory } from '@/types/database';

/**
 * Predefined food category enum values matching database enum `food_category`.
 */
export const foodCategoryEnum = z.enum([
  'cooked_meal',
  'raw_ingredients',
  'packaged',
  'bakery',
  'beverages',
  'other',
]) satisfies z.ZodType<DBFoodCategory>;

export type FoodCategory = z.infer<typeof foodCategoryEnum>;

/**
 * Common dietary tags accepted across the platform.
 */
export const DIETARY_TAG_OPTIONS = [
  'vegetarian',
  'vegan',
  'halal',
  'kosher',
  'gluten_free',
  'dairy_free',
  'nut_free',
] as const;

/**
 * Geographic coordinates schema.
 */
export const locationSchema = z.object({
  lat: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  lng: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
});

/**
 * Base schema containing all listing field definitions.
 */
export const listingBaseSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(120, 'Title cannot exceed 120 characters'),
  category: foodCategoryEnum,
  quantity_servings: z.coerce
    .number()
    .int('Quantity must be an integer')
    .positive('Quantity must be greater than 0'),
  dietary_tags: z.array(z.string()).optional().default([]),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .nullable(),
  photo_urls: z.array(z.string()).optional().default([]),
  pickup_address: z
    .string()
    .min(1, 'Pickup address is required'),
  pickup_instructions: z
    .string()
    .max(200, 'Pickup instructions cannot exceed 200 characters')
    .optional()
    .nullable(),
  prepared_at: z.coerce.date(),
  expires_at: z.coerce.date(),
  is_delivery_available: z.boolean().optional().default(false),
  location: locationSchema,
});

/**
 * Schema for creating a new food listing.
 * Enforces that `expires_at` is at least 30 minutes in the future.
 */
export const listingCreateSchema = listingBaseSchema.refine(
  (data) => {
    const minExpiryTime = Date.now() + 30 * 60 * 1000 - 5000;
    return data.expires_at.getTime() >= minExpiryTime;
  },
  {
    message: 'Expiry time must be at least 30 minutes in the future',
    path: ['expires_at'],
  }
);

/**
 * Schema for updating an existing food listing.
 */
export const listingUpdateSchema = listingBaseSchema.partial().refine(
  (data) => {
    if (data.expires_at) {
      const minExpiryTime = Date.now() + 30 * 60 * 1000 - 5000;
      return data.expires_at.getTime() >= minExpiryTime;
    }
    return true;
  },
  {
    message: 'Expiry time must be at least 30 minutes in the future',
    path: ['expires_at'],
  }
);

export type ListingCreateInput = z.infer<typeof listingCreateSchema>;
export type ListingUpdateInput = z.infer<typeof listingUpdateSchema>;
export type LocationInput = z.infer<typeof locationSchema>;

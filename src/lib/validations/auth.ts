/**
 * Zod validation schemas for authentication and user profile management.
 *
 * @module lib/validations/auth
 */

import { z } from 'zod';
import type { UserRole as DBUserRole } from '@/types/database';

/**
 * Predefined user roles enum matching database enum `user_role`.
 */
export const userRoleEnum = z.enum([
  'donor',
  'recipient',
  'volunteer',
  'admin',
]) satisfies z.ZodType<DBUserRole>;

export type UserRole = z.infer<typeof userRoleEnum>;

/**
 * Schema for new user registration.
 */
export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password cannot exceed 100 characters'),
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters long')
    .max(100, 'Full name cannot exceed 100 characters')
    .trim(),
  role: userRoleEnum,
});

/**
 * Schema for existing user sign-in.
 */
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required'),
});

/**
 * Schema for updating user profile attributes.
 */
export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters long')
    .max(100, 'Full name cannot exceed 100 characters')
    .trim()
    .optional(),
  phone: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      'Please enter a valid phone number (e.g. +1234567890)'
    )
    .optional()
    .nullable()
    .or(z.literal('')),
  address_line: z
    .string()
    .max(255, 'Address line cannot exceed 255 characters')
    .trim()
    .optional()
    .nullable()
    .or(z.literal('')),
  city: z
    .string()
    .max(100, 'City cannot exceed 100 characters')
    .trim()
    .optional()
    .nullable()
    .or(z.literal('')),
  state: z
    .string()
    .max(100, 'State cannot exceed 100 characters')
    .trim()
    .optional()
    .nullable()
    .or(z.literal('')),
  avatar_url: z
    .string()
    .url('Avatar must be a valid URL')
    .optional()
    .nullable()
    .or(z.literal('')),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

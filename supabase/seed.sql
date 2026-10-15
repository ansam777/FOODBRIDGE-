-- Supabase Storage Buckets for Food Bridge
-- Run this after initial Supabase project setup

-- Bucket for food listing photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'food-photos',
  'food-photos',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket for user avatar images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies

-- Food photos: anyone authenticated can read, donors can upload/delete their own
CREATE POLICY "food_photos_select" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'food-photos');

CREATE POLICY "food_photos_insert" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'food-photos'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "food_photos_delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'food-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Avatars: anyone can read, users can upload/delete their own
CREATE POLICY "avatars_select" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

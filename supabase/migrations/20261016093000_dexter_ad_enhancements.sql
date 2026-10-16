-- ==============================================================================
-- DEXTER MEN'S CLOTHING — ADVERTISEMENT ENHANCEMENTS & ANALYTICS MIGRATION
-- Migration: 20261016093000_dexter_ad_enhancements.sql
-- ==============================================================================

ALTER TABLE public.advertisements
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS campaign_category TEXT DEFAULT 'Streetwear',
  ADD COLUMN IF NOT EXISTS offer_percentage NUMERIC,
  ADD COLUMN IF NOT EXISTS original_price NUMERIC,
  ADD COLUMN IF NOT EXISTS promotional_price NUMERIC,
  ADD COLUMN IF NOT EXISTS associated_products JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS associated_categories JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS promotional_badge TEXT,
  ADD COLUMN IF NOT EXISTS impressions INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_advertisements_category ON public.advertisements(campaign_category);

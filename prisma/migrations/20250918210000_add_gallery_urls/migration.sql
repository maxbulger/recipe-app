-- Add galleryUrls column to recipes
ALTER TABLE "public"."recipes"
ADD COLUMN "galleryUrls" TEXT[] NOT NULL DEFAULT '{}';


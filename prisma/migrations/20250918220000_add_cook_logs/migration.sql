-- Add cookLogs JSONB column with an empty array default
ALTER TABLE "public"."recipes"
ADD COLUMN "cookLogs" JSONB NOT NULL DEFAULT '[]';


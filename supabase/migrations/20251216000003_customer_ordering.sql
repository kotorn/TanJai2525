-- Add special_instructions to orders table
ALTER TABLE "public"."orders" 
ADD COLUMN IF NOT EXISTS "special_instructions" TEXT;

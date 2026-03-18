DROP INDEX IF EXISTS "audit_log_created_at_idx";--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN IF NOT EXISTS "entity_id" integer;--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN IF NOT EXISTS "old_values" jsonb;--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN IF NOT EXISTS "new_values" jsonb;--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "audit_log" DROP COLUMN IF EXISTS "entityId";--> statement-breakpoint
ALTER TABLE "audit_log" DROP COLUMN IF EXISTS "oldValues";--> statement-breakpoint
ALTER TABLE "audit_log" DROP COLUMN IF EXISTS "newValues";--> statement-breakpoint
ALTER TABLE "audit_log" DROP COLUMN IF EXISTS "createdAt";

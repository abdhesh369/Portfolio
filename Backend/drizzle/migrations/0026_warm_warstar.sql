DROP INDEX "audit_log_created_at_idx";--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "entity_id" integer;--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "old_values" jsonb;--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "new_values" jsonb;--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "audit_log" DROP COLUMN "entityId";--> statement-breakpoint
ALTER TABLE "audit_log" DROP COLUMN "oldValues";--> statement-breakpoint
ALTER TABLE "audit_log" DROP COLUMN "newValues";--> statement-breakpoint
ALTER TABLE "audit_log" DROP COLUMN "createdAt";
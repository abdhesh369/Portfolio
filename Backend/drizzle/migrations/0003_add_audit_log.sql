-- TICKET-032: Append-only audit log table
CREATE TABLE IF NOT EXISTS "audit_log" (
  "id" serial PRIMARY KEY,
  "action" varchar(20) NOT NULL,
  "entity" varchar(50) NOT NULL,
  "entity_id" integer,
  "old_values" jsonb,
  "new_values" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "audit_log_entity_idx" ON "audit_log" ("entity");
CREATE INDEX IF NOT EXISTS "audit_log_created_at_idx" ON "audit_log" ("created_at");

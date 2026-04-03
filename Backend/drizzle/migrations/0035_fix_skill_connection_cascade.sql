-- Manual migration to fix skill_connections foreign key constraints to ON DELETE CASCADE
-- This replaces the incorrect 'no action' from migration 0017

ALTER TABLE "skill_connections" DROP CONSTRAINT IF EXISTS "skill_connections_fromSkillId_skills_id_fk";
ALTER TABLE "skill_connections" DROP CONSTRAINT IF EXISTS "skill_connections_toSkillId_skills_id_fk";

ALTER TABLE "skill_connections" ADD CONSTRAINT "skill_connections_fromSkillId_skills_id_fk" 
FOREIGN KEY ("fromSkillId") REFERENCES "public"."skills"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "skill_connections" ADD CONSTRAINT "skill_connections_toSkillId_skills_id_fk" 
FOREIGN KEY ("toSkillId") REFERENCES "public"."skills"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Migration 0022: Add isAdmin column to client_feedback
ALTER TABLE "client_feedback" ADD COLUMN "isAdmin" boolean DEFAULT false NOT NULL;

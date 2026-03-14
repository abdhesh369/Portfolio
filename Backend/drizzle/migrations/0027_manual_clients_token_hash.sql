ALTER TABLE "clients" ADD COLUMN "tokenHash" varchar(255);
CREATE INDEX "clients_token_hash_idx" ON "clients" USING btree ("tokenHash");
ALTER TABLE "clients" ADD CONSTRAINT "clients_tokenHash_unique" UNIQUE("tokenHash");

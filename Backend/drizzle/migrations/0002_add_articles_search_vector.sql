-- TICKET-029: Add tsvector column for full-text search on articles
ALTER TABLE articles ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS articles_search_idx ON articles USING GIN(search_vector);

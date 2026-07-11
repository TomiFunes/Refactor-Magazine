ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS excerpt_en text,
  ADD COLUMN IF NOT EXISTS content_en text;

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS name_en text;
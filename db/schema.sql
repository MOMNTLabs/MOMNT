CREATE TABLE IF NOT EXISTS categories (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  eyebrow TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  hero_image TEXT NOT NULL DEFAULT '',
  highlight_in_nav BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL REFERENCES categories(key) ON UPDATE CASCADE,
  category_label TEXT NOT NULL DEFAULT '',
  price TEXT NOT NULL DEFAULT 'Sob consulta',
  badge TEXT NOT NULL DEFAULT 'Novo',
  badge_tone TEXT NOT NULL DEFAULT 'neutral',
  short_description TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  materials TEXT NOT NULL DEFAULT '',
  availability TEXT NOT NULL DEFAULT 'Em preparação',
  dimensions TEXT NOT NULL DEFAULT '',
  stock_quantity INTEGER,
  whatsapp_text TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stock_quantity INTEGER;

CREATE TABLE IF NOT EXISTS product_images (
  product_slug TEXT NOT NULL REFERENCES products(slug) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (product_slug, sort_order)
);

CREATE TABLE IF NOT EXISTS product_highlights (
  product_slug TEXT NOT NULL REFERENCES products(slug) ON DELETE CASCADE,
  text TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (product_slug, sort_order)
);

CREATE TABLE IF NOT EXISTS site_content (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT site_content_singleton CHECK (id)
);

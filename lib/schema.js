// Tabelas do Borali. É executado de forma idempotente na primeira requisição.
export const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('user', 'guide')),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tours (
  id SERIAL PRIMARY KEY,
  guide_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL,
  starts_at TIMESTAMP NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 120,
  price_cents INT NOT NULL DEFAULT 0,
  capacity INT NOT NULL DEFAULT 10,
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  tour_id INT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seats INT NOT NULL CHECK (seats > 0),
  status TEXT NOT NULL DEFAULT 'confirmada' CHECK (status IN ('confirmada', 'cancelada')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  tour_id INT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tour_rating INT NOT NULL CHECK (tour_rating BETWEEN 1 AND 5),
  guide_rating INT NOT NULL CHECK (guide_rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tour_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tours_guide ON tours(guide_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tour ON bookings(tour_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
`;

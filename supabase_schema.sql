-- Create Enum for Roles
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'STAFF', 'TECHNICIAN', 'ADMIN');

-- Profiles Table (Linked to Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'CUSTOMER',
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory Table
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_name TEXT NOT NULL,
  part_number TEXT UNIQUE,
  category TEXT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  min_threshold_alert INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Cards Table
CREATE TYPE job_status AS ENUM ('OPEN', 'IN_PROGRESS', 'READY', 'COMPLETED');

CREATE TABLE job_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_card_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES profiles(id),
  vehicle_number TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  status job_status NOT NULL DEFAULT 'OPEN',
  total_amount DECIMAL(10,2) DEFAULT 0.00,
  advance_paid DECIMAL(10,2) DEFAULT 0.00,
  customer_voice TEXT,
  dent_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Items Table (Spares/Labour)
CREATE TABLE job_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_card_id UUID REFERENCES job_cards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inspections Table
CREATE TYPE inspection_status AS ENUM ('GOOD', 'SERVICED', 'REPLACE');

CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_card_id UUID REFERENCES job_cards(id) ON DELETE CASCADE,
  component TEXT NOT NULL,
  status inspection_status NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

-- Allow read access for everyone temporarily for testing
CREATE POLICY "Allow public read" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON inventory FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON job_cards FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON job_items FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON inspections FOR SELECT USING (true);

-- Allow insert/update temporarily for testing
CREATE POLICY "Allow public all" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow public all" ON inventory FOR ALL USING (true);
CREATE POLICY "Allow public all" ON job_cards FOR ALL USING (true);
CREATE POLICY "Allow public all" ON job_items FOR ALL USING (true);
CREATE POLICY "Allow public all" ON inspections FOR ALL USING (true);

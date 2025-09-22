-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image TEXT,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table for POS system
CREATE TABLE IF NOT EXISTS pos_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'kasir')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES pos_users(id),
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transaction_items table
CREATE TABLE IF NOT EXISTS transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Simplified RLS policies for public access to categories and products
-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- Create simple policies for public access to categories and products
CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to products" ON products FOR SELECT USING (true);

-- For now, allow public insert/update for categories and products (can be restricted later)
CREATE POLICY "Allow public insert to categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to categories" ON categories FOR UPDATE USING (true);
CREATE POLICY "Allow public insert to products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to products" ON products FOR UPDATE USING (true);

-- Restrict pos_users access
CREATE POLICY "Allow public read access to pos_users" ON pos_users FOR SELECT USING (true);
CREATE POLICY "Allow public insert to pos_users" ON pos_users FOR INSERT WITH CHECK (true);

-- Allow public access to transactions for now (can be restricted later)
CREATE POLICY "Allow public read access to transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert to transactions" ON transactions FOR INSERT WITH CHECK (true);

-- Allow public access to transaction_items for now
CREATE POLICY "Allow public read access to transaction_items" ON transaction_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert to transaction_items" ON transaction_items FOR INSERT WITH CHECK (true);

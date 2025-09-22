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

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- Create policies for categories (public read)
CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow owner to manage categories" ON categories FOR ALL USING (
  EXISTS (
    SELECT 1 FROM pos_users 
    WHERE id = auth.uid() AND role = 'owner'
  )
);

-- Create policies for products (public read)
CREATE POLICY "Allow public read access to products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow owner to manage products" ON products FOR ALL USING (
  EXISTS (
    SELECT 1 FROM pos_users 
    WHERE id = auth.uid() AND role = 'owner'
  )
);

-- Create policies for pos_users (restricted access)
CREATE POLICY "Allow users to view their own data" ON pos_users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Allow owner to manage all users" ON pos_users FOR ALL USING (
  EXISTS (
    SELECT 1 FROM pos_users 
    WHERE id = auth.uid() AND role = 'owner'
  )
);

-- Create policies for transactions
CREATE POLICY "Allow users to view their own transactions" ON transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Allow users to create their own transactions" ON transactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Allow owner to view all transactions" ON transactions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM pos_users 
    WHERE id = auth.uid() AND role = 'owner'
  )
);

-- Create policies for transaction_items
CREATE POLICY "Allow users to view transaction items for their transactions" ON transaction_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM transactions 
    WHERE id = transaction_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Allow users to create transaction items for their transactions" ON transaction_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM transactions 
    WHERE id = transaction_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Allow owner to view all transaction items" ON transaction_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM pos_users 
    WHERE id = auth.uid() AND role = 'owner'
  )
);

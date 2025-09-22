-- Drop existing policies that rely on auth.uid()
DROP POLICY IF EXISTS "Allow public read access to categories" ON categories;
DROP POLICY IF EXISTS "Allow owner to manage categories" ON categories;
DROP POLICY IF EXISTS "Allow public read access to products" ON products;
DROP POLICY IF EXISTS "Allow owner to manage products" ON products;
DROP POLICY IF EXISTS "Allow users to view their own data" ON pos_users;
DROP POLICY IF EXISTS "Allow owner to manage all users" ON pos_users;
DROP POLICY IF EXISTS "Allow users to view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Allow users to create their own transactions" ON transactions;
DROP POLICY IF EXISTS "Allow owner to view all transactions" ON transactions;
DROP POLICY IF EXISTS "Allow users to view transaction items for their transactions" ON transaction_items;
DROP POLICY IF EXISTS "Allow users to create transaction items for their transactions" ON transaction_items;
DROP POLICY IF EXISTS "Allow owner to view all transaction items" ON transaction_items;

-- Create simpler policies that allow public read access for POS system
-- Allow public read access to categories and products for the POS system
CREATE POLICY "Allow read access to categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow read access to products" ON products FOR SELECT USING (true);

-- Allow read access to pos_users for authentication
CREATE POLICY "Allow read access to pos_users" ON pos_users FOR SELECT USING (true);

-- Allow public access to transactions and transaction_items for now
-- In production, you would want more restrictive policies
CREATE POLICY "Allow read access to transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Allow insert access to transactions" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read access to transaction_items" ON transaction_items FOR SELECT USING (true);
CREATE POLICY "Allow insert access to transaction_items" ON transaction_items FOR INSERT WITH CHECK (true);

-- Insert categories
INSERT INTO categories (name, icon) VALUES
('Makanan', 'UtensilsCrossed'),
('Minuman', 'Coffee'),
('Snack', 'Cookie')
ON CONFLICT DO NOTHING;

-- Insert products with Indonesian prices (converted from USD to IDR at 15,000 rate)
INSERT INTO products (name, price, image, category_id) VALUES
('Burger Klasik', 120000.00, '/classic-beef-burger.png', (SELECT id FROM categories WHERE name = 'Makanan' LIMIT 1)),
('Pizza Lezat', 180000.00, '/delicious-pizza.png', (SELECT id FROM categories WHERE name = 'Makanan' LIMIT 1)),
('Salad Segar', 90000.00, '/vibrant-mixed-salad.png', (SELECT id FROM categories WHERE name = 'Makanan' LIMIT 1)),
('Sayap Ayam Krispy', 105000.00, '/crispy-chicken-wings.png', (SELECT id FROM categories WHERE name = 'Makanan' LIMIT 1)),
('Kentang Goreng', 60000.00, '/crispy-french-fries.png', (SELECT id FROM categories WHERE name = 'Snack' LIMIT 1)),
('Cola Segar', 30000.00, '/refreshing-cola.png', (SELECT id FROM categories WHERE name = 'Minuman' LIMIT 1)),
('Es Teh', 25000.00, '/iced-tea.png', (SELECT id FROM categories WHERE name = 'Minuman' LIMIT 1)),
('Jus Jeruk', 35000.00, '/glass-of-orange-juice.png', (SELECT id FROM categories WHERE name = 'Minuman' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Insert default users (passwords should be hashed in production)
INSERT INTO pos_users (username, password, role) VALUES
('owner', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'owner'), -- password: owner123
('kasir', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'kasir')  -- password: kasir123
ON CONFLICT DO NOTHING;

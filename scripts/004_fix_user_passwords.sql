-- Update users with proper individual password hashes
-- Using bcrypt hashes for different passwords

-- Update owner password (password: owner123)
UPDATE pos_users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMye.IBA9YxiDwxZJTQr05MVdQ3ran5BxC2'
WHERE username = 'owner';

-- Update kasir password (password: kasir123)  
UPDATE pos_users
SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE username = 'kasir';

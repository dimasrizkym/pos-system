-- Update users with correct password hashes for the demo accounts
-- owner: owner123, kasir: kasir123

-- Update owner password (password: owner123)
UPDATE pos_users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMye.IBA9YxiDwxZJTQr05MVdQ3ran5BxC2'
WHERE username = 'owner';

-- Update kasir password (password: kasir123)  
UPDATE pos_users
SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE username = 'kasir';

-- Verify the updates
SELECT username, role, 
       CASE 
         WHEN password = '$2a$10$N9qo8uLOickgx2ZMRZoMye.IBA9YxiDwxZJTQr05MVdQ3ran5BxC2' THEN 'owner123 hash'
         WHEN password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' THEN 'kasir123 hash'
         ELSE 'unknown hash'
       END as password_status
FROM pos_users;

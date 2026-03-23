CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'student',
  regulation TEXT,
  year TEXT,
  semester TEXT,
  leetcode_url TEXT,
  github_url TEXT,
  custom_links JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  regulation TEXT NOT NULL,
  year TEXT NOT NULL,
  semester TEXT NOT NULL,
  subject TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a default admin user (password is 'admin123' bcrypt hashed, but let's just do it in the backend logic instead of seed logic because of bcrypt, OR I can seed an MD5/hash).
-- Wait, I will just create the default admin user within backend startup logic to handle bcrypt properly.

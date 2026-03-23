const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize uploads dir
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Ensure Admin User Exists
const initAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@easynotes.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const { rows } = await db.query('SELECT * FROM profiles WHERE role = $1', ['admin']);
    if (rows.length === 0) {
      const hashedPass = await bcrypt.hash(adminPassword, 10);
      await db.query(`
        INSERT INTO profiles (email, password, role)
        VALUES ($1, $2, $3)
      `, [adminEmail, hashedPass, 'admin']);
      console.log('Admin user created/verified successfully.');
    }
  } catch (err) {
    if (err.code === '42P01') {
      console.log('Tables not created yet, skipping admin init. Start DB first and optionally restart server.');
    } else {
      console.error('Error initializing admin:', err);
    }
  }
};
initAdmin();

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token.' });
    req.user = user;
    next();
  });
};

const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
};

// --- AUTH ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const checkUser = await db.query('SELECT * FROM profiles WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) return res.status(400).json({ error: 'User already exists' });

    // Admins cannot register via UI as per requirement. All clean signups are students.
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO profiles (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role, regulation, year, semester',
      [email, hashedPassword, 'student']
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ token, user, message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM profiles WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });

    // Don't send password hash back
    delete user.password;
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- PROFILE ROUTES ---
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT id, email, role, regulation, year, semester, leetcode_url, github_url, custom_links, created_at FROM profiles WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Profile not found' });
    res.json({ profile: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  const { regulation, year, semester, leetcode_url, github_url, custom_links } = req.body;
  try {
    const result = await db.query(`
      UPDATE profiles
      SET regulation = $1, year = $2, semester = $3, leetcode_url = $4, github_url = $5, custom_links = $6
      WHERE id = $7
      RETURNING id, email, role, regulation, year, semester, leetcode_url, github_url, custom_links
    `, [regulation, year, semester, leetcode_url, github_url, custom_links ? JSON.stringify(custom_links) : '[]', req.user.id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Profile not found' });
    res.json({ profile: result.rows[0], message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- FILES ROUTES ---

// Multer Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { regulation, year, semester, subject } = req.body;
    let uploadPath = path.join(__dirname, 'uploads');

    if (regulation && year && semester && subject) {
      uploadPath = path.join(uploadPath, regulation, year, semester, subject);
    } else {
      uploadPath = path.join(uploadPath, 'uncategorized');
    }

    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage: storage });

app.get('/api/files', authenticateToken, async (req, res) => {
  try {
    let query = 'SELECT * FROM files';
    let values = [];

    if (req.user.role === 'student') {
      // Students see only their applicable files
      const userProfile = await db.query('SELECT regulation, year, semester FROM profiles WHERE id = $1', [req.user.id]);
      const profile = userProfile.rows[0];

      if (!profile.regulation || !profile.year || !profile.semester) {
        return res.json({ files: [], isProfileIncomplete: true });
      }

      query += ' WHERE regulation = $1 AND year = $2 AND semester = $3';
      values = [profile.regulation, profile.year, profile.semester];
    }

    query += ' ORDER BY created_at DESC';
    const result = await db.query(query, values);
    res.json({ files: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/files', authenticateToken, authorizeAdmin, upload.single('file'), async (req, res) => {
  try {
    const { title, description, regulation, year, semester, subject } = req.body;

    // ✅ Validate file
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // ✅ Validate required fields
    if (!regulation || !year || !semester || !subject) {
      return res.status(400).json({ error: 'Missing categorization fields' });
    }

    // ✅ Optional: fallback title
    const safeTitle = title || req.file.originalname;

    // ✅ Ensure user exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Invalid user token' });
    }

    // ✅ File URL
    const fileUrl = `/uploads/${regulation}/${year}/${semester}/${subject}/${req.file.filename}`;

    // ✅ Insert into DB
    const result = await db.query(
      `INSERT INTO files (title, description, file_url, regulation, year, semester, subject, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        safeTitle,
        description || '',
        fileUrl,
        regulation,
        year,
        semester,
        subject,
        req.user.id
      ]
    );

    res.status(201).json({
      file: result.rows[0],
      message: 'File uploaded successfully'
    });

  } catch (err) {
    console.error('UPLOAD ERROR:', err);
    res.status(500).json({
      error: err.message || 'Server error'
    });
  }
});

app.put('/api/files/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  // Simple metadata edit for now. File replacement is complex with multer in PUT, assume separate file update endpoint or full delete+upload.
  const { title, description, regulation, year, semester, subject } = req.body;
  try {
    const result = await db.query(`
      UPDATE files 
      SET title = COALESCE($1, title), description = COALESCE($2, description),
    regulation = COALESCE($3, regulation), year = COALESCE($4, year),
    semester = COALESCE($5, semester), subject = COALESCE($6, subject)
      WHERE id = $7 RETURNING *
    `, [title, description, regulation, year, semester, subject, req.params.id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'File not found' });
    res.json({ file: result.rows[0], message: 'File metadata updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/files/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const fileRecord = await db.query('SELECT file_url FROM files WHERE id = $1', [req.params.id]);
    if (fileRecord.rows.length === 0) return res.status(404).json({ error: 'File not found' });

    const filePath = path.join(__dirname, fileRecord.rows[0].file_url.replace('/uploads', 'uploads'));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await db.query('DELETE FROM files WHERE id = $1', [req.params.id]);
    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- AI CHAT ---
const OpenAI = require('openai');

app.post('/api/ai/chat', authenticateToken, async (req, res) => {
  const { message, mode, subject, unit } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    let systemPrompt = 'You are a helpful AI tutor for a university student.';
    let contextStr = '';
    if (subject && subject !== 'None') contextStr += `Subject Context: ${subject}. `;
    if (unit && unit !== 'None') contextStr += `Unit Context: ${unit}. `;

    if (mode === 'quick_revision') {
      systemPrompt = `You are an expert tutor. Provide a Quick Revision output. Format with a main heading, and subheadings using Markdown. Each heading must have exactly 1 line or half-line explanation. Keep content VERY concise, easy to scan, and structured like short bulleted notes. ${contextStr}`;
    } else if (mode === 'detailed_explanation') {
      systemPrompt = `You are an expert tutor. Provide a Detailed Explanation suitable for exam-ready 10-mark long-form answers. Use a clear structured hierarchy with Markdown headings. Each section must include clear explanations and key points. Add a distinct Summary section at the end. ${contextStr}`;
    } else if (mode === 'practice_mode') {
      systemPrompt = `You are an examiner testing a student. Provide Practice Mode testing. Generate random questions covering the syllabus context. Include a mix of short answers, long answers, and conceptual questions (easy/medium/hard). Do not answer the questions immediately, just ask them. ${contextStr}`;
    } else {
      // Default Q&A Mode
      systemPrompt = `You are a direct Q&A tutor. Answer the user's questions clearly and concisely. By default, keep your answers to about 2 lines unless the user explicitly asks for more detail. ${contextStr}`;
    }

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      model: 'gpt-4o-mini',
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error('OpenAI Error:', err.message);
    res.status(500).json({ error: 'Failed to communicate with AI service. Check API key.' });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
});
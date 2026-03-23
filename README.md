# 📘 EasyNotes - Your Smart Academic Companion

![EasyNotes Hero Banner](assets/hero_banner.png)

EasyNotes is a sophisticated, full-stack academic resource platform designed to bridge the gap between students and high-quality study materials. With a focus on modern UI/UX, seamless organization, and AI-powered assistance, EasyNotes provides an unparalleled experience for both students and administrators.

---

## ✨ Key Features

### 🎓 Student Experience
- **Personalized Dashboard**: Access notes tailored to your Regulation, Year, and Semester.
- **Smart Search**: Find exactly what you need with dynamic, real-time searching and filtering.
- **Dynamic Profiles**: Showcase your academic and coding presence with integrated LeetCode, GitHub, and custom social links.
- **Meera AI Tutor**: An integrated GPT-powered assistant to clarify subject-specific doubts instantly.

### 🛠️ Administrator Power
- **Intuitive Uploads**: Seamlessly categorize and upload PDF/Doc resources into a hierarchical structure.
- **Resource Management**: Complete CRUD operations for all uploaded materials.
- **Automatic Organization**: Files are physically organized on the server based on academic categories.
- **Secure Access**: Robust role-based access control ensuring only authorized personnel manage the content.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) (Vite)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router v6](https://reactrouter.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Auth**: JWT (JSON Web Tokens) & Bcrypt
- **Storage**: [Multer](https://github.com/expressjs/multer) for local filesystem management
- **AI Integration**: [OpenAI API](https://openai.com/) (GPT-4o-mini)

---

## 🛠️ Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16.x or higher)
- [Docker](https://www.docker.com/) (Recommended for Database) or local [PostgreSQL](https://www.postgresql.org/)

### 2. Database Setup

**Using Docker (Fastest):**
```bash
docker compose up -d
```

**Using Local PostgreSQL:**
1. Create a database named `easynotes`.
2. Update the `DATABASE_URL` in `backend/.env`.
3. (Optional) Run `backend/init.sql` manually.

### 3. Backend Configuration
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/easynotes
   JWT_SECRET=your_super_secret_key
   OPENAI_API_KEY=your_openai_api_key
   ADMIN_EMAIL=admin@easynotes.com
   ADMIN_PASSWORD=admin123
   ```
4. Initialize the database schema:
   ```bash
   npm run setup
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### 4. Frontend Configuration
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## 📂 Project Structure

```text
EasyNotes1/
├── assets/             # Project-wide visual assets
├── backend/            # Express.js Server & Database Logic
│   ├── uploads/        # Categorized physical file storage
│   ├── server.js       # Main API entry point
│   └── db.js           # Database connection
└── frontend/           # React.js SPA
    ├── src/
    │   ├── pages/      # View components
    │   ├── store/      # Zustand state management
    │   └── components/ # Reusable UI elements
    └── tailwind.config.js
```

---

## 👤 Role Access

| Role | Access URL | Default Credentials |
| :--- | :--- | :--- |
| **Student** | `/signup` | Create your own account |
| **Admin** | `/login` | `admin@easynotes.com` / `admin123` |

---

## 🗺️ Roadmap
- [ ] Mobile App (React Native)
- [ ] Push Notifications for new note uploads
- [ ] Discussion Forums for subjects
- [ ] In-browser PDF Annotation tool
- [ ] Dark Mode toggle (System preference integration)

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

Developed with ❤️ for Students.

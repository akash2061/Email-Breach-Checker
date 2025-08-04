# Email Breach Checker 🔐

A full-stack MERN application that allows users to check if their email addresses have been compromised in data breaches. The application provides detailed breach information, security analytics, and user authentication with search limitations for non-authenticated users.

## 🌟 Features

- **Email Breach Detection**: Check if an email has been compromised in known data breaches
- **Detailed Analytics**: View comprehensive breach information including:
  - Total breaches and exposed records
  - Risk assessment and security scores
  - Password strength analysis
  - Yearly breach timeline
  - Exposed data categories
- **User Authentication**: Login/Signup functionality with JWT tokens
- **Search Limitations**: Non-authenticated users limited to 5 searches
- **Responsive Design**: Modern dark theme with Tailwind CSS
- **Real-time Results**: Instant breach checking with external API integration

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **localStorage** for client-side data persistence

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **CORS** for cross-origin requests
- **dotenv** for environment variables

## 📁 Project Structure

```
Email-Breach/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── config/
│   │   │   └── env.ts          # Environment configuration
│   │   ├── App.tsx             # Main application component
│   │   ├── main.tsx            # React entry point
│   │   └── index.css           # Global styles
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── config/
│   │   └── db.ts               # Database connection
│   ├── controllers/
│   │   ├── user.ts             # Authentication controllers
│   │   └── emailBreach.ts      # Breach checking logic
│   ├── middleware/
│   │   └── globalErrorhandling.ts
│   ├── model/
│   │   └── user.ts             # User schema
│   ├── routes/
│   │   └── auth.ts             # API routes
│   ├── index.ts                # Server entry point
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Email-Breach
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

### Environment Configuration

#### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/EBC

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
```

#### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:5000
```

### Running the Application

1. **Start MongoDB** (if running locally)

2. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on http://localhost:5000

3. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   Application will run on http://localhost:5173

## 📚 API Endpoints

### Authentication Routes
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/email-breach` - Check email for breaches

### Request/Response Examples

#### User Registration
```json
// POST /api/auth/signup
{
  "name": "MorningStar_2061",
  "email": "ms2061@example.com",
  "password": "SecurePass123!"
}

// Response
{
  "message": "User created successfully",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "MorningStar_2061",
    "email": "ms2061@example.com"
  }
}
```

#### Email Breach Check
```json
// POST /api/auth/email-breach
{
  "email": "test@example.com"
}

// Response
{
  "success": true,
  "email": "test@example.com",
  "data": {
    "BreachMetrics": { /* detailed metrics */ },
    "ExposedBreaches": { /* breach details */ }
  },
  "checkedAt": "2025-01-01T00:00:00.000Z"
}
```

## 🔒 Security Features

- **Password Validation**: Strong password requirements with validation
- **JWT Authentication**: Secure token-based authentication
- **Input Sanitization**: Email validation and sanitization
- **Rate Limiting**: Search limitations for non-authenticated users
- **Error Handling**: Comprehensive error handling and user feedback

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 📞 Support

If you have any questions or run into issues, please open an issue on GitHub.

---

Made with ❤️ using the MERN stack
# Learning Management System (LMS) - Backend API

> A robust backend API for a Learning Management System that powers online course delivery, live sessions, quizzes, and community features.

## 🚀 Features

### 🔒 Authentication
- JWT-based authentication with email verification
- Secure password reset with OTP verification

### 📚 Course Management
- CRUD operations for courses
- AWS S3 integration for media storage
- Course enrollment system

### � Live Sessions
- Real-time video sessions with WebRTC
- Session summarization
- Article generation from sessions

### ✍ Quizzes
- AI-generated quizzes using Gemini API
- Quiz submission and grading system

### 💬 Community Features
- Course-based discussion forums
- Real-time chat with file sharing
- WebSocket notifications

### 👤 User Profiles
- Personalized user profiles
- Media uploads and management

## 🛠 Tech Stack

| Category       | Technologies                          |
|----------------|---------------------------------------|
| **Backend**    | Node.js, Express.js                   |
| **Database**   | MongoDB (with Mongoose ODM)           |
| **Auth**       | JWT, OTP verification                |
| **Storage**    | AWS S3                                |
| **Real-time**  | Socket.io                             |
| **AI**         | Gemini API for quiz generation        |
| **Media**      | FFmpeg for audio/video processing     |

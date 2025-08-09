# 📚 LiveMentor - Intelligent Learning Management System (LMS)

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-brightgreen)
![Firebase](https://img.shields.io/badge/Firebase-Admin-yellow)
![AWS-S3](https://img.shields.io/badge/AWS-S3-orange)
![AI-Integrated](https://img.shields.io/badge/AI-Integrated-blueviolet)

## 🌟 Overview

LiveMentor is an **AI-powered learning platform** that bridges traditional classroom engagement with modern digital education. Unlike conventional systems, it creates an **intelligent ecosystem** that continuously observes, interprets, and reinforces learning through:

✔ **Real-time behavioral analysis** (facial expressions, attention tracking)  
✔ **AI-driven content transformation** (speech-to-structured knowledge)  
✔ **Adaptive feedback mechanisms** (personalized quizzes & reinforcement)  
✔ **Seamless cross-platform experience** (web & mobile optimized)  

The platform doesn't just deliver content - it **simulates classroom interactivity** by reconstructing sessions into pedagogically coherent materials with contextual clarity and conceptual links.

## 🚀 Key Features

### 🎓 Intelligent Course Management
- AI-assisted course creation
- Dynamic session scheduling
- Smart enrollment system

### 💬 Context-Aware Communication
- Real-time engagement analytics
- Behavioral insight dashboards
- Adaptive notification system

### 🎥 Live Session Intelligence
- WebRTC video with attention tracking
- AI-generated session summaries
- Automatic content restructuring

### 📝 Adaptive Assessments
- AI-generated quizzes from live content
- Performance-based question difficulty
- Competency gap analysis

## 🛠 Tech Stack

**Core:**
- Node.js | Express | MongoDB  
**AI Services:**
- Gemini API | AssemblyAI  
**Infrastructure:**
- AWS S3 (media storage)  
- Firebase (notifications)  
**Real-Time:**
- Socket.IO (live interactions)  
- WebRTC (video sessions)  

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/yourusername/educonnect-backend.git

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start server
npm start
```

## 🔧 Configuration

Create a `.env` file with the following variables:

```
MONGODB_URI=mongodb://localhost:27017/educonnect
PORT=8080
JWT_SECRET= jwt_secret
MAIL_HOST = smtp.gmail.com
MAIL_PORT = 587
MAIL_USER = ibrahimmohamed99026@gmail.com
MAIL_PASS = mail_pass
FIREBASE_SERVICE_ACCOUNT=path/to/serviceAccount.json
AWS_ACCESS_KEY_ID= aws_key
AWS_SECRET_ACCESS_KEY= aws_secret
AWS_REGION=eu-north-1
S3_BUCKET_NAME=grad-proj-images
ASSEMBLYAI_API_KEY=your_assemblyai_key
GEMINI_API_KEY=your_gemini_key
```

## 🏗️ Project Structure

```
educonnect-backend/
├── config/               # Configuration files
├── controllers/          # Route controllers
├── middlewares/          # Custom middleware
├── models/               # MongoDB models
├── routes/               # API routes
├── services/             # Business logic
├── sockets/              # Socket.io handlers
├── utils/                # Utility functions
├── app.js                # Express app setup
└── server.js             # Server entry point
```

## 🤖 AI Integration

- **Gemini API**: Used for generating quiz questions from session content
- **AssemblyAI**: Converts session audio recordings to text
- **Custom AI Services**: Processes transcripts into structured articles

## 🌐 LiveMentor Demo [here](https://drive.google.com/file/d/10x41-VtZgrzhKOABNqhf8W63z6f83enn/view)


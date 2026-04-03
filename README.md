# CHAT. — Real-time Chat Application

LINK :- https://chat-app-two-flame-52.vercel.app/

GO to this link for getting hands on this web app

A full-stack real-time chat application built with Node.js, Socket.io, MongoDB, and React.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)

---

## Features

- **Authentication** — Secure signup and login with JWT tokens and bcrypt password hashing
- **Real-time Messaging** — Instant one-to-one chat powered by Socket.io WebSockets
- **Online Status** — See who is online or offline in real time using Redis
- **Chat History** — All messages are saved to MongoDB and loaded when you open a conversation
- **Typing Indicators** — See when the other person is typing
- **Protected Routes** — Only authenticated users can access the chat

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | HTTP server and REST API |
| Socket.io | Real-time WebSocket communication |
| MongoDB + Mongoose | Database for users and messages |
| Redis (ioredis) | Online/offline presence tracking |
| JWT | Authentication tokens |
| bcrypt | Password hashing |

### Frontend
| Technology | Purpose |
|---|---|
| React + Vite | Frontend framework |
| Tailwind CSS | Styling |
| React Router | Client-side routing |
| Axios | HTTP requests |
| Socket.io Client | Real-time connection |

### DevOps
| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Running MongoDB and Redis locally |

---

## Project Structure

```
chat-app/
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── auth.controller.js
│   │   ├── middleware/
│   │   │   └── auth.middleware.js
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   └── message.model.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   └── user.routes.js
│   │   ├── socket/
│   │   │   └── socket.handler.js
│   │   ├── lib/
│   │   │   ├── db.js
│   │   │   └── redis.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── Chat.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── docker-compose.yml
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

### 1. Clone the repository

```bash
git clone https://github.com/karan7037pr/Chat-app.git
cd Chat-app
```

### 2. Start MongoDB and Redis with Docker

```bash
docker compose up -d
```

### 3. Setup the Backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` folder:

```env
PORT=3000
MONGO_URL=mongodb://localhost:27017/chatdb
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d
```

Start the server:

```bash
npm run dev
```

You should see:
```
✅ MongoDB connected
✅ Redis connected
✅ Server running on http://localhost:3000
```

### 4. Setup the Frontend

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

Open your browser and go to:
```
http://localhost:5173
```

---

## How It Works

### Authentication Flow
```
User submits form
      ↓
POST /auth/signup or /auth/login
      ↓
bcrypt verifies password
      ↓
Server returns JWT token
      ↓
Token stored in localStorage
      ↓
All requests include token in Authorization header
```

### Real-time Chat Flow
```
User opens chat → connects to Socket.io with JWT
                        ↓
                  Server verifies JWT
                        ↓
User sends message → saved to MongoDB
                        ↓
                  Server emits to receiver's socket
                        ↓
                  Receiver sees message instantly
```

### Online Status Flow
```
User connects     → Redis SET online:userId
User disconnects  → Redis DEL online:userId
Other users       → query Redis to check status
```

---

## API Endpoints

### Auth Routes
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Register a new user |
| POST | `/auth/login` | Login and get JWT token |

### User Routes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | Get all users (requires JWT) |

### Socket Events

| Event | Direction | Description |
|---|---|---|
| `send_message` | Client → Server | Send a message |
| `receive_message` | Server → Client | Receive a message |
| `message_sent` | Server → Client | Confirm message was sent |
| `get_history` | Client → Server | Request chat history |
| `chat_history` | Server → Client | Returns chat history |
| `typing` | Client → Server | User is typing |
| `stop_typing` | Client → Server | User stopped typing |
| `user_typing` | Server → Client | Show typing indicator |
| `user_status` | Server → Client | User online/offline update |
| `get_online_users` | Client → Server | Request online users list |
| `online_users` | Server → Client | Returns online users list |

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `3000` |
| `MONGO_URL` | MongoDB connection string | `mongodb://localhost:27017/chatdb` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | Secret key for JWT signing | `supersecretkey` |
| `JWT_EXPIRES_IN` | JWT expiry duration | `7d` |

---

## What I Learned Building This

- How WebSockets differ from HTTP and when to use them
- JWT authentication and protecting both REST and Socket.io routes
- Real-time presence tracking with Redis
- MongoDB schema design for chat applications
- Connecting a React frontend to a Socket.io backend
- Running services locally with Docker Compose

---

## Future Improvements

- [ ] Group chat rooms
- [ ] File and image sharing
- [ ] Read receipts
- [ ] Push notifications
- [ ] Mobile app with React Native
- [ ] End-to-end encryption
- [ ] Deploy to production

---

## License

MIT License — feel free to use this project for learning and building.

---

Built with ❤️ while learning backend development.

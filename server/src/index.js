require('dotenv').config()

const express = require('express')
const http = require('http')
const cors = require('cors')
const { Server: SocketServer } = require('socket.io')
const redis = require('./lib/redis')
const connectDB = require('./lib/db')
const authRoutes = require('./routes/auth.routes')
const { setupSocket } = require('./socket/socket.handler')

// Connect to MongoDB
connectDB()

const app = express()
const httpServer = http.createServer(app)

const io = new SocketServer(httpServer, {
  cors: {
    origin: 'https://chat-app-two-flame-52.vercel.app',
    methods: ['GET', 'POST'],
    credentials: true
  }
})

app.use(cors({
  origin: 'https://chat-app-two-flame-52.vercel.app',
  credentials: true
}))
app.use(express.json())

// ── Routes ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🚀 Chat server is running!' })
})
app.use('/auth', authRoutes)
const userRoutes = require('./routes/user.route')
app.use('/users', userRoutes)

// ── Socket.io ──────────────────────────────────────────
setupSocket(io)

// ── Start Server ───────────────────────────────────────
const PORT = process.env.PORT || 3000
httpServer.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})
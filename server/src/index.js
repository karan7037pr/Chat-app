require('dotenv').config()

const express = require('express')
const http = require('http')
const cors = require('cors')
const { Server: SocketServer } = require('socket.io')
const connectDB = require('./lib/db')
const redis = require('./lib/redis')
const authRoutes = require('./routes/auth.routes')

// Connect to MongoDB
connectDB()

const app = express()
const httpServer = http.createServer(app)

const io = new SocketServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

app.use(cors())
app.use(express.json())

// ── Routes ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🚀 Chat server is running!' })
})
app.use('/auth', authRoutes)

// ── Socket.io ─────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`⚡ New client connected: ${socket.id}`)
  socket.on('disconnect', () => {
    console.log(`🔴 Client disconnected: ${socket.id}`)
  })
})

const PORT = process.env.PORT || 3000

httpServer.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})
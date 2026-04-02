const jwt = require('jsonwebtoken')
const redis = require('../lib/redis')
const Message = require('../models/message.model')

// Map to track userId → socketId
const userSocketMap = {}

const setupSocket = (io) => {

  // ── JWT Auth Middleware for Socket.io ────────────────
  // This runs before every socket connection
  io.use((socket, next) => {
    const token = socket.handshake.auth.token

    if (!token) {
      return next(new Error('Authentication error: No token'))
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.user = decoded   // attach user to socket
      next()
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'))
    }
  })

  // ── On Connection ────────────────────────────────────
  io.on('connection', async (socket) => {
    const userId = socket.user.userId
    const username = socket.user.username

    console.log(`⚡ ${username} connected — socket: ${socket.id}`)

    // Save userId → socketId mapping
    userSocketMap[userId] = socket.id

    // Set online status in Redis
    await redis.set(`online:${userId}`, 'true')

    // Broadcast to everyone that this user is online
    io.emit('user_status', { userId, status: 'online' })

    // ── Send Message ───────────────────────────────────
    socket.on('send_message', async (data) => {
      const { receiverId, content } = data

      if (!receiverId || !content) return

      try {
        // Save message to MongoDB
        const message = await Message.create({
          senderId: userId,
          receiverId,
          content,
        })

        // Format message to send back
        const messageData = {
          _id: message._id,
          senderId: userId,
          receiverId,
          content,
          createdAt: message.createdAt,
        }

        // Send to receiver if they are online
        const receiverSocketId = userSocketMap[receiverId]
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_message', messageData)
        }

        // Send back to sender to confirm
        socket.emit('message_sent', messageData)

      } catch (err) {
        console.error('Error sending message:', err)
        socket.emit('message_error', { message: 'Failed to send message' })
      }
    })

    // ── Get Chat History ───────────────────────────────
    socket.on('get_history', async (data) => {
      const { receiverId } = data

      try {
        const messages = await Message.find({
          $or: [
            { senderId: userId, receiverId },
            { senderId: receiverId, receiverId: userId }
          ]
        }).sort({ createdAt: 1 }).limit(50)

        socket.emit('chat_history', messages)
      } catch (err) {
        console.error('Error fetching history:', err)
      }
    })

    // ── Get Online Users ───────────────────────────────
    socket.on('get_online_users', async () => {
      const onlineUsers = Object.keys(userSocketMap)
      socket.emit('online_users', onlineUsers)
    })

    // ── Typing Indicator ───────────────────────────────
    socket.on('typing', ({ receiverId }) => {
      const receiverSocketId = userSocketMap[receiverId]
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', { userId, username })
      }
    })

    socket.on('stop_typing', ({ receiverId }) => {
      const receiverSocketId = userSocketMap[receiverId]
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_stop_typing', { userId })
      }
    })

    // ── On Disconnect ──────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`🔴 ${username} disconnected`)

      // Remove from socket map
      delete userSocketMap[userId]

      // Remove from Redis
      await redis.del(`online:${userId}`)

      // Broadcast offline status
      io.emit('user_status', { userId, status: 'offline' })
    })
  })
}

module.exports = { setupSocket, userSocketMap }
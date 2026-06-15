const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const http = require('http')
const { Server } = require('socket.io')
const connectDB = require('./config/db')

dotenv.config()

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  }
})

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/jobs', require('./routes/jobs'))
app.use('/api/users', require('./routes/users'))
app.use('/api/messages', require('./routes/messages'))
app.use('/api/payments', require('./routes/payments'))
app.use('/api/notifications', require('./routes/Notification'))
app.use('/api/reviews', require('./routes/reviews'))

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Opportunix API is running!' })
})

// Socket.io for real time messaging
const connectedUsers = {}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('join', (userId) => {
    connectedUsers[userId] = socket.id
    console.log(`User ${userId} joined`)
  })

  socket.on('sendMessage', (data) => {
    const receiverSocketId = connectedUsers[data.receiverId]
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receiveMessage', data)
    }
  })

  socket.on('disconnect', () => {
    Object.keys(connectedUsers).forEach(key => {
      if (connectedUsers[key] === socket.id) {
        delete connectedUsers[key]
      }
    })
    console.log('User disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
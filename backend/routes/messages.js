const express = require('express')
const router = express.Router()
const Message = require('../models/Message')
const { protect } = require('../middleware/auth')

// Send message
router.post('/', protect, async (req, res) => {
  try {
    const { receiverId, content, jobId } = req.body

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
      jobId: jobId || null,
    })

    const populated = await message.populate('sender', 'name profilePic')

    res.status(201).json({ success: true, message: populated })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get conversation between two users
router.get('/:userId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ]
    })
      .populate('sender', 'name profilePic')
      .populate('receiver', 'name profilePic')
      .sort({ createdAt: 1 })

    // Mark as read
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, isRead: false },
      { isRead: true }
    )

    res.json({ success: true, messages })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get all conversations
router.get('/', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id },
      ]
    })
      .populate('sender', 'name profilePic')
      .populate('receiver', 'name profilePic')
      .sort({ createdAt: -1 })

    res.json({ success: true, messages })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
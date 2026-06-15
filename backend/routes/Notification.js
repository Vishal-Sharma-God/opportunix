const express = require('express')
const router = express.Router()
const Notification = require('../models/Notification')
const { protect } = require('../middleware/auth')

// Get all notifications for logged in user
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id
    })
      .populate('sender', 'name profilePic')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 })
      .limit(20)

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    })

    res.json({ success: true, notifications, unreadCount })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Mark all as read
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    )
    res.json({ success: true, message: 'All notifications marked as read' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Mark single notification as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete notification
router.delete('/:id', protect, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})
router.post('/hire', protect, async (req, res) => {
  try {
    const { freelancerId, jobId, jobTitle } = req.body
    await Notification.create({
      recipient: freelancerId,
      sender: req.user._id,
      type: 'job_accepted',
      message: `🎉 Congratulations! ${req.user.name} hired you for "${jobTitle}"`,
      jobId: jobId,
    })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})
module.exports = router
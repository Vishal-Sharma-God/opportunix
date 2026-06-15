const express = require('express')
const router = express.Router()
const Review = require('../models/Review')
const User = require('../models/User')
const Notification = require('../models/Notification')
const { protect } = require('../middleware/auth')

// Submit a review
router.post('/', protect, async (req, res) => {
  try {
    const { revieweeId, jobId, rating, comment } = req.body

    // Check if already reviewed
    const existing = await Review.findOne({
      reviewer: req.user._id,
      reviewee: revieweeId,
      job: jobId,
    })

    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this person for this job!' })
    }

    // Create review
    const review = await Review.create({
      reviewer: req.user._id,
      reviewee: revieweeId,
      job: jobId || null,
      rating,
      comment,
    })

    // Update user rating
    const user = await User.findById(revieweeId)
    const totalRating = user.rating * user.totalReviews + rating
    user.totalReviews += 1
    user.rating = totalRating / user.totalReviews
    await user.save()

    // Send notification
    await Notification.create({
      recipient: revieweeId,
      sender: req.user._id,
      type: 'job_accepted',
      message: `${req.user.name} gave you a ${rating}⭐ review!`,
      jobId: jobId || null,
    })

    res.status(201).json({ success: true, review })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get reviews for a user
router.get('/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name profilePic role')
      .populate('job', 'title')
      .sort({ createdAt: -1 })

    res.json({ success: true, reviews })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
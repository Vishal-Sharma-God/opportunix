const express = require('express')
const router = express.Router()
const Razorpay = require('razorpay')
const { protect } = require('../middleware/auth')
const User = require('../models/User')

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_key',
  key_secret: process.env.RAZORPAY_SECRET || 'rzp_test_secret',
})

// Create order for Business Plan
router.post('/create-order', protect, async (req, res) => {
  try {
    const { plan } = req.body

    const amount = plan === 'business' ? 99900 : 9900 // in paise

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `order_${req.user._id}_${Date.now()}`,
    })

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Verify payment
router.post('/verify', protect, async (req, res) => {
  try {
    const { plan, paymentId } = req.body

    const user = await User.findById(req.user._id)

    if (plan === 'business') {
      user.isBusiness = true
      user.isVerified = true
      user.isPro = true
    } else if (plan === 'freelancer') {
      user.isPro = true
      user.trialExpired = false
    }

    await user.save()

    res.json({
      success: true,
      message: `${plan} plan activated successfully!`,
      user: {
        _id: user._id,
        name: user.name,
        isPro: user.isPro,
        isBusiness: user.isBusiness,
        isVerified: user.isVerified,
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
const express = require('express')
const router = express.Router()
const { register, login, getMe, forgotPassword } = require('../controllers/authController')
const { protect } = require('../middleware/auth')

router.post('/register', register)
router.post('/login', login)
router.get('/me', protect, getMe)
router.post('/forgot-password', forgotPassword)
router.delete('/delete-account', protect, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id)
    res.json({ success: true, message: 'Account deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})
module.exports = router
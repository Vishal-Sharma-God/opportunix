const express = require('express')
const router = express.Router()
const {
  getFreelancers,
  getUserProfile,
  updateProfile,
  rateUser,
  trialStatus,
} = require('../controllers/userController')
const { protect } = require('../middleware/auth')

router.get('/freelancers', getFreelancers)
router.get('/trial-status', protect, trialStatus)
router.get('/:id', getUserProfile)
router.put('/profile', protect, updateProfile)
router.post('/:id/rate', protect, rateUser)

module.exports = router
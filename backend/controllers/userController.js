const User = require('../models/User')

// @desc Get all freelancers
// @route GET /api/users/freelancers
const getFreelancers = async (req, res) => {
  try {
    const { search, skills } = req.query

    let query = { skills: { $exists: true, $ne: [] } }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
        { bio: { $regex: search, $options: 'i' } },
      ]
    }

    const freelancers = await User.find(query)
      .select('-password')
      .sort({ isPro: -1, rating: -1 })

    res.json({ success: true, freelancers })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc Get single user profile
// @route GET /api/users/:id
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .lean()

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ success: true, user })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc Update user profile
// @route PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { name, bio, skills, location, hourlyRate, companyName, website } = req.body

    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.name = name || user.name
    user.bio = bio || user.bio
    user.skills = skills ? skills.split(',').map(s => s.trim()) : user.skills
    user.location = location || user.location
    user.hourlyRate = hourlyRate || user.hourlyRate
    user.companyName = companyName || user.companyName
    user.website = website || user.website
    user.portfolioUrl = req.body.portfolioUrl || user.portfolioUrl
user.githubUrl = req.body.githubUrl || user.githubUrl
user.linkedinUrl = req.body.linkedinUrl || user.linkedinUrl
user.twitterUrl = req.body.twitterUrl || user.twitterUrl
user.phone = req.body.phone || user.phone
user.languages = req.body.languages ? req.body.languages.split(',').map(l => l.trim()) : user.languages
user.availability = req.body.availability || user.availability
user.experience = req.body.experience || user.experience
user.education = req.body.education || user.education
user.industry = req.body.industry || user.industry
user.companySize = req.body.companySize || user.companySize

    await user.save()

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        skills: user.skills,
        location: user.location,
        hourlyRate: user.hourlyRate,
        companyName: user.companyName,
        website: user.website,
        isPro: user.isPro,
        isBusiness: user.isBusiness,
        isVerified: user.isVerified,
        rating: user.rating,
        totalReviews: user.totalReviews,
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc Rate a freelancer
// @route POST /api/users/:id/rate
const rateUser = async (req, res) => {
  try {
    const { rating } = req.body
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const totalRating = user.rating * user.totalReviews + rating
    user.totalReviews += 1
    user.rating = totalRating / user.totalReviews

    await user.save()

    res.json({ success: true, message: 'Rating submitted!', rating: user.rating })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc Check trial status
// @route GET /api/users/trial-status
const trialStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    const trialStart = new Date(user.trialStart)
    const now = new Date()
    const diffDays = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24))
    const daysLeft = Math.max(0, 30 - diffDays)
    const isExpired = diffDays >= 30

    res.json({
      success: true,
      daysLeft,
      isExpired,
      isPro: user.isPro,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getFreelancers,
  getUserProfile,
  updateProfile,
  rateUser,
  trialStatus,
}
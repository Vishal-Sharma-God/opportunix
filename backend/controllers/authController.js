const User = require('../models/User')
const jwt = require('jsonwebtoken')

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  })
}

// @desc Register user
// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill all fields!' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters!' })
    }

    // Check if user exists
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'User already exists!' })
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
      trialStart: new Date(),
      isPro: false,
    })

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPro: user.isPro,
        trialStart: user.trialStart,
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc Login user
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        isPro: user.isPro,
        isBusiness: user.isBusiness,
        isVerified: user.isVerified,
        bio: user.bio,
        location: user.location,
        hourlyRate: user.hourlyRate,
        profilePic: user.profilePic,
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc Get current user
// @route GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    res.json({ success: true, user })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc Forgot password
// @route POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' })
    }

    res.json({
      success: true,
      message: 'Password reset link sent to your email'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { register, login, getMe, forgotPassword }
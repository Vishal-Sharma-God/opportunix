const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['freelancer', 'client', 'business', 'admin'], default: 'client' },
  skills: [String],
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  profilePic: { type: String, default: '' },
  hourlyRate: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  completedJobs: { type: Number, default: 0 },
  isPro: { type: Boolean, default: false },
  isBusiness: { type: Boolean, default: false },
  trialStart: { type: Date, default: Date.now },
  trialExpired: { type: Boolean, default: false },
  companyName: { type: String, default: '' },
  website: { type: String, default: '' },
  portfolioUrl: { type: String, default: '' },
githubUrl: { type: String, default: '' },
linkedinUrl: { type: String, default: '' },
twitterUrl: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  phone: { type: String, default: '' },
  languages: [String],
  availability: { type: String, default: 'full-time' },
  education: [{
    degree: String,
    institution: String,
    year: String,
  }],
  experience: [{
    company: String,
    role: String,
    years: String,
    description: String,
  }],
  portfolio: [{
    title: String,
    description: String,
    link: String,
    github: String,
    tech: [String],
  }],
  // Client specific
  industry: { type: String, default: '' },
  companySize: { type: String, default: '' },
  totalSpent: { type: Number, default: 0 },
  jobsPosted: { type: Number, default: 0 },
}, { timestamps: true })

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', userSchema)
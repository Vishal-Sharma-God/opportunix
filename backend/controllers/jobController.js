const Job = require('../models/Job')
const User = require('../models/User')
const Notification = require('../models/Notification')

// @desc Get all jobs
// @route GET /api/jobs
const getJobs = async (req, res) => {
  try {
    const { search, category } = req.query

    let query = { status: 'open' }

    if (category && category !== 'All') {
      query.category = category
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'name companyName isVerified')
      .sort({ isSponsored: -1, createdAt: -1 })

    res.json({ success: true, jobs })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc Get single job
// @route GET /api/jobs/:id
const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name companyName isVerified profilePic')
      .populate('applicants.user', 'name skills rating profilePic')

    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }

    res.json({ success: true, job })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc Create job
// @route POST /api/jobs
const createJob = async (req, res) => {
  try {
    const { title, description, budget, skills, category } = req.body

    const job = await Job.create({
      title,
      description,
      budget,
      skills: skills ? skills.split(',').map(s => s.trim()) : [],
      category,
      postedBy: req.user._id,
    })

    res.status(201).json({ success: true, job })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc Apply for job
// @route POST /api/jobs/:id/apply
const applyJob = async (req, res) => {
  try {
    const { coverLetter, bidAmount } = req.body
    const job = await Job.findById(req.params.id)

    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }

    // Check if already applied
    const alreadyApplied = job.applicants.find(
      a => a.user.toString() === req.user._id.toString()
    )

    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied for this job' })
    }

    job.applicants.push({
      user: req.user._id,
      coverLetter,
      bidAmount,
    })

    await job.save()

    // Send notification to job poster
await Notification.create({
  recipient: job.postedBy,
  sender: req.user._id,
  type: 'job_application',
  message: `${req.user.name} applied for your job "${job.title}"`,
  jobId: job._id,
})
    res.json({ success: true, message: 'Applied successfully!' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc Delete job
// @route DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)

    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    await job.deleteOne()
    res.json({ success: true, message: 'Job deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { getJobs, getJob, createJob, applyJob, deleteJob }
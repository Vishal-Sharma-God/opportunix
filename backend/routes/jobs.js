const express = require('express')
const router = express.Router()
const {
  getJobs,
  getJob,
  createJob,
  applyJob,
  deleteJob,
} = require('../controllers/jobController')
const { protect } = require('../middleware/auth')

router.get('/', getJobs)
router.get('/:id', getJob)
router.post('/', protect, createJob)
router.post('/:id/apply', protect, applyJob)
router.delete('/:id', protect, deleteJob)

router.delete('/:id/applicants/:applicantId', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
    job.applicants = job.applicants.filter(a => a._id.toString() !== req.params.applicantId)
    await job.save()
    res.json({ success: true, message: 'Applicant removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})
module.exports = router
const express = require("express");
const router = express.Router();
const {getJobs, newJob, getJobsInRadius, updateJob, deleteJob, getJob, jobStats, applyJob} = require("../controllers/jobsController");
const {isAuthenticatedUser, authorizeRoles} = require("../middlewares/auth")

router.get('/jobs', getJobs);
router.get('/jobs/:zipcode/:distance', getJobsInRadius);
router.get('/jobs/single/:id/:slug', getJob);
router.get('/stats/:topic', jobStats);
router.post('/jobs', isAuthenticatedUser, authorizeRoles('employeer', 'admin'), newJob);
router.patch('/jobs/:id', isAuthenticatedUser,  authorizeRoles("employeer", "admin"), updateJob);
router.delete('/jobs/:id', isAuthenticatedUser, authorizeRoles("employeer", "admin"), deleteJob);
router.patch('/job/:id/apply', isAuthenticatedUser, authorizeRoles("user"), applyJob)




module.exports = router;
const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const { getUseProfile, updatePassword, updateUser, deleteUser, getAppliedJobs, getPublishedJobs, getUsers, deleteUserAdmin } = require("../controllers/userController");
const router = express.Router();



router.get('/me', isAuthenticatedUser, getUseProfile);
router.get('/jobs/published', isAuthenticatedUser, authorizeRoles("employeer"), getPublishedJobs)
router.get('/jobs/applied', isAuthenticatedUser, authorizeRoles("user"), getAppliedJobs);
router.patch('/password/update', isAuthenticatedUser, updatePassword);
router.patch('/me/update', isAuthenticatedUser, updateUser);
router.delete('/me/delete', isAuthenticatedUser, deleteUser);

// admin only routes 

router.get('/users', isAuthenticatedUser, authorizeRoles("admin"), getUsers)
router.delete("/users/:id", isAuthenticatedUser, authorizeRoles("admin"), deleteUserAdmin)



module.exports = router;
const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const invitationController = require('../controllers/invitationController');

// All invitation routes require authentication
router.use(requireAuth);

// Get invitations received by the authenticated user
router.get('/received', invitationController.getReceivedInvitations);

// Validate invitation access (for survey participation)
router.get('/validate/:surveyId', invitationController.validateInvitation);

module.exports = router;
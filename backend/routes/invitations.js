const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const invitationController = require('../controllers/invitationController');

// All invitation routes require authentication
router.use(requireAuth);

// Get invitations received by the authenticated user
router.post('/received', invitationController.getReceivedInvitations);

router.post('/receivedInvitation', invitationController.getReceivedInvitationsFromUser);

// Validate invitation access (for survey participation)
router.get('/validate/:surveyId', invitationController.validateInvitation);


// Send invitations to multiple users for a survey
router.post('/send/:surveyId', invitationController.sendInvitations);



module.exports = router;

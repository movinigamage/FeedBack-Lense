// Invitation controller: validates requests, delegates to service layer
const invitationService = require('../services/invitationService');

// Send invitations to multiple users for a survey
const mongoose = require('mongoose');

exports.sendInvitations = async (req, res) => {
  try {
    const { surveyId } = req.params;
    console.log('surveyId', surveyId);
    const { userEmails } = req.body;
    console.log('userEmails', userEmails);
    const creatorId = req.userId;
    console.log('creatorId', creatorId);

    // Validate survey ID format
    if (!surveyId ) {
      return res.status(400).json({ error: 'Invalid survey ID' });
    }

    console.log('Test 1');

    // Validate creator ID
    if (!creatorId || !mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({ error: 'Invalid creator ID' });
    }


    console.log('Test 2');


    // Validate user emails array
    if (!userEmails || !Array.isArray(userEmails)) {
      return res.status(400).json({ error: 'User emails array is required' });
    }

    console.log('Test 3');


    if (userEmails.length === 0) {
      return res.status(400).json({ error: 'At least one email address is required' });
    }

    console.log('Test 4');


    const cleanEmails = [...new Set(
      userEmails.map(email => email.toLowerCase().trim())
    )];

    

    // Call service
    const result = await invitationService.sendInvitations({
      surveyId: surveyId ,
      creatorId,
      userEmails: cleanEmails
    });

    console.log('Test 5');

    return res.status(201).json({
      message: 'Invitations processed',
      ...result
    });

    

  } catch (error) {
    console.error('Send invitations error:', error);

    console.log('Test 6');

    return res.status(500).json({
      error: 'Failed to send invitations',
      line: error.stack?.split('\n')[1]?.trim()
    });
  }
};


// Get invitations received by the authenticated user
exports.getReceivedInvitations = async (req, res) => {
  try {

    console.log('Sending invitations with userId:', req);
    const userId = req.userId;


    const invitations = await invitationService.getUserReceivedInvitationsList(userId);
    console.log('Invitations list', invitations);

    return res.json({
      invitations,
      count: invitations.length
    });

  } catch (error) {
    console.error('Get received invitations error:', error);
    return res.status(500).json({ error: 'Failed to load received invitations' });
  }
};


exports.getReceivedInvitationsFromUser = async (req, res) => {
  try {

    console.log('Sending invitations with userId:', req);
    const userId = req.userId;


    const invitations = await invitationService.getUserReceivedInvitationsListFromUser(userId);
    console.log('Invitations list', invitations);

    return res.json({
      invitations,
      count: invitations.length
    });

  } catch (error) {
    console.error('Get received invitations error:', error);
    return res.status(500).json({ error: 'Failed to load received invitations' });
  }
};


// Get invitations sent for a specific survey (dashboard view)
exports.getSurveyInvitations = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const creatorId = req.userId;

    if (!surveyId || !surveyId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid survey ID' });
    }

    const invitations = await invitationService.getSurveyInvitations(surveyId, creatorId);

    return res.json({
      surveyId,
      invitations,
      count: invitations.length
    });

  } catch (error) {
    console.error('Get survey invitations error:', error);

    if (error.code === 'SURVEY_NOT_FOUND') {
      return res.status(404).json({ error: 'Survey not found' });
    }
    if (error.code === 'ACCESS_DENIED') {
      return res.status(403).json({ error: 'Access denied: not survey creator' });
    }

    return res.status(500).json({ error: 'Failed to load survey invitations' });
  }
};

// Get invitation statistics for a survey
exports.getInvitationStats = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const userId = req.userId;

    // Validate survey ID format
    if (!surveyId || !surveyId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid survey ID' });
    }

    // Verify survey ownership first
    const surveyService = require('../services/surveyService');
    await surveyService.getSurveyById(surveyId, userId);

    const stats = await invitationService.getInvitationStats(surveyId);

    return res.json({
      surveyId,
      stats
    });

  } catch (error) {
    console.error('Get invitation stats error:', error);

    if (error.code === 'SURVEY_NOT_FOUND') {
      return res.status(404).json({ error: 'Survey not found' });
    }
    if (error.code === 'ACCESS_DENIED') {
      return res.status(403).json({ error: 'Access denied: not survey creator' });
    }

    return res.status(500).json({ error: 'Failed to load invitation statistics' });
  }
};

// Validate invitation token (for survey access)
exports.validateInvitation = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { token } = req.query;
    const userId = req.userId;

    if (!surveyId || !surveyId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid survey ID' });
    }

    if (!token) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    const validationResult = await invitationService.validateInvitationAccess(
      surveyId,
      token,
      userId
    );

    return res.json({
      valid: true,
      ...validationResult
    });

  } catch (error) {
    console.error('Validate invitation error:', error);

    if (error.code === 'INVALID_TOKEN') {
      return res.status(401).json({
        valid: false,
        error: 'Invalid or expired invitation token'
      });
    }
    if (error.code === 'SURVEY_INACTIVE') {
      return res.status(410).json({
        valid: false,
        error: 'This survey is no longer active'
      });
    }
    if (error.code === 'ACCESS_DENIED') {
      return res.status(403).json({
        valid: false,
        error: 'This invitation was sent to a different user'
      });
    }
    if (error.code === 'ALREADY_COMPLETED') {
      return res.status(409).json({
        valid: false,
        error: 'You have already completed this survey'
      });
    }

    return res.status(500).json({
      valid: false,
      error: 'Invitation validation failed'
    });
  }
};

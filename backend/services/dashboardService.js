// Dashboard business logic: homepage data aggregation, user statistics
const surveyService = require('./surveyService');
const invitationService = require('./invitationService');
const User = require('../models/User');
const Survey = require('../models/Survey');
const Invitation = require('../models/Invitation');

// Get comprehensive homepage data for user
exports.getHomepageData = async (userId) => {
  try {
    // Get user info
    const user = await User.findById(userId, 'name email createdAt').lean();
    if (!user) {
      const error = new Error('User not found');
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    // Get user's created surveys with stats
    const createdSurveys = await surveyService.getUserCreatedSurveys(userId);

    // Get user's received invitations
    const receivedInvitations = await invitationService.getUserReceivedInvitations(userId);

    // Calculate user statistics
    const stats = await this.calculateUserStats(userId);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        memberSince: user.createdAt
      },
      createdSurveys,
      receivedInvitations,
      stats
    };

  } catch (error) {
    // Re-throw custom errors, wrap others
    if (error.code) {
      throw error;
    } else {
      const wrappedError = new Error('Failed to load homepage data');
      wrappedError.code = 'HOMEPAGE_LOAD_FAILED';
      wrappedError.originalError = error;
      throw wrappedError;
    }
  }
};

// Calculate comprehensive user statistics
exports.calculateUserStats = async (userId) => {
  try {
    // Count surveys created by user
    const totalSurveysCreated = await Survey.countDocuments({ creatorId: userId });

    // Count invitations received by user
    const totalInvitationsReceived = await Invitation.countDocuments({ userId });

    // Count responses given by user (completed invitations)
    const totalResponsesGiven = await Invitation.countDocuments({ 
      userId, 
      status: 'completed' 
    });

    // Count active vs closed surveys created
    const surveyStatusStats = await Survey.aggregate([
      { $match: { creatorId: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const activeSurveys = surveyStatusStats.find(s => s._id === 'active')?.count || 0;
    const closedSurveys = surveyStatusStats.find(s => s._id === 'closed')?.count || 0;

    // Get response rate for user's surveys
    const surveyResponseStats = await Invitation.aggregate([
      {
        $lookup: {
          from: 'surveys',
          localField: 'surveyId',
          foreignField: '_id',
          as: 'survey'
        }
      },
      {
        $match: {
          'survey.creatorId': userId
        }
      },
      {
        $group: {
          _id: null,
          totalSent: { $sum: 1 },
          totalCompleted: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    const responseStats = surveyResponseStats[0] || { totalSent: 0, totalCompleted: 0 };
    const overallResponseRate = responseStats.totalSent > 0 
      ? Math.round((responseStats.totalCompleted / responseStats.totalSent) * 100)
      : 0;

    // Count pending invitations received
    const pendingInvitations = await Invitation.countDocuments({ 
      userId, 
      status: 'sent' 
    });

    return {
      totalSurveysCreated,
      totalInvitationsReceived,
      totalResponsesGiven,
      pendingInvitations,
      activeSurveys,
      closedSurveys,
      overallResponseRate,
      totalInvitationsSent: responseStats.totalSent,
      totalResponsesReceived: responseStats.totalCompleted
    };

  } catch (error) {
    console.error('Error calculating user stats:', error);
    // Return default stats on error
    return {
      totalSurveysCreated: 0,
      totalInvitationsReceived: 0,
      totalResponsesGiven: 0,
      pendingInvitations: 0,
      activeSurveys: 0,
      closedSurveys: 0,
      overallResponseRate: 0,
      totalInvitationsSent: 0,
      totalResponsesReceived: 0
    };
  }
};

// Get survey dashboard data (for individual survey analytics)
exports.getSurveyDashboard = async (surveyId, creatorId) => {
  try {
    // Get survey details with creator verification
    const survey = await surveyService.getSurveyById(surveyId, creatorId);

    // Get invitation statistics
    const invitationStats = await invitationService.getInvitationStats(surveyId);

    // Get detailed invitation list
    const invitations = await invitationService.getSurveyInvitations(surveyId, creatorId);

    // Get recent activity (last 10 invitations)
    const recentInvitations = invitations.slice(0, 10);

    return {
      survey,
      stats: {
        questionCount: survey.questions.length,
        ...invitationStats
      },
      invitations: recentInvitations,
      lastUpdated: new Date()
    };

  } catch (error) {
    if (error.code) {
      throw error;
    } else {
      const wrappedError = new Error('Failed to load survey dashboard');
      wrappedError.code = 'DASHBOARD_LOAD_FAILED';
      wrappedError.originalError = error;
      throw wrappedError;
    }
  }
};
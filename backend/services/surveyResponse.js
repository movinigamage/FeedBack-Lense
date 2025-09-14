//Survey Response Service
//Author: Aswin and Suong Ngo

const Response = require('../models/Response');
const mongoose = require('mongoose');

// Function to save a survey response
async function saveSurveyResponse(data) {
  try {
    console.log('Received response data:', JSON.stringify(data));
    
    // Validate required fields
    if (!data.surveyId) {
      throw new Error('Survey ID is required');
    }

    if (!data.responses || !Array.isArray(data.responses) || data.responses.length === 0) {
      throw new Error('Survey responses are required');
    }

    // Make sure we're working with valid ObjectIds
    try {
      // Convert surveyId to valid ObjectId
      if (data.surveyId && typeof data.surveyId === 'string') {
        data.surveyId = mongoose.Types.ObjectId.createFromHexString(data.surveyId);
      } else if (!mongoose.Types.ObjectId.isValid(data.surveyId)) {
        // Use a valid placeholder ObjectId if needed
        data.surveyId = new mongoose.Types.ObjectId('000000000000000000000000');
      }
      
      // Convert respondentId to valid ObjectId or use placeholder
      if (data.respondentId && typeof data.respondentId === 'string') {
        if (mongoose.Types.ObjectId.isValid(data.respondentId)) {
          data.respondentId = mongoose.Types.ObjectId.createFromHexString(data.respondentId);
        } else {
          data.respondentId = new mongoose.Types.ObjectId('000000000000000000000000');
        }
      } else {
        data.respondentId = new mongoose.Types.ObjectId('000000000000000000000000');
      }

      // Convert invitationId to valid ObjectId or use placeholder
      if (data.invitationId && typeof data.invitationId === 'string') {
        if (mongoose.Types.ObjectId.isValid(data.invitationId)) {
          data.invitationId = mongoose.Types.ObjectId.createFromHexString(data.invitationId);
        } else {
          // If it's not valid, create a unique ObjectId based on timestamp
          data.invitationId = new mongoose.Types.ObjectId();
        }
      } else {
        data.invitationId = new mongoose.Types.ObjectId();
      }
    } catch (err) {
      console.error('Error converting IDs to ObjectId:', err);
      // Fallback to new ObjectIds if conversion fails
      data.surveyId = new mongoose.Types.ObjectId(data.surveyId || '000000000000000000000000');
      data.respondentId = new mongoose.Types.ObjectId('000000000000000000000000');
      data.invitationId = new mongoose.Types.ObjectId();
    }
    
    // Log the prepared data
    console.log('Prepared response data:', JSON.stringify({
      surveyId: data.surveyId.toString(),
      respondentId: data.respondentId.toString(),
      invitationId: data.invitationId.toString()
    }));
    
    // Create and save the response
    const response = new Response(data);
    await response.save();
    console.log('Response saved successfully with ID:', response._id);
    return response;
  } catch (error) {
    console.error('Error saving survey response:', error);
    throw new Error('Error saving survey response: ' + error.message);
  }
}

module.exports = {
  saveSurveyResponse
};
// tests/e2e/survey-invitation.test.js
const { expect } = require('chai');
const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../../server');

// Test data
const testUsers = [
  { name: 'Survey Creator', email: 'creator@test.com', password: 'password123' },
  { name: 'User One', email: 'user1@test.com', password: 'password123' },
  { name: 'User Two', email: 'user2@test.com', password: 'password123' }
];

const sampleCSVData = [
  { questionId: 'Q1', questionText: 'How satisfied are you with our service?' },
  { questionId: 'Q2', questionText: 'Would you recommend us to others?' }
];

describe('Survey Creation and Invitation E2E Tests', function() {
  this.timeout(30000);
  
  let creatorToken, userTokens = [], surveyId;

  before(async () => {
    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/feedbacklens_test');
      }
      
      // Wait for connection and clean database
      await new Promise(resolve => {
        if (mongoose.connection.readyState === 1) {
          resolve();
        } else {
          mongoose.connection.once('connected', resolve);
        }
      });

      await mongoose.connection.db.dropDatabase();
      console.log('Test database cleaned');
    } catch (error) {
      console.log('Database setup error:', error.message);
    }
  });

  after(async () => {
    try {
      await mongoose.connection.close();
    } catch (error) {
    }
  });

  describe('User Registration', () => {
    it('should register all test users', async () => {
      // Register creator
      const creatorResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(testUsers[0]);
      
      expect(creatorResponse.status).to.equal(201);
      creatorToken = creatorResponse.body.accessToken;

      // Register other users
      for (let i = 1; i < testUsers.length; i++) {
        const userResponse = await request(app)
          .post('/api/v1/auth/register')
          .send(testUsers[i]);
        
        expect(userResponse.status).to.equal(201);
        userTokens.push(userResponse.body.accessToken);
      }

      expect(creatorToken).to.exist;
      expect(userTokens).to.have.length(2);
    });
  });

  describe('Survey Creation', () => {
    it('should create survey with CSV data', async () => {
      const response = await request(app)
        .post('/api/v1/surveys/create')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          title: 'Test Survey',
          csvData: sampleCSVData
        });

      expect(response.status).to.equal(201);
      expect(response.body.survey.title).to.equal('Test Survey');
      surveyId = response.body.survey.id;
    });

    it('should retrieve created survey', async () => {
      const response = await request(app)
        .get(`/api/v1/surveys/${surveyId}`)
        .set('Authorization', `Bearer ${creatorToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.survey.questions).to.have.length(2);
    });
  });

  describe('Invitation Flow', () => {
    it('should send invitations', async () => {
      const inviteEmails = [testUsers[1].email, testUsers[2].email];

      const response = await request(app)
        .post(`/api/v1/surveys/${surveyId}/invitations`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({ userEmails: inviteEmails });

      expect(response.status).to.equal(201);
      expect(response.body.summary.successful).to.equal(2);
    });

    it('should verify users received invitations', async () => {
      const response = await request(app)
        .get('/api/v1/invitations/received')
        .set('Authorization', `Bearer ${userTokens[0]}`);

      expect(response.status).to.equal(200);
      expect(response.body.invitations).to.have.length(1);
    });

    it('should validate invitation access', async () => {
      // Get invitation for first user
      const invitationResponse = await request(app)
        .get('/api/v1/invitations/received')
        .set('Authorization', `Bearer ${userTokens[0]}`);

      const invitation = invitationResponse.body.invitations[0];
      const token = invitation.surveyLink.split('token=')[1];

      // Test access
      const response = await request(app)
        .get(`/survey/${surveyId}?token=${token}`)
        .set('Authorization', `Bearer ${userTokens[0]}`);

      expect(response.status).to.equal(200);
      expect(response.body.survey.title).to.equal('Test Survey');
    });
  });

  describe('Error Handling', () => {
    it('should prevent duplicate invitations', async () => {
      const response = await request(app)
        .post(`/api/v1/surveys/${surveyId}/invitations`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({ userEmails: [testUsers[1].email] });

      expect(response.status).to.equal(201);
      expect(response.body.summary.successful).to.equal(0);
      expect(response.body.results[0].error).to.include('already invited');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get(`/survey/${surveyId}?token=invalid-token`)
        .set('Authorization', `Bearer ${userTokens[0]}`);

      expect(response.status).to.equal(401);
    });
  });
});
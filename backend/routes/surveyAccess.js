const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const surveyController = require('../controllers/surveyController');

router.get('/:surveyId', requireAuth, surveyController.getSurveyForResponse);

module.exports = router;
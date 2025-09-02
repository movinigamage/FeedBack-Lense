const mongoose = require('mongoose');

// Survey schema for storing CSV-based surveys
const surveySchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 100 
  },
  creatorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  questions: [{
    questionId: { 
      type: String, 
      required: true 
    },
    questionText: { 
      type: String, 
      required: true, 
      maxlength: 200 
    }
  }],
  csvMetadata: {
    originalFilename: { 
      type: String, 
      required: true 
    },
    uploadedAt: { 
      type: Date, 
      default: Date.now 
    },
    rowCount: { 
      type: Number, 
      required: true 
    }
  },
  status: { 
    type: String, 
    enum: ['active', 'closed'], 
    default: 'active' 
  }
}, { 
  timestamps: true 
});

// Index for faster queries
surveySchema.index({ creatorId: 1, createdAt: -1 });
surveySchema.index({ status: 1 });

// Validation: Max 20 questions per survey
surveySchema.pre('save', function(next) {
  if (this.questions.length > 20) {
    const error = new Error('Maximum 20 questions allowed per survey');
    error.code = 'MAX_QUESTIONS_EXCEEDED';
    return next(error);
  }
  
  // Ensure question IDs are unique within survey
  const questionIds = this.questions.map(q => q.questionId);
  const uniqueIds = [...new Set(questionIds)];
  if (questionIds.length !== uniqueIds.length) {
    const error = new Error('Question IDs must be unique within survey');
    error.code = 'DUPLICATE_QUESTION_IDS';
    return next(error);
  }
  
  next();
});

module.exports = mongoose.model('Survey', surveySchema);
# F3: Survey Creation with CSV Upload - Implementation Documentation

## 📋 Feature Overview

**Feature ID:** F3  
**Sprint:** 1  
**Implementation Status:** ✅ Complete  
**Type:** Frontend + Backend Integration  

F3 implements a comprehensive 4-step survey creation workflow that allows users to upload CSV files containing survey questions, validate the data, customize surveys, and save them to the database via API integration.

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Modern web browser with ES6 support

### Installation & Setup

#### 1. Clone and Install Dependencies
```bash
# Navigate to project root
cd /path/to/FeedBack-Lense

# Install backend dependencies
cd backend
npm install

# Required packages for F3 feature:
# - express (API routes)
# - mongoose (MongoDB integration)
# - jsonwebtoken (authentication)
# - multer (file upload handling)
# - cors (cross-origin requests)
```

#### 2. Environment Configuration
Create `.env` file in backend directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/feedbacklens
PORT=3000

# Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# File Upload
MAX_FILE_SIZE=1048576  # 1MB in bytes
ALLOWED_FILE_TYPES=.csv
```

#### 3. Database Setup
```bash
# Start MongoDB service
brew services start mongodb/brew/mongodb-community  # macOS
# or
sudo systemctl start mongod  # Linux

# The application will automatically create collections on first run
```

#### 4. Start the Application
```bash
# Start backend server (from backend directory)
npm start
# Server runs on http://localhost:3000

# Serve frontend (from project root)
# Option 1: Using VS Code Live Server extension
# Right-click on frontend/public/dashboard/create-survey.html -> "Open with Live Server"

# Option 2: Using Python simple server
cd frontend/public
python3 -m http.server 8080
# Frontend runs on http://localhost:8080
```

#### 5. Access the Feature
1. Navigate to `http://localhost:8080/auth/signin.html`
2. Sign in with valid credentials
3. Go to `http://localhost:8080/dashboard/create-survey.html`
4. Start creating surveys with CSV upload!

### Quick Test
```bash
# Test the feature with sample data
# 1. Use the provided sample-survey.csv file
# 2. Upload it through the interface
# 3. Follow the 4-step creation process
```

## 🎯 User Flow

The feature implements a 4-screen survey creation process:

1. **Screen 1:** CSV Upload with drag-and-drop functionality
2. **Screen 2:** CSV Preview and validation display  
3. **Screen 3:** Survey setup with title input and question editing
4. **Screen 4:** Success page with survey details and navigation options

## 🏗️ Architecture Overview

### Frontend Structure
```
frontend/
├── public/dashboard/create-survey.html    # Main survey creation page
├── css/survey-creation.css                # Feature-specific styling
├── js/survey/
│   ├── surveyCreation.js                 # Main feature logic (2000+ lines)
│   └── csvValidator.js                   # CSV validation module
└── test-phase*.html                      # Testing pages for each phase
```

### Backend Integration
```
backend/
├── routes/surveys.js                     # Survey API routes
├── controllers/surveyController.js       # Survey business logic
├── services/surveyService.js            # Survey data operations
└── models/Survey.js                     # Survey database schema
```

## 🔧 Technical Implementation

### Phase 1: Project Structure & Dashboard (2h)
**Files Modified:**
- `frontend/public/dashboard/create-survey.html` - Main survey creation interface
- `frontend/css/survey-creation.css` - Custom styling for survey creation
- Sidebar navigation integration with dashboard

**Key Features:**
- Multi-step form layout with progressive disclosure
- Responsive design matching FeedbackLens UI theme
- Navigation integration with existing dashboard

### Phase 2: CSV Upload & File Handling (2.5h)
**Files Modified:**
- `frontend/js/survey/csvValidator.js` - Comprehensive CSV validation
- `frontend/js/survey/surveyCreation.js` - File upload handlers

**Key Features:**
- **Drag & Drop Upload:** Interactive upload area with visual feedback
- **File Validation:** Type checking (.csv only), size limits (1MB max)
- **Papa Parse Integration:** Robust CSV parsing with error handling
- **Upload States:** Loading, success, and error states with user feedback

**Validation Rules:**
```csv
Required Headers: questionId, questionText, type, options (optional)
Maximum Questions: 20 per survey
Valid Types: text, likert, multiple-choice
Unique Question IDs: No duplicates allowed
File Size: Maximum 1MB
```

**Functions Implemented:**
- `setupFileUpload()` - Initialize drag-and-drop area
- `handleFileSelect()` - Process uploaded files
- `validateFile()` - File type and size validation
- `parseCSV()` - Convert CSV to JavaScript objects
- `showUploadLoading()` - Loading state management
- `showUploadSuccess()` - Success feedback display

### Phase 3: CSV Preview & Validation Display (2h)
**Files Modified:**
- `frontend/js/survey/surveyCreation.js` - Enhanced preview functionality

**Key Features:**
- **Question Preview Table:** Dynamic table generation showing Question ID and Text
- **Type Badges:** Color-coded badges for question types (Text, Likert, Multiple Choice)
- **Enhanced Error Display:** Categorized error messages with detailed feedback
- **Replace/Next Navigation:** Smooth transitions between steps

**Functions Implemented:**
- `generatePreviewTable()` - Create question preview table
- `showValidationErrors()` - Enhanced error display with categorization
- `categorizeErrors()` - Group errors by type (file, structure, content, validation)
- `generateErrorSections()` - Create organized error sections
- `addTableStatistics()` - Display question type distribution

**Error Categorization:**
- **File Issues:** File type, size, and format errors
- **Structure Issues:** Header validation and CSV parsing errors
- **Content Issues:** Individual question validation errors
- **Validation Issues:** Business rule violations

### Phase 4: Survey Setup & Question Editing (2.5h)
**Files Modified:**
- `frontend/js/survey/surveyCreation.js` - Survey editing functionality
- `frontend/css/survey-creation.css` - Editing interface styles

**Key Features:**
- **Survey Title Validation:** Real-time validation with helper text
- **Inline Question Editing:** Click-to-edit functionality with save/cancel
- **Question Type Management:** Modal-based type editing with visual cards
- **Question Operations:** Duplicate, reorder, and delete questions
- **Option Management:** Edit multiple-choice options inline
- **Survey Preview:** Complete survey preview in new window

**Functions Implemented:**
- `populateSetupTable()` - Generate editable question table
- `setupSurveyTitleValidation()` - Real-time title validation
- `enableQuestionEdit()` - Inline editing activation
- `saveQuestionEdit()` - Save edited questions with validation
- `duplicateQuestion()` - Question duplication with unique IDs
- `moveQuestion()` - Question reordering functionality
- `showTypeEditor()` - Modal for changing question types
- `previewSurvey()` - Complete survey preview generation

**Validation Rules:**
- **Survey Title:** 3-100 characters, required field
- **Questions:** Minimum 1, maximum 20 questions
- **Multiple Choice:** Minimum 2 options required
- **Question Text:** No empty questions allowed

### Phase 5: API Integration & Survey Creation (2h)
**Files Modified:**
- `frontend/js/api/api.js` - Enhanced API module
- `frontend/js/survey/surveyCreation.js` - API integration

**Key Features:**
- **Authentication Guards:** Token validation and session management
- **Survey Submission:** Real database integration via POST /api/v1/surveys/create
- **Error Handling:** Status-code specific error messages
- **Session Monitoring:** Automatic authentication checks every 5 minutes

**API Integration:**
```javascript
// Survey Creation Endpoint
POST /api/v1/surveys/create
Headers: { Authorization: "Bearer <token>" }
Body: {
  title: "Survey Title",
  csvData: [
    {
      questionId: "Q1",
      questionText: "How would you rate...?",
      type: "likert",
      options: ""
    }
  ]
}
```

**Functions Implemented:**
- `submitSurvey()` - Send survey data to backend API
- `handleSurveyCreationError()` - User-friendly error handling
- `setupPeriodicAuthCheck()` - Session validity monitoring
- `enhancedSaveSurvey()` - Complete save workflow with validation

**Error Handling:**
- **401 Unauthorized:** Automatic redirect to login
- **400 Bad Request:** Display specific validation errors
- **413 Payload Too Large:** Suggest reducing questions
- **500+ Server Errors:** Generic server error message

### Phase 6: Success Page & Dashboard Integration (1.5h)
**Files Modified:**
- `frontend/js/survey/surveyCreation.js` - Success page functionality
- `frontend/js/dashboard/dashboard.js` - Dashboard integration

**Key Features:**
- **Success Screen:** Real survey details from API response
- **Action Buttons:** Invite participants, return to dashboard, create another
- **Dashboard Integration:** Display created surveys with statistics
- **Flow Reset:** Complete form reset for new surveys

**Functions Implemented:**
- `updateSuccessPage()` - Display real survey data from API
- `setupSuccessPageActions()` - Configure action buttons
- `handleInviteParticipants()` - Survey sharing functionality
- `navigateToDashboard()` - Dashboard navigation with success message
- `resetSurveyCreationFlow()` - Complete form reset

## 🗂️ File Structure & Components

### Core Files

#### 1. `frontend/js/survey/surveyCreation.js` (2000+ lines)
**Main feature controller handling:**
- File upload and validation
- Multi-step navigation
- Question editing and management
- API integration and error handling
- Success page functionality

**Key Modules:**
```javascript
// Authentication & Initialization
checkAuthentication()
setupPeriodicAuthCheck()
initializeSurveyCreation()

// File Upload (Phase 2)
setupFileUpload()
handleFileSelect()
showUploadLoading()
showUploadSuccess()

// CSV Preview (Phase 3)
generatePreviewTable()
showValidationErrors()
categorizeErrors()

// Survey Editing (Phase 4)
populateSetupTable()
enableQuestionEdit()
saveQuestionEdit()
showTypeEditor()

// API Integration (Phase 5)
submitSurvey()
enhancedSaveSurvey()
handleSurveyCreationError()

// Success & Navigation (Phase 6)
updateSuccessPage()
setupSuccessPageActions()
resetSurveyCreationFlow()
```

#### 2. `frontend/js/survey/csvValidator.js` (300+ lines)
**CSV validation module with:**
```javascript
class CSVValidator {
  // Main validation workflow
  validateCSV(file)
  
  // File validation
  validateFile(file)
  parseCSVFile(file)
  
  // Content validation
  validateCSVContent(data)
  validateQuestionRow(row, rowNumber, questionIds)
  
  // Utility functions
  generateErrorSummary(errors)
  getSampleCSV()
}
```

**Validation Features:**
- File type and size checking
- Header validation (questionId, questionText, type)
- Question count limits (max 20)
- Type validation (text, likert, multiple-choice)
- Unique ID enforcement
- Option validation for multiple-choice questions

#### 3. `frontend/public/dashboard/create-survey.html`
**Main UI structure with:**
- 4-step survey creation workflow
- File upload area with drag-and-drop
- Question preview and editing tables
- Success page with action buttons
- Loading overlays and progress indicators

#### 4. `frontend/css/survey-creation.css`
**Feature-specific styling including:**
- Upload area states (default, hover, success, error)
- Question type badges with color coding
- Inline editing interfaces
- Modal dialogs for type editing
- Responsive design for mobile devices

### Supporting Files

#### Test Files
- `frontend/test-phase2.html` - CSV upload functionality testing
- `frontend/test-phase3.html` - Preview and validation testing  
- `frontend/test-phase4-complete.html` - Question editing testing
- `test-phase5.html` - API integration testing
- `test-phase6.html` - End-to-end workflow testing

#### Sample Data
- `sample-survey.csv` - Valid CSV for testing
- `invalid-survey.csv` - Invalid CSV for error testing

## 🔄 Data Flow

### 1. CSV Upload Flow
```
User uploads CSV → File validation → Papa Parse → Content validation → Store in memory → Show preview
```

### 2. Question Editing Flow
```
Display questions → Enable inline editing → Validate changes → Update memory → Refresh display
```

### 3. Survey Creation Flow
```
Validate survey → Prepare API data → POST to backend → Handle response → Show success/error
```

### 4. Global State Management
```javascript
let currentSurveyData = {
    questions: [],    // Parsed and validated questions
    title: '',       // Survey title
    fileName: ''     // Original CSV filename
};
```

## 🎨 UI/UX Features

### Visual Design
- **Color-coded Type Badges:**
  - 🟦 Text questions (blue)
  - 🟨 Likert scale (yellow/orange)
  - 🟩 Multiple choice (green)

- **Interactive Upload Area:**
  - Hover effects with scaling
  - Drag-over visual feedback
  - Success/error state indicators

- **Progress Indicators:**
  - Loading spinners during processing
  - Step navigation breadcrumbs
  - Success animations

### User Experience
- **Error Prevention:** Real-time validation with helpful messages
- **Error Recovery:** Clear error categories with actionable solutions
- **Sample Downloads:** One-click sample CSV generation
- **Keyboard Navigation:** Full accessibility support
- **Mobile Responsive:** Touch-friendly interface

## 🔒 Security & Validation

### Frontend Validation
- **File Security:** Type and size restrictions
- **Input Sanitization:** Question text length limits
- **Client-side Validation:** Immediate feedback for user errors

### Backend Integration
- **Authentication:** JWT token validation on all requests
- **Authorization:** User ownership verification for surveys
- **Data Validation:** Server-side validation of all survey data
- **Error Handling:** Secure error messages without data exposure

### Session Management
- **Automatic Token Refresh:** Background session validation
- **Secure Redirects:** Automatic login redirect on session expiry
- **Cross-tab Sync:** Session state management across browser tabs

## 📊 Testing Strategy

### Phase-based Testing
Each phase includes comprehensive testing:

1. **Phase 2 Testing:** File upload, validation, parsing
2. **Phase 3 Testing:** Preview generation, error display
3. **Phase 4 Testing:** Question editing, type management
4. **Phase 5 Testing:** API integration, error handling
5. **Phase 6 Testing:** Success flow, dashboard integration

### Test Coverage
- **Unit Tests:** Individual function validation
- **Integration Tests:** API communication testing
- **UI Tests:** User interaction workflows
- **Error Tests:** Invalid data handling
- **Security Tests:** Authentication and authorization

### Sample Test Data
```csv
// Valid CSV (sample-survey.csv)
questionId,questionText,type,options
Q1,How would you rate the course overall?,likert,
Q2,What did you like most about the course?,text,
Q3,Which format do you prefer?,multiple-choice,"Online;In-person;Hybrid"

// Invalid CSV (invalid-survey.csv)
questionId,questionText,type,options
Q1,,likert,                          // Missing question text
Q1,Duplicate ID question,text,       // Duplicate ID
Q2,Invalid type question,invalid,    // Invalid type
Q3,Missing options,multiple-choice,  // Missing required options
```

## 🚀 Performance Optimizations

### File Processing
- **Streaming Upload:** Large file handling with progress indicators
- **Memory Management:** Efficient CSV parsing with Papa Parse
- **Background Processing:** Non-blocking file validation

### UI Performance
- **Virtual Scrolling:** Efficient rendering for large question lists
- **Debounced Validation:** Reduced API calls during real-time validation
- **Lazy Loading:** Progressive feature loading

### API Optimization
- **Request Batching:** Efficient data submission
- **Error Retry:** Automatic retry for failed requests
- **Caching:** Session and user data caching

## 🐛 Error Handling & Recovery

### User-Friendly Error Messages
```javascript
// Error Categories with Specific Messages
{
  file: "File must be CSV format and under 1MB",
  structure: "Missing required headers: questionId, questionText, type",
  content: "Row 3: Question text cannot be empty",
  validation: "Duplicate question ID 'Q1' found in row 5"
}
```

### Recovery Actions
- **Try Again Button:** Reload current step
- **Download Sample:** Get valid CSV template
- **Help Accordion:** Detailed format requirements
- **Back Navigation:** Return to previous valid state

### API Error Handling
- **Network Errors:** Connection failure recovery
- **Server Errors:** Graceful degradation
- **Validation Errors:** Field-specific error display
- **Authentication Errors:** Automatic login redirect

## 📈 Success Metrics

### Completion Tracking
- **Upload Success Rate:** CSV validation pass rate
- **Question Edit Completion:** User engagement with editing features
- **Survey Creation Success:** End-to-end completion rate
- **Error Recovery Rate:** User success after error encounters

### Performance Metrics
- **Load Time:** Initial page load under 2 seconds
- **File Processing:** CSV parsing under 1 second for typical files
- **API Response:** Survey creation under 3 seconds
- **Error Display:** Immediate validation feedback

## 🔮 Future Enhancements

### Planned Features
1. **Bulk Question Import:** Excel file support
2. **Question Templates:** Pre-built question libraries
3. **Advanced Validation:** Custom validation rules
4. **Collaboration:** Multi-user survey editing
5. **Version Control:** Survey revision history

### Technical Improvements
1. **Progressive Web App:** Offline survey creation
2. **Advanced Analytics:** Usage pattern tracking
3. **Performance:** Web Workers for file processing
4. **Accessibility:** Enhanced screen reader support

## 🏷️ Tags & Categories

**Technology Stack:** JavaScript ES6+, HTML5, CSS3, Materialize CSS, Papa Parse  
**Integration:** MongoDB, Express.js, JWT Authentication  
**Testing:** Manual testing, CSV validation testing, API integration testing  
**Performance:** File upload optimization, real-time validation, responsive design  
**Security:** Authentication guards, input validation, secure API communication  

## 👥 Developer Notes

### Code Organization
- **Modular Design:** Separate concerns across multiple files
- **Phase-based Development:** Incremental feature implementation
- **Documentation:** Comprehensive inline comments and function documentation
- **Error Handling:** Defensive programming with graceful error recovery

### Best Practices Implemented
- **ES6 Modules:** Clean import/export structure
- **Async/Await:** Modern asynchronous programming
- **Event Delegation:** Efficient event handling
- **State Management:** Centralized data flow
- **Progressive Enhancement:** Graceful feature degradation

### Maintenance Considerations
- **Clear Code Structure:** Easy to understand and modify
- **Comprehensive Testing:** Thorough validation of all features
- **Documentation:** Detailed implementation guide
- **Error Monitoring:** Built-in error tracking and reporting

---

**Feature Implementation:** Complete ✅  
**Documentation Version:** 1.0  
**Last Updated:** Sprint 1  
**Implementation Time:** ~12 hours across 6 phases  
**Code Quality:** Production-ready with comprehensive error handling

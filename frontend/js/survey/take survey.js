// Global variable to store survey data
import { getUserSurveysData } from "../api/api.js";

let surveyData = null;

// Initialize Materialize components
document.addEventListener("DOMContentLoaded", function () {
    M.AutoInit();

    const urlParams = new URLSearchParams(window.location.search);
    const surveyId = urlParams.get("id") || null;

    loadSurveyData(surveyId);
});

// Load survey data from API
async function loadSurveyData(surveyId) {
    try {
        const result = await getUserSurveysData(surveyId);

        if (result.success) {
            surveyData = result.data.survey; // 👈 use .survey because API wraps it
            renderSurvey(surveyData);
        } else {
            showError("Failed to load survey. Please try again.");
        }
    } catch (error) {
        console.error("LoadSurveyData Error:", error);
        showError("An unexpected error occurred. Please try again.");
    }
}

let currentPage = 1;
const questionsPerPage = 2; // Only 2 questions per page

function renderSurvey(data) {
    const surveyContent = document.getElementById("survey-content");

    const createdDate = new Date(data.createdAt).toLocaleDateString();

    // Header
    const headerHtml = `
      <div class="survey-header">
        <h1 class="survey-title">${data.title}</h1>
        <div class="survey-meta">
          <div>Created By - ${data.creatorName}</div>
          <div>Created Date : ${createdDate}</div>
        </div>
      </div>
    `;

    // Function to render a page of questions
    function renderPage(page) {
        const startIndex = (page - 1) * questionsPerPage;
        const endIndex = startIndex + questionsPerPage;
        const pageQuestions = data.questions.slice(startIndex, endIndex);

        let questionsHtml = "";
        pageQuestions.forEach((question, index) => {
            const globalIndex = startIndex + index;
            questionsHtml += `
              <div class="text-question">
                <div class="question-title">Q${globalIndex + 1}: ${question.questionText}</div>
                <div class="text-area-container">
                  <textarea
                    class="custom-textarea"
                    placeholder="Write your answer here..."
                    rows="5"
                    id="text_question_${question.questionId}"
                  ></textarea>
                </div>
              </div>
            `;
        });

        // Pagination buttons
        let paginationHtml = `
          <div class="pagination-container" style="display: flex; justify-content: center; align-items: center; margin-top: 32px; gap: 16px;">
            ${currentPage > 1
              ? `<button class="pagination-btn waves-effect waves-light" onclick="prevPage()">
                  <i class="material-icons left">chevron_left</i> Previous
                </button>`
              : ""}
            <span style="font-weight: 500; color: #4285f4; font-size: 1.1rem; margin: 0 12px;">
              Page ${currentPage} of ${Math.ceil(data.questions.length / questionsPerPage)}
            </span>
            ${currentPage * questionsPerPage < data.questions.length
              ? `<button class="pagination-btn waves-effect waves-light" onclick="nextPage()">
                  Next <i class="material-icons right">chevron_right</i>
                </button>`
              : ""}
          </div>
        `;

        // Finish button only on last page
        if (currentPage * questionsPerPage >= data.questions.length) {
            questionsHtml += `
              <div class="finish-section" style="margin-top: 20px;">
                <button class="btn finish-btn waves-effect waves-light" onclick="submitSurvey()">
                  Finish
                </button>
              </div>
            `;
        }

        surveyContent.innerHTML = headerHtml + questionsHtml + paginationHtml;
        M.AutoInit();
    }

    // Pagination navigation functions
    window.nextPage = function() {
        currentPage++;
        renderPage(currentPage);
    }

    window.prevPage = function() {
        currentPage--;
        renderPage(currentPage);
    }

    // Render first page
    renderPage(currentPage);
}


// Show error
function showError(message) {
    const surveyContent = document.getElementById("survey-content");
    surveyContent.innerHTML = `
      <div class="error-container">
        <i class="material-icons large">error_outline</i>
        <h5>${message}</h5>
        <button class="btn waves-effect waves-light retry-btn" onclick="window.location.reload()">
          Retry
        </button>
      </div>
    `;
}

// Handle survey submission
function submitSurvey() {
    if (!surveyData) return;

    const answers = {};
    let allAnswered = true;

    surveyData.questions.forEach((question, index) => {
        const textAnswer = document
            .getElementById(`text_question_${question.questionId}`)
            .value.trim();
        if (textAnswer) {
            answers[question.questionId] = textAnswer;
        } else {
            allAnswered = false;
            M.toast({
                html: `Please provide an answer for Question ${index + 1}`,
                classes: "red",
            });
        }
    });

    if (!allAnswered) return;

    M.toast({ html: "Survey submitted successfully!", classes: "green" });

    console.log("Survey Data:", {
        surveyId: surveyData.id,
        answers: answers,
    });

    document
        .querySelectorAll(".custom-textarea, .finish-btn")
        .forEach((element) => (element.style.pointerEvents = "none"));

    document.querySelector(".finish-btn").classList.add("disabled");
}

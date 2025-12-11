// Quiz state
let currentQuestionIndex = 0;
let questions = [];
let answers = [];
let testInfo = {};

// DOM elements
const questionCard = document.getElementById('questionCard');
const questionNumber = document.getElementById('questionNumber');
const questionText = document.getElementById('questionText');
const questionHint = document.getElementById('questionHint');
const optionsList = document.getElementById('optionsList');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Initialize quiz
document.addEventListener('DOMContentLoaded', async function() {
    // Load test info
    const savedTestInfo = localStorage.getItem('babyTestInfo');
    if (!savedTestInfo) {
        // Redirect to home if no test info
        window.location.href = 'index.html';
        return;
    }

    testInfo = JSON.parse(savedTestInfo);

    // Load questions from data.js
    questions = questionsData.questions;

    // Load saved answers if exist
    const savedAnswers = localStorage.getItem('babyTestAnswers');
    if (savedAnswers) {
        answers = JSON.parse(savedAnswers);
        currentQuestionIndex = answers.length;
    }

    // Display current question
    displayQuestion();
    updateProgress();
});

// Display current question
function displayQuestion() {
    if (currentQuestionIndex >= questions.length) {
        // All questions answered, calculate results
        calculateResults();
        return;
    }

    const question = questions[currentQuestionIndex];

    // Update question number and text
    questionNumber.textContent = `题目 ${question.id}`;
    questionText.textContent = question.text;
    questionHint.textContent = question.hint;

    // Clear options list
    optionsList.innerHTML = '';

    // Create option elements
    question.options.forEach((option, index) => {
        const optionElement = createOptionElement(option, index);
        optionsList.appendChild(optionElement);
    });

    // Check if this question has been answered
    const existingAnswer = answers.find(a => a.questionId === question.id);
    if (existingAnswer) {
        // Restore selected options
        existingAnswer.selectedOptions.forEach(optionIndex => {
            const optionElement = optionsList.children[optionIndex];
            if (optionElement) {
                optionElement.classList.add('selected');
            }
        });
    }

    // Update navigation buttons
    updateNavigationButtons();

    // Add fade-in animation
    questionCard.classList.remove('fade-in');
    void questionCard.offsetWidth; // Trigger reflow
    questionCard.classList.add('fade-in');
}

// Create option element
function createOptionElement(option, index) {
    const div = document.createElement('div');
    div.className = 'option-item';
    div.dataset.index = index;

    const letter = document.createElement('span');
    letter.className = 'option-letter';
    letter.textContent = option.letter + '.';

    const text = document.createElement('span');
    text.className = 'option-text';
    text.textContent = option.text;

    div.appendChild(letter);
    div.appendChild(text);

    // Add click handler
    div.addEventListener('click', () => selectOption(index));

    return div;
}

// Handle option selection
function selectOption(index) {
    const optionElements = Array.from(optionsList.children);
    const selectedElement = optionElements[index];

    // Check if already selected
    if (selectedElement.classList.contains('selected')) {
        // Deselect
        selectedElement.classList.remove('selected');
    } else {
        // Check maximum selection limit (2 options)
        const selectedCount = optionElements.filter(el => el.classList.contains('selected')).length;
        if (selectedCount >= 2) {
            // Remove first selected
            const firstSelected = optionElements.find(el => el.classList.contains('selected'));
            if (firstSelected) {
                firstSelected.classList.remove('selected');
            }
        }

        // Select new option
        selectedElement.classList.add('selected');
    }

    // Save answer
    saveCurrentAnswer();

    // Update next button
    updateNavigationButtons();
}

// Save current answer
function saveCurrentAnswer() {
    const question = questions[currentQuestionIndex];
    const optionElements = Array.from(optionsList.children);
    const selectedIndices = [];

    optionElements.forEach((element, index) => {
        if (element.classList.contains('selected')) {
            selectedIndices.push(index);
        }
    });

    // Remove existing answer for this question
    answers = answers.filter(a => a.questionId !== question.id);

    // Add new answer
    if (selectedIndices.length > 0) {
        answers.push({
            questionId: question.id,
            selectedOptions: selectedIndices
        });
    }

    // Save to localStorage
    localStorage.setItem('babyTestAnswers', JSON.stringify(answers));
}

// Update navigation buttons
function updateNavigationButtons() {
    // Previous button
    prevBtn.disabled = currentQuestionIndex === 0;

    // Next button
    const selectedCount = Array.from(optionsList.children).filter(el =>
        el.classList.contains('selected')
    ).length;

    nextBtn.disabled = selectedCount === 0;

    // Update next button text
    if (currentQuestionIndex === questions.length - 1) {
        nextBtn.innerHTML = '<span>查看结果 →</span>';
    } else {
        nextBtn.innerHTML = '<span>下一题 →</span>';
    }
}

// Update progress
function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `第${currentQuestionIndex + 1}题/共${questions.length}题`;
}

// Navigate to previous question
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
        updateProgress();
    }
}

// Navigate to next question
function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
        updateProgress();
    } else {
        // Show results
        calculateResults();
    }
}

// Calculate results
function calculateResults() {
    // Show loading
    document.getElementById('loadingOverlay').classList.add('show');

    // Calculate scores
    const scores = {
        artist: 0,
        musician: 0,
        scientist: 0,
        athlete: 0,
        writer: 0,
        diplomat: 0,
        logician: 0,
        naturalist: 0
    };

    answers.forEach(answer => {
        const question = questions.find(q => q.id === answer.questionId);
        if (question) {
            const isMultiSelect = answer.selectedOptions.length > 1;

            answer.selectedOptions.forEach(optionIndex => {
                const option = question.options[optionIndex];
                if (option && option.scores) {
                    Object.entries(option.scores).forEach(([type, score]) => {
                        // Apply half score for multi-select
                        scores[type] += isMultiSelect ? score * 0.5 : score;
                    });
                }
            });
        }
    });

    // Save results
    const results = {
        scores: scores,
        testInfo: testInfo,
        answers: answers,
        completedTime: new Date().toISOString()
    };

    localStorage.setItem('babyTestResults', JSON.stringify(results));

    // Navigate to results page after a short delay
    setTimeout(() => {
        window.location.href = 'result.html';
    }, 1500);
}

// Prevent accidental page leave
window.addEventListener('beforeunload', function(e) {
    if (answers.length > 0 && answers.length < questions.length) {
        e.preventDefault();
        e.returnValue = '测试尚未完成，确定要离开吗？';
        return e.returnValue;
    }
});
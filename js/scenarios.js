/**
 * Scenario Logic
 * Handles AI assistant and pop-up quiz interruptions during reading
 */

let aiInterval = null;
let quizInterval = null;
let aiQuestions = [];
let quizQuestions = [];
let aiQuestionIndex = 0;
let quizQuestionIndex = 0;
let usedQuizIndices = [];
let settings = {};

/**
 * Initialize scenario based on scenario number
 * Scenario 1: No interruptions (control)
 * Scenario 2: AI Assistant only (sidebar)
 * Scenario 3: Pop-up Quiz only
 * Scenario 4: Both AI Assistant (sidebar) and Quiz
 */
async function initScenario(scenarioNumber) {
    try {
        // Load settings
        settings = await loadSettings();
        
        // Load questions based on scenario
        if (scenarioNumber === 2 || scenarioNumber === 4) {
            aiQuestions = await loadConfig('reading/ai-questions.json');
            initAISidebar();
        }
        
        if (scenarioNumber === 3 || scenarioNumber === 4) {
            quizQuestions = await loadConfig('reading/popup-quiz.json');
        }
        
        // Start appropriate interruptions
        switch(scenarioNumber) {
            case 1:
                // No interruptions (control)
                break;
            case 2:
                // AI sidebar only (no timed interruptions)
                break;
            case 3:
                startQuizInterruptions();
                break;
            case 4:
                startQuizInterruptions();
                break;
        }
    } catch (error) {
        console.error('Error initializing scenario:', error);
    }
}

/**
 * Initialize AI Assistant Sidebar
 */
async function initAISidebar() {
    const sidebar = document.getElementById('ai-sidebar');
    const toggleBtn = document.getElementById('ai-assistant-toggle');
    const closeBtn = document.getElementById('close-sidebar');
    const questionsList = document.getElementById('ai-questions-list');
    const quickActions = document.getElementById('ai-quick-actions');
    const currentInteraction = document.getElementById('current-ai-interaction');
    
    // Show the toggle button
    toggleBtn.style.display = 'block';
    
    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'ai-sidebar-backdrop';
    backdrop.id = 'ai-backdrop';
    document.body.appendChild(backdrop);
    
    // Load quick actions
    let quickActionsList = [];
    try {
        quickActionsList = await loadConfig('reading/ai-quick-actions.json');
    } catch (error) {
        console.error('Error loading quick actions:', error);
    }
    
    // Render AI question buttons (simple list)
    aiQuestions.forEach((q, index) => {
        const questionBtn = document.createElement('button');
        questionBtn.className = 'ai-question-btn btn';
        questionBtn.textContent = q.question;
        questionBtn.dataset.index = index;
        
        questionBtn.addEventListener('click', function() {
            const startTime = new Date().toISOString();
            showAIAnswer(q, index, startTime);
            
            // Scroll to top of sidebar to see the answer
            const sidebarContent = document.querySelector('.ai-sidebar-content');
            if (sidebarContent) {
                sidebarContent.scrollTop = 0;
            }
        });
        
        questionsList.appendChild(questionBtn);
    });
    
    // Render quick action buttons
    quickActionsList.forEach((action, index) => {
        const actionBtn = document.createElement('button');
        actionBtn.className = 'ai-quick-btn btn';
        actionBtn.textContent = action.label;
        actionBtn.dataset.id = action.id;
        
        actionBtn.addEventListener('click', function() {
            const startTime = new Date().toISOString();
            showQuickAction(action, startTime);
            
            // Scroll to top of sidebar to see the response
            const sidebarContent = document.querySelector('.ai-sidebar-content');
            if (sidebarContent) {
                sidebarContent.scrollTop = 0;
            }
        });
        
        quickActions.appendChild(actionBtn);
    });
    
    // Toggle sidebar open/close
    toggleBtn.addEventListener('click', function() {
        sidebar.classList.add('open');
        backdrop.classList.add('show');
    });
    
    closeBtn.addEventListener('click', function() {
        sidebar.classList.remove('open');
        backdrop.classList.remove('show');
    });
    
    backdrop.addEventListener('click', function() {
        sidebar.classList.remove('open');
        backdrop.classList.remove('show');
    });
}

/**
 * Show AI Answer directly (no options)
 */
function showAIAnswer(questionData, questionIndex, startTime) {
    const currentInteraction = document.getElementById('current-ai-interaction');
    
    clearParagraphHighlights();
    
    // Show question with thinking animation
    currentInteraction.innerHTML = `
        <div class="ai-current-question">
            <h6>Your Question</h6>
            <p>${questionData.question}</p>
        </div>
        <div class="ai-thinking">
            <div class="thinking-dots">
                <span>Thinking</span>
                <span class="dot">.</span>
                <span class="dot">.</span>
                <span class="dot">.</span>
            </div>
        </div>
    `;
    
    // Random delay between 1-4 seconds (1000-4000ms)
    const thinkingDelay = Math.floor(Math.random() * 3000) + 1000;
    
    setTimeout(function() {
        const endTime = new Date().toISOString();
        
        // Build paragraph reference link if this question highlights a paragraph
        let referenceHtml = '';
        if (questionData.highlightParagraph) {
            referenceHtml = `
                <div class="ai-paragraph-ref">
                    <a href="#" class="paragraph-ref-link" data-paragraph="${questionData.highlightParagraph}">
                        📌 See in article (Paragraph ${questionData.highlightParagraph})
                    </a>
                </div>
            `;
            applyParagraphHighlight(questionData.highlightParagraph);
        }
        
        // Show the answer
        currentInteraction.innerHTML = `
            <div class="ai-current-question">
                <h6>Your Question</h6>
                <p>${questionData.question}</p>
            </div>
            <div class="ai-answer-display">
                <h6><span>💡</span> AI Answer</h6>
                <p>${questionData.answer}</p>
                ${referenceHtml}
            </div>
        `;
        
        // Attach click handler for the paragraph reference link
        const refLink = currentInteraction.querySelector('.paragraph-ref-link');
        if (refLink) {
            refLink.addEventListener('click', function(e) {
                e.preventDefault();
                scrollToParagraph(this.dataset.paragraph);
            });
        }
        
        // Record interaction
        addInteraction('ai_question', {
            questionIndex: questionIndex,
            question: questionData.question,
            answer: questionData.answer,
            highlightedParagraph: questionData.highlightParagraph || null,
            startTime: startTime,
            endTime: endTime
        });
    }, thinkingDelay);
}

/**
 * Show Quick Action Response
 */
function showQuickAction(action, startTime) {
    const currentInteraction = document.getElementById('current-ai-interaction');
    
    // Show request with thinking animation
    currentInteraction.innerHTML = `
        <div class="ai-current-question">
            <h6>Request</h6>
            <p>${action.label}</p>
        </div>
        <div class="ai-thinking">
            <div class="thinking-dots">
                <span>Thinking</span>
                <span class="dot">.</span>
                <span class="dot">.</span>
                <span class="dot">.</span>
            </div>
        </div>
    `;
    
    // Random delay between 1-4 seconds (1000-4000ms)
    const thinkingDelay = Math.floor(Math.random() * 3000) + 1000;
    
    setTimeout(function() {
        // Show the response
        currentInteraction.innerHTML = `
            <div class="ai-current-question">
                <h6>Request</h6>
                <p>${action.label}</p>
            </div>
            <div class="ai-answer-display">
                <h6><span>💡</span> AI Response</h6>
                <p>${action.response}</p>
            </div>
        `;
        
        // Record interaction
        addInteraction('ai_quick_action', {
            actionId: action.id,
            actionLabel: action.label,
            startTime: startTime,
            endTime: new Date().toISOString()
        });
    }, thinkingDelay);
}

/**
 * Start pop-up quiz interruptions
 */
function startQuizInterruptions() {
    const interval = settings.popupQuizInterval * 1000; // Convert to milliseconds
    
    quizInterval = setInterval(function() {
        // Only show up to configured number of quizzes
        if (usedQuizIndices.length < settings.popupQuizCount) {
            showRandomQuiz();
        }
    }, interval);
}

/**
 * Show random quiz question
 */
function showRandomQuiz() {
    // Get random unused question
    let availableIndices = [];
    for (let i = 0; i < quizQuestions.length; i++) {
        if (!usedQuizIndices.includes(i)) {
            availableIndices.push(i);
        }
    }
    
    if (availableIndices.length === 0) {
        return; // No more questions
    }
    
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    usedQuizIndices.push(randomIndex);
    
    const questionData = quizQuestions[randomIndex];
    const startTime = new Date().toISOString();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('quizModal')) || new bootstrap.Modal(document.getElementById('quizModal'));
    
    // Set question
    document.getElementById('quiz-question').textContent = questionData.question;
    
    // Set options
    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';
    
    questionData.options.forEach((option, index) => {
        const div = document.createElement('div');
        div.className = 'form-check mb-2';
        div.innerHTML = `
            <input class="form-check-input" type="radio" name="quiz-answer" id="quiz_${index}" value="${index}" required>
            <label class="form-check-label" for="quiz_${index}">
                ${option}
            </label>
        `;
        optionsContainer.appendChild(div);
    });
    
    // Handle submit
    document.getElementById('quiz-submit-btn').onclick = function() {
        const selectedOption = document.querySelector('input[name="quiz-answer"]:checked');
        if (!selectedOption) {
            alert('Please select an answer');
            return;
        }
        
        // Record interaction
        addInteraction('quiz', {
            questionIndex: randomIndex,
            questionId: questionData.id,
            selectedAnswer: parseInt(selectedOption.value),
            correctAnswer: questionData.correctAnswer,
            isCorrect: parseInt(selectedOption.value) === questionData.correctAnswer,
            startTime: startTime,
            endTime: new Date().toISOString()
        });
        
        modal.hide();
    };
    
    // Show modal
    modal.show();
}

/**
 * Stop all scenario interruptions
 */
function stopScenario() {
    if (quizInterval) {
        clearInterval(quizInterval);
        quizInterval = null;
    }
    
    // Close AI sidebar if open
    const sidebar = document.getElementById('ai-sidebar');
    const backdrop = document.getElementById('ai-backdrop');
    if (sidebar) {
        sidebar.classList.remove('open');
    }
    if (backdrop) {
        backdrop.classList.remove('show');
    }
    
    clearParagraphHighlights();
}

/**
 * Clear all paragraph highlights in the article
 */
function clearParagraphHighlights() {
    document.querySelectorAll('.paragraph-highlight').forEach(function(el) {
        el.classList.remove('paragraph-highlight');
    });
}

/**
 * Apply highlight style to a numbered paragraph
 */
function applyParagraphHighlight(paragraphNum) {
    const paragraph = document.getElementById('paragraph-' + paragraphNum);
    if (paragraph) {
        paragraph.classList.add('paragraph-highlight');
    }
}

/**
 * Close the sidebar and scroll to a highlighted paragraph
 */
function scrollToParagraph(paragraphNum) {
    const sidebar = document.getElementById('ai-sidebar');
    const backdrop = document.getElementById('ai-backdrop');
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('show');
    
    const paragraph = document.getElementById('paragraph-' + paragraphNum);
    if (paragraph) {
        paragraph.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Brief flash effect on scroll
        paragraph.classList.add('paragraph-highlight-flash');
        setTimeout(function() {
            paragraph.classList.remove('paragraph-highlight-flash');
        }, 2000);
    }
}


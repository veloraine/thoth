/**
 * Scenario Logic
 * Handles AI assistant and pop-up quiz interruptions during reading
 */

let aiInterval = null;
let quizTimeouts = [];
let quizDismissTimeout = null;
let aiQuestions = [];
let quizQuestions = [];
let aiQuestionIndex = 0;
let quizQuestionIndex = 0;
let currentQuizAnswered = false;
let currentQuizStartTime = null;
let currentQuizData = null;
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
        
        // For scenario 4, shrink AI sidebar to 60% to make room for trivia
        if (scenarioNumber === 4) {
            document.getElementById('ai-sidebar').classList.add('with-trivia');
        }
        
        // Start appropriate interruptions
        switch(scenarioNumber) {
            case 1:
                break;
            case 2:
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
    
    // Toggle sidebar open/close (push layout, no backdrop)
    toggleBtn.addEventListener('click', function() {
        const isOpen = sidebar.classList.toggle('open');
        document.body.classList.toggle('ai-sidebar-open', isOpen);
    });
    
    closeBtn.addEventListener('click', function() {
        sidebar.classList.remove('open');
        document.body.classList.remove('ai-sidebar-open');
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
        
        addInteraction('ai_question', {
            questionIndex: questionIndex,
            question: questionData.question,
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
    
    if (action.type === 'image' && action.image) {
        currentInteraction.innerHTML = `
            <div class="ai-current-question">
                <h6>Request</h6>
                <p>${action.label}</p>
            </div>
            <div class="ai-answer-display">
                <div class="infographic-container" style="position: relative; cursor: pointer;" onclick="document.getElementById('zoomModalImage').src='${action.image}'; new bootstrap.Modal(document.getElementById('imageZoomModal')).show();">
                    <img src="${action.image}" alt="Infographic" style="width:100%; border-radius:8px;">
                    <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.6); color: #fff; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 18px;" title="Click to zoom">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11M13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0"/>
                            <path d="M10.344 11.742q.044-.04.085-.082l3.15 3.15a.5.5 0 0 0 .707-.708l-3.15-3.15a7 7 0 0 1-.792.79M6.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m.354-5.854a.5.5 0 0 0-1 0V6H4.5a.5.5 0 0 0 0 1H5.9v1.854a.5.5 0 0 0 1 0V7H8.5a.5.5 0 0 0 0-1H6.854z"/>
                        </svg>
                    </div>
                </div>
                <p style="margin: 6px 0 0; font-size: 12px; color: #6c757d; text-align: center;">Click image to zoom</p>
            </div>
        `;
        
        addInteraction('ai_quick_action', {
            actionLabel: action.label,
            startTime: startTime,
            endTime: new Date().toISOString()
        });
        return;
    }
    
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
    
    const thinkingDelay = Math.floor(Math.random() * 3000) + 1000;
    
    setTimeout(function() {
        currentInteraction.innerHTML = `
            <div class="ai-current-question">
                <h6>Request</h6>
                <p>${action.label}</p>
            </div>
            <div class="ai-answer-display">
                <h6><span>💡</span> AI Response</h6>
                <p>${action.response || ''}</p>
            </div>
        `;
        
        addInteraction('ai_quick_action', {
            actionLabel: action.label,
            startTime: startTime,
            endTime: new Date().toISOString()
        });
    }, thinkingDelay);
}

/**
 * Start pop-up quiz interruptions at fixed times (1min, 3min, 5min)
 */
function startQuizInterruptions() {
    const schedule = [60, 180, 300];
    
    schedule.forEach(function(delaySec, index) {
        if (index < quizQuestions.length) {
            const t = setTimeout(function() {
                showQuiz(index);
            }, delaySec * 1000);
            quizTimeouts.push(t);
        }
    });
}

/**
 * Show quiz question by index in the trivia panel
 */
function showQuiz(index) {
    if (index >= quizQuestions.length) return;
    
    // If a previous question is still showing unanswered, record it as skipped
    if (currentQuizData !== null && !currentQuizAnswered) {
        addInteraction('trivia', {
            question: currentQuizData.question,
            selectedAnswer: '(unanswered)',
            startTime: currentQuizStartTime,
            endTime: new Date().toISOString()
        });
    }
    
    if (quizDismissTimeout) {
        clearTimeout(quizDismissTimeout);
        quizDismissTimeout = null;
    }
    
    const questionData = quizQuestions[index];
    currentQuizData = questionData;
    currentQuizAnswered = false;
    currentQuizStartTime = new Date().toISOString();
    quizQuestionIndex = index;
    
    const triviaPanel = document.getElementById('trivia-panel');
    const submitBtn = document.getElementById('trivia-submit-btn');
    
    document.getElementById('trivia-question').textContent = questionData.question;
    submitBtn.disabled = false;
    
    const optionsContainer = document.getElementById('trivia-options');
    optionsContainer.innerHTML = '';
    
    questionData.options.forEach((option, optIdx) => {
        const div = document.createElement('div');
        div.className = 'form-check mb-2';
        div.innerHTML = `
            <input class="form-check-input" type="radio" name="trivia-answer" id="trivia_${optIdx}" value="${optIdx}" required>
            <label class="form-check-label" for="trivia_${optIdx}">
                ${option}
            </label>
        `;
        optionsContainer.appendChild(div);
    });
    
    triviaPanel.classList.add('open');
    document.body.classList.add('trivia-panel-open');
    
    submitBtn.onclick = function() {
        const selectedOption = document.querySelector('input[name="trivia-answer"]:checked');
        if (!selectedOption) {
            alert('Please select an answer');
            return;
        }
        
        currentQuizAnswered = true;
        submitBtn.disabled = true;
        
        // Lock all radio buttons so the selection can't be changed
        document.querySelectorAll('input[name="trivia-answer"]').forEach(function(r) {
            r.disabled = true;
        });
        
        addInteraction('trivia', {
            question: questionData.question,
            selectedAnswer: questionData.options[parseInt(selectedOption.value)],
            startTime: currentQuizStartTime,
            endTime: new Date().toISOString()
        });
        
        // Keep panel visible for 20s then dismiss
        quizDismissTimeout = setTimeout(function() {
            dismissQuizPanel();
        }, 20000);
    };
}

/**
 * Dismiss the quiz panel
 */
function dismissQuizPanel() {
    const triviaPanel = document.getElementById('trivia-panel');
    triviaPanel.classList.remove('open');
    document.body.classList.remove('trivia-panel-open');
    currentQuizData = null;
    currentQuizStartTime = null;
    if (quizDismissTimeout) {
        clearTimeout(quizDismissTimeout);
        quizDismissTimeout = null;
    }
}

/**
 * Stop all scenario interruptions
 */
function stopScenario() {
    quizTimeouts.forEach(function(t) { clearTimeout(t); });
    quizTimeouts = [];
    if (quizDismissTimeout) {
        clearTimeout(quizDismissTimeout);
        quizDismissTimeout = null;
    }
    
    // Close AI sidebar if open
    const sidebar = document.getElementById('ai-sidebar');
    if (sidebar) {
        sidebar.classList.remove('open');
    }
    document.body.classList.remove('ai-sidebar-open');
    
    // Close trivia panel if open
    const triviaPanel = document.getElementById('trivia-panel');
    if (triviaPanel) {
        triviaPanel.classList.remove('open');
    }
    document.body.classList.remove('trivia-panel-open');
    
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
    if (sidebar) sidebar.classList.remove('open');
    document.body.classList.remove('ai-sidebar-open');
    
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


/**
 * Local Storage Management
 * Handles session data storage and retrieval
 */

const SESSION_KEY = 'researchSession';

/**
 * Initialize a new session
 */
function initSession(userId, scenario) {
    const session = {
        userId: userId,
        scenario: scenario,
        consentTime: new Date().toISOString(),
        readingStartTime: null,
        readingEndTime: null,
        readingDuration: 0,
        interactions: [],
        manipulationCheckAnswers: {},
        selfReportAnswers: {},
        readingComprehensionAnswers: {},
        readingComprehensionScore: 0,
        postExperimentAnswers: {}
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
}

/**
 * Get current session
 */
function getSession() {
    try {
        const sessionData = localStorage.getItem(SESSION_KEY);
        if (!sessionData) {
            return null;
        }
        return JSON.parse(sessionData);
    } catch (error) {
        console.error('Error reading session:', error);
        return null;
    }
}

/**
 * Update session data
 */
function updateSession(updates) {
    const session = getSession();
    if (!session) {
        console.error('No session found to update');
        return null;
    }
    
    // Merge updates into session
    const updatedSession = {
        ...session,
        ...updates
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
    return updatedSession;
}

/**
 * Add an interaction record (for AI assistant or quiz)
 */
function addInteraction(type, data) {
    const session = getSession();
    if (!session) {
        console.error('No session found');
        return;
    }
    
    const interaction = {
        type: type, // 'ai' or 'quiz'
        timestamp: new Date().toISOString(),
        ...data
    };
    
    session.interactions.push(interaction);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/**
 * Clear session data
 */
function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

/**
 * Export session data for submission
 */
function exportSessionData() {
    const session = getSession();
    if (!session) {
        return null;
    }
    
    // Format data for Google Sheets
    return {
        userId: session.userId,
        scenario: session.scenario,
        consentTime: session.consentTime,
        readingStartTime: session.readingStartTime,
        readingEndTime: session.readingEndTime,
        readingDuration: session.readingDuration,
        interactions: JSON.stringify(session.interactions),
        interactionCount: session.interactions.length,
        manipulationCheckAnswers: JSON.stringify(session.manipulationCheckAnswers),
        selfReportAnswers: JSON.stringify(session.selfReportAnswers),
        readingComprehensionAnswers: JSON.stringify(session.readingComprehensionAnswers),
        readingComprehensionScore: session.readingComprehensionScore || 0,
        postExperimentAnswers: JSON.stringify(session.postExperimentAnswers),
        submitTime: new Date().toISOString()
    };
}


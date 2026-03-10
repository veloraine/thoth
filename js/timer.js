/**
 * Timer Functionality
 * Countdown timer for timed tests
 */

let timerInterval = null;

/**
 * Start a countdown timer
 * @param {number} seconds - Total seconds for the timer
 * @param {function} onComplete - Callback function when timer reaches 0
 */
function startTimer(seconds, onComplete) {
    let remainingSeconds = seconds;
    
    // Update display immediately
    updateTimerDisplay(remainingSeconds);
    
    // Record start time
    updateSession({ miniTestStartTime: new Date().toISOString() });
    
    // Start countdown
    timerInterval = setInterval(function() {
        remainingSeconds--;
        
        // Check if time's up
        if (remainingSeconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            
            // Ensure display shows 0:00
            updateTimerDisplay(0);
            
            // Change badge color to danger when time's up
            const badge = document.getElementById('timer-display');
            if (badge) {
                badge.classList.remove('bg-warning');
                badge.classList.add('bg-danger', 'text-white');
            }
            
            // Call completion callback
            if (onComplete && typeof onComplete === 'function') {
                onComplete();
            }
            return;
        }
        
        // Update display
        updateTimerDisplay(remainingSeconds);
        
        // Change to red when under 30 seconds
        if (remainingSeconds <= 30) {
            const badge = document.getElementById('timer-display');
            if (badge) {
                badge.classList.remove('bg-warning');
                badge.classList.add('bg-danger', 'text-white');
            }
        }
    }, 1000);
    
    return timerInterval;
}

/**
 * Stop the timer
 */
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

/**
 * Update timer display
 * @param {number} seconds - Remaining seconds
 */
function updateTimerDisplay(seconds) {
    const safeSeconds = Math.max(0, seconds);
    const minutes = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    
    const display = `${minutes}:${secs.toString().padStart(2, '0')}`;
    
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        timerElement.textContent = display;
    }
}

/**
 * Format seconds to MM:SS
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}


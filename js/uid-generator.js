/**
 * Unique ID Generator
 * Generates a 9-character alphanumeric unique ID for participants
 */

function generateUserId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let userId = '';
    
    // Generate 9 random characters
    for (let i = 0; i < 9; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        userId += characters[randomIndex];
    }
    
    // Add timestamp component to ensure uniqueness (last 4 chars)
    const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
    
    // Combine random chars with timestamp (9 chars total)
    userId = userId.slice(0, 5) + timestamp.slice(0, 4);
    
    return userId;
}

/**
 * Validate user ID format
 */
function isValidUserId(userId) {
    if (!userId || typeof userId !== 'string') {
        return false;
    }
    
    // Check if it's 9 characters and alphanumeric
    const regex = /^[A-Z0-9]{9}$/;
    return regex.test(userId);
}


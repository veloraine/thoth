/**
 * Configuration Loader
 * Loads configuration files (JSON and Markdown) from the config directory
 */

async function loadConfig(path) {
    try {
        const response = await fetch(`config/${path}?_=${Date.now()}`);
        
        if (!response.ok) {
            throw new Error(`Failed to load config: ${path}`);
        }
        
        // If it's a markdown file, return as text
        if (path.endsWith('.md')) {
            return await response.text();
        }
        
        // If it's a JSON file, parse and return
        if (path.endsWith('.json')) {
            return await response.json();
        }
        
        return await response.text();
    } catch (error) {
        console.error(`Error loading config file: ${path}`, error);
        throw error;
    }
}

/**
 * Load settings with defaults
 */
async function loadSettings() {
    try {
        const settings = await loadConfig('general/settings.json');
        
        // Provide default values if not specified
        return {
            localMode: settings.localMode !== undefined ? settings.localMode : false,
            miniTestTimer: settings.miniTestTimer || 120,
            readingTimer: settings.readingTimer || 480,
            aiQuestionInterval: settings.aiQuestionInterval || 30,
            popupQuizInterval: settings.popupQuizInterval || 45,
            popupQuizCount: settings.popupQuizCount || 3,
            supabaseUrl: settings.supabaseUrl || '',
            supabaseAnonKey: settings.supabaseAnonKey || ''
        };
    } catch (error) {
        console.error('Error loading settings:', error);
        return {
            localMode: false,
            miniTestTimer: 120,
            readingTimer: 480,
            aiQuestionInterval: 30,
            popupQuizInterval: 45,
            popupQuizCount: 3,
            supabaseUrl: '',
            supabaseAnonKey: ''
        };
    }
}


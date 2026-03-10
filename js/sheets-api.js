/**
 * Google Sheets API Integration
 * Submits participant data to Google Sheets or exports to CSV in local mode
 */

/**
 * Submit data to Google Sheets or export to CSV (local mode)
 */
async function submitToGoogleSheets(sessionData) {
    // Export and format session data first
    const data = exportSessionData();
    
    if (!data) {
        console.error('No session data found to submit');
        // In case of error, still proceed in local mode
        return { localMode: true, error: 'No session data' };
    }
    
    try {
        // Load settings to get API credentials and local mode status
        const settings = await loadSettings();
        
        // Check if in local mode
        if (settings.localMode === true) {
            console.log('Local mode enabled - skipping Google Sheets submission');
            // Store data for CSV export
            window._localSubmissionData = data;
            return { localMode: true, data: data, success: true };
        }
        
        // Production mode - submit to Google Sheets
        if (!settings.googleApiKey || !settings.googleSheetId) {
            console.warn('Google Sheets API credentials not configured. Treating as local mode.');
            window._localSubmissionData = data;
            return { localMode: true, data: data, success: true };
        }
        
        // Prepare row data for Google Sheets
        const values = [[
            data.userId,
            data.scenario,
            data.consentTime,
            data.miniTestAnswers,
            data.readingStartTime,
            data.readingEndTime,
            data.readingDuration,
            data.interactionCount,
            data.interactions,
            data.manipulationCheckAnswers,
            data.selfReportAnswers,
            data.readingComprehensionAnswers,
            data.postExperimentAnswers,
            data.submitTime
        ]];
        
        // Construct Google Sheets API URL
        const range = 'Sheet1!A:N'; // Adjust range as needed
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${settings.googleSheetId}/values/${range}:append?valueInputOption=USER_ENTERED&key=${settings.googleApiKey}`;
        
        // Make API request
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                values: values
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Google Sheets API Error:', errorData);
            throw new Error(`Failed to submit data: ${errorData.error?.message || response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Data submitted successfully:', result);
        
        return result;
        
    } catch (error) {
        console.error('Error submitting to Google Sheets:', error);
        console.log('Falling back to local mode due to error');
        // Store data locally as fallback
        window._localSubmissionData = data;
        return { localMode: true, data: data, success: true, fallback: true };
    }
}

/**
 * Export data to CSV file (for local testing)
 */
function exportToCSV() {
    const data = window._localSubmissionData || exportSessionData();
    
    if (!data) {
        alert('No data available to export. Please complete the study first.');
        return;
    }
    
    // CSV headers
    const headers = [
        'User ID',
        'Scenario',
        'Consent Time',
        'Mini Test Answers',
        'Reading Start',
        'Reading End',
        'Reading Duration',
        'Interaction Count',
        'Interactions',
        'Manipulation Check',
        'Self Report',
        'Reading Comprehension',
        'Post Experiment',
        'Submit Time'
    ];
    
    // CSV row
    const row = [
        data.userId,
        data.scenario,
        data.consentTime,
        data.miniTestAnswers,
        data.readingStartTime,
        data.readingEndTime,
        data.readingDuration,
        data.interactionCount,
        data.interactions,
        data.manipulationCheckAnswers,
        data.selfReportAnswers,
        data.readingComprehensionAnswers,
        data.postExperimentAnswers,
        data.submitTime
    ];
    
    // Escape CSV values (handle commas and quotes)
    const escapeCSV = (value) => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    };
    
    // Build CSV content
    const csvContent = [
        headers.map(escapeCSV).join(','),
        row.map(escapeCSV).join(',')
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `research_data_${data.userId}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('CSV exported successfully');
}

/**
 * Test Google Sheets connection
 * Call this function to verify API credentials are working
 */
async function testGoogleSheetsConnection() {
    try {
        const settings = await loadSettings();
        
        if (!settings.googleApiKey || !settings.googleSheetId) {
            return {
                success: false,
                message: 'API credentials not configured'
            };
        }
        
        // Try to read spreadsheet metadata
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${settings.googleSheetId}?key=${settings.googleApiKey}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorData = await response.json();
            return {
                success: false,
                message: `API Error: ${errorData.error?.message || response.statusText}`
            };
        }
        
        const data = await response.json();
        return {
            success: true,
            message: `Connected to spreadsheet: ${data.properties.title}`,
            spreadsheetTitle: data.properties.title
        };
        
    } catch (error) {
        return {
            success: false,
            message: `Connection failed: ${error.message}`
        };
    }
}


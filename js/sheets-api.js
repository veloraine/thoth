/**
 * Data Submission
 * Submits participant data to Supabase or exports to CSV in local mode
 */

/**
 * Submit data to Supabase or fall back to local/CSV mode
 */
async function submitToGoogleSheets(sessionData) {
    const data = exportSessionData();
    
    if (!data) {
        console.error('No session data found to submit');
        return { localMode: true, error: 'No session data' };
    }
    
    try {
        const settings = await loadSettings();
        
        if (settings.localMode === true) {
            console.log('Local mode enabled - skipping remote submission');
            window._localSubmissionData = data;
            return { localMode: true, data: data, success: true };
        }
        
        // Submit to Supabase if configured
        if (settings.supabaseUrl && settings.supabaseAnonKey) {
            return await submitToSupabase(data, settings);
        }
        
        console.warn('No remote backend configured. Falling back to local mode.');
        window._localSubmissionData = data;
        return { localMode: true, data: data, success: true };
        
    } catch (error) {
        console.error('Error submitting data:', error);
        console.log('Falling back to local mode due to error');
        window._localSubmissionData = data;
        return { localMode: true, data: data, success: true, fallback: true };
    }
}

/**
 * Submit data to Supabase via PostgREST API
 */
async function submitToSupabase(data, settings) {
    const row = {
        user_id: data.userId,
        scenario: data.scenario,
        consent_time: data.consentTime,
        mini_test_answers: data.miniTestAnswers,
        reading_start_time: data.readingStartTime,
        reading_end_time: data.readingEndTime,
        reading_duration: data.readingDuration,
        interaction_count: data.interactionCount,
        interactions: data.interactions,
        manipulation_check_answers: data.manipulationCheckAnswers,
        self_report_answers: data.selfReportAnswers,
        reading_comprehension_answers: data.readingComprehensionAnswers,
        post_experiment_answers: data.postExperimentAnswers,
        submit_time: data.submitTime
    };
    
    const response = await fetch(`${settings.supabaseUrl}/rest/v1/responses`, {
        method: 'POST',
        headers: {
            'apikey': settings.supabaseAnonKey,
            'Authorization': `Bearer ${settings.supabaseAnonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify(row)
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Supabase API Error:', errorText);
        throw new Error(`Supabase submission failed: ${response.status} ${errorText}`);
    }
    
    console.log('Data submitted to Supabase successfully');
    window._localSubmissionData = data;
    return { success: true, data: data };
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
    
    const escapeCSV = (value) => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    };
    
    const csvContent = [
        headers.map(escapeCSV).join(','),
        row.map(escapeCSV).join(',')
    ].join('\n');
    
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

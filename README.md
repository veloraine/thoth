# Research Reading Website - Thoth

A static website for conducting reading comprehension research with configurable scenarios, AI assistance simulation, and Google Sheets data collection.

## 📋 Overview

This website enables researchers to study the effects of AI assistance and interruptions on reading comprehension. It includes:

- 4 experimental scenarios (control, AI assistance, pop-up quizzes, or both)
- Timed mini reading comprehension test
- Main article reading with configurable interruptions
- Post-reading questionnaires (manipulation check, self-report, comprehension, demographics)
- Google Sheets integration for automatic data collection
- Fully configurable via Markdown and JSON files
- Mobile-responsive Bootstrap 5 design

## 🚀 Quick Start

### 1. Clone or Download

Download this repository to your local machine.

### 2. Configure Settings

Edit `config/general/settings.json`:

```json
{
  "miniTestTimer": 120,
  "readingTimer": 480,
  "aiQuestionInterval": 30,
  "popupQuizInterval": 45,
  "popupQuizCount": 3,
  "googleSheetId": "YOUR_GOOGLE_SHEET_ID_HERE",
  "googleApiKey": "YOUR_GOOGLE_API_KEY_HERE"
}
```

### 3. Local Testing Mode (Optional)

For local testing without Google Sheets:
- Set `"localMode": true` in `config/general/settings.json`
- Complete the study flow
- Download data as CSV from the thank you page

**Important:** Set `"localMode": false` before deploying to production!

### 4. Set Up Google Sheets (see detailed instructions below)

### 5. Deploy to GitHub Pages

1. Create a new GitHub repository
2. Push all files to the repository
3. Go to Settings → Pages
4. Select branch (usually `main`) and root folder
5. Click Save
6. Your site will be live at `https://yourusername.github.io/repository-name/`

## 📊 Google Sheets Setup (Step-by-Step)

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project"
3. Enter a project name (e.g., "Reading Research Study")
4. Click "Create"

### Step 2: Enable Google Sheets API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

### Step 3: Create API Key

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Your API key will be generated
4. Click "Edit API key" to add restrictions:
   - Under "Application restrictions", select "HTTP referrers (web sites)"
   - Add your GitHub Pages URL: `https://yourusername.github.io/repository-name/*`
   - Under "API restrictions", select "Restrict key" and choose "Google Sheets API"
5. Click "Save"
6. Copy your API key

### Step 4: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new spreadsheet
3. Name it (e.g., "Reading Research Data")
4. In the first row, add these column headers:
   ```
   User ID | Scenario | Consent Time | Mini Test Answers | Reading Start | Reading End | Reading Duration | Interaction Count | Interactions | Manipulation Check | Self Report | Reading Comprehension | Post Experiment | Submit Time
   ```

### Step 5: Share the Sheet

1. Click the "Share" button
2. Change access to "Anyone with the link" → "Editor" (or "Viewer" if you want read-only)
3. Copy the spreadsheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Copy only the `SPREADSHEET_ID` part

### Step 6: Update Configuration

1. Open `config/general/settings.json`
2. Replace `YOUR_GOOGLE_SHEET_ID_HERE` with your spreadsheet ID
3. Replace `YOUR_GOOGLE_API_KEY_HERE` with your API key
4. Save the file

### Step 7: Test Connection

1. Open your browser's developer console (F12)
2. Navigate to your deployed website
3. In the console, run:
   ```javascript
   testGoogleSheetsConnection().then(result => console.log(result));
   ```
4. You should see a success message with your spreadsheet name

## 📁 File Structure

```
thoth/
├── index.html                    # Consent page with unique ID generation
├── instruction.html              # Main study instructions
├── mini-test.html                # Timed reading comprehension test (2 min)
├── scenario-instruction.html     # Scenario-specific instructions
├── reading.html                  # Main reading page with scenarios
├── manipulation-check.html       # Post-reading questionnaire 1/4
├── self-report.html              # Post-reading questionnaire 2/4
├── reading-comprehension.html    # Post-reading questionnaire 3/4
├── post-experiment.html          # Post-reading questionnaire 4/4
├── thank-you.html                # Final thank you page with completion code
│
├── css/
│   └── style.css                 # Custom styles
│
├── js/
│   ├── config.js                 # Configuration loader
│   ├── uid-generator.js          # Unique ID generator
│   ├── storage.js                # LocalStorage management
│   ├── timer.js                  # Timer functionality
│   ├── scenarios.js              # Scenario logic (AI/Quiz)
│   └── sheets-api.js             # Google Sheets integration
│
├── config/
│   ├── general/
│   │   ├── settings.json         # Timers, intervals, API keys
│   │   ├── consent.md            # Consent form content
│   │   └── main-instruction.md   # Main instructions
│   ├── pre-test/
│   │   └── mini-test-questions.json
│   ├── reading/
│   │   ├── article.md
│   │   ├── ai-questions.json
│   │   └── popup-quiz.json
│   ├── scenario/
│   │   ├── scenario-1.md         # Uninterrupted reading (control) instructions
│   │   ├── scenario-2.md         # AI Assistant scenario instructions
│   │   ├── scenario-3.md         # Pop-up Quiz scenario instructions
│   │   └── scenario-4.md         # Both features scenario instructions
│   └── post-test/
│       ├── manipulation-check.json
│       ├── self-report.json
│       ├── reading-comprehension.json
│       └── post-experiment.json
│
└── README.md                     # This file
```

## ⚙️ Configuration Guide

### Modifying Content

All content is configurable without touching HTML/JavaScript:

#### Consent Form
Edit `config/general/consent.md` with your institution's consent language.

#### Main Instructions
Edit `config/general/main-instruction.md` to customize study instructions.

#### Article Content
Edit `config/reading/article.md` to change the reading material.

#### Scenario Instructions
Edit the individual scenario files to customize what participants see:
- `config/scenario/scenario-1.md` - Uninterrupted reading (control) instructions
- `config/scenario/scenario-2.md` - AI Assistant instructions
- `config/scenario/scenario-3.md` - Pop-up Quiz instructions
- `config/scenario/scenario-4.md` - Both features instructions

These Markdown files support full formatting (headings, lists, bold, italic, code blocks, etc.).

#### Questions
Edit JSON files in `config/pre-test/` and `config/post-test/` to modify questions.

### Adjusting Timers and Intervals

Edit `config/general/settings.json`:
- `miniTestTimer`: Seconds for the mini test (default: 120 = 2 minutes)
- `readingTimer`: Seconds for the reading session (default: 480 = 8 minutes)
- `aiQuestionInterval`: Seconds between AI questions (default: 30)
- `popupQuizInterval`: Seconds between pop-up quizzes (default: 45)
- `popupQuizCount`: Maximum number of pop-up quizzes (default: 3)

### Question Formats

The system supports multiple question types:

#### Multiple Choice
```json
{
  "id": "q1",
  "question": "What is the capital of France?",
  "type": "multiple-choice",
  "options": ["London", "Paris", "Berlin", "Madrid"],
  "correctAnswer": 1
}
```

#### Likert Scale
```json
{
  "id": "q2",
  "question": "How focused were you?",
  "type": "likert",
  "scale": 7,
  "labels": ["Not focused", "Very focused"]
}
```

#### Text Input
```json
{
  "id": "q3",
  "question": "What is your major?",
  "type": "text"
}
```

#### Number Input
```json
{
  "id": "q4",
  "question": "What is your age?",
  "type": "number"
}
```

## 🔄 Participant Flow

1. **Consent** → Generate unique 9-digit ID, assign scenario (1-4)
2. **Instructions** → General study information
3. **Mini Test** → Timed 2-minute reading comprehension test
4. **Scenario Instructions** → What to expect in their assigned scenario
5. **Reading** → Main article with scenario-specific interruptions
6. **Manipulation Check** → Verify interventions were noticed
7. **Self-Report** → Subjective experience ratings
8. **Reading Comprehension** → Questions about the article
9. **Post-Experiment** → MMI, AI experience, demographics
10. **Thank You** → Display completion code and URL for participant

## 📈 Data Collection

Data is automatically submitted to your Google Sheet with these columns:

- **User ID**: 9-digit unique identifier
- **Scenario**: 1-4 (randomly assigned)
- **Consent Time**: ISO timestamp
- **Mini Test Answers**: JSON string of answers
- **Reading Start/End**: ISO timestamps
- **Reading Duration**: Seconds spent reading
- **Interaction Count**: Number of AI/quiz interactions
- **Interactions**: JSON array of all interactions with timestamps
- **Manipulation Check Answers**: JSON string
- **Self Report Answers**: JSON string
- **Reading Comprehension Answers**: JSON string
- **Post Experiment Answers**: JSON string (includes MMI, AI experience, demographics)
- **Submit Time**: ISO timestamp

### Exporting Data

1. Open your Google Sheet
2. File → Download → CSV or Excel
3. Use your preferred statistical software for analysis

## 🎨 Customization

### Changing Completion URL

Edit `thank-you.html` to customize the completion URL participants receive. Find this line:

```javascript
const completionUrl = `https://example.com/complete/${userId}`;
```

Replace `https://example.com/complete/` with your actual completion URL (e.g., a survey platform, reward system, or confirmation page).

### Changing Colors

Edit `css/style.css` CSS variables:
```css
:root {
    --primary-color: #2c3e50;
    --secondary-color: #3498db;
    --success-color: #27ae60;
    --warning-color: #f39c12;
    --danger-color: #e74c3c;
}
```

### Modifying Scenarios

Edit the individual Markdown files in `config/scenario/`:
- `scenario-1.md` - Instructions for control (no interruptions) condition
- `scenario-2.md` - Instructions for AI Assistant condition
- `scenario-3.md` - Instructions for Pop-up Quiz condition
- `scenario-4.md` - Instructions for combined (both features) condition

These files support full Markdown formatting including:
- Headings (# ## ###)
- **Bold** and *italic* text
- Bullet lists and numbered lists
- Code blocks with ```
- Blockquotes with >
- And more!

To modify interruption timing or behavior, edit `js/scenarios.js` (advanced).

## 🐛 Troubleshooting

### Local Testing Mode

For testing locally without setting up Google Sheets:

1. Open `config/general/settings.json`
2. Set `"localMode": true`
3. Run your local server (e.g., `python3 -m http.server 8000`)
4. Complete the study flow normally
5. On the thank you page, click "Download Data as CSV"
6. CSV files will download to your browser's download folder

**Remember:** Set `"localMode": false` before deploying to production!

### Data Not Submitting

1. Check browser console (F12) for error messages
2. Verify Google Sheets API key is correct in `config/general/settings.json`
3. Ensure spreadsheet ID is correct
4. Verify spreadsheet sharing settings (must be "Anyone with link" can edit)
5. Check that Google Sheets API is enabled in Google Cloud Console
6. Make sure `"localMode"` is set to `false` in settings.json

### Timer Not Working

1. Ensure `config/general/settings.json` is properly formatted JSON
2. Check browser console for errors
3. Try refreshing the page

### Questions Not Loading

1. Verify JSON files are properly formatted (use JSONLint.com)
2. Check that file paths in config are correct
3. Look for errors in browser console

## 🔒 Privacy & Ethics

- No personally identifiable information is collected
- Participants receive unique anonymous IDs
- All data collection should comply with your institution's IRB requirements
- Update `config/general/consent.md` with your institution's requirements

## 📝 Citation

If you use this tool in your research, please cite:

```
[Your Name]. (2026). Thoth: Configurable Research Reading Website.
GitHub repository: [Your Repository URL]
```

## 🤝 Support

For issues or questions:
- Check the troubleshooting section above
- Review configuration files for proper JSON formatting
- Check browser console for error messages

## 📜 License

MIT License - Free to use for research purposes

---

**Built with:** Vanilla JavaScript, Bootstrap 5, Google Sheets API
**Deploy to:** GitHub Pages (free, no server required)
**Cost:** $0 (uses free tiers of all services)


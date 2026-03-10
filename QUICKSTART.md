# Quick Start Guide

Get your research website running in 3 steps!

## Step 1: Test Locally (Optional)

To test locally, you'll need a simple HTTP server because browsers block loading local files directly.

**Option A: Using Python (if installed)**
```bash
cd thoth
python3 -m http.server 8000
```
Then open http://localhost:8000 in your browser.

**Option B: Using VS Code**
Install the "Live Server" extension and click "Go Live" in the bottom right.

**Local Testing Mode:**
- Set `"localMode": true` in `config/general/settings.json`
- Complete the study flow and download CSV data from the thank you page
- **Remember:** Set `"localMode": false` before deploying to production!

## Step 2: Set Up Google Sheets

1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable "Google Sheets API"
4. Create an API Key (under Credentials)
5. Add restriction: Your GitHub Pages URL (you'll get this in Step 3)
6. Create a Google Sheet and copy its ID from the URL
7. Make the sheet shareable: "Anyone with link" → "Editor"
8. Update `config/general/settings.json` with your API key and sheet ID

**Detailed instructions:** See README.md → "Google Sheets Setup"

## Step 3: Deploy to GitHub Pages

1. Create a new repository on GitHub
2. Initialize git in your project folder:
   ```bash
   cd thoth
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/yourrepo.git
   git push -u origin main
   ```
3. Go to your repository Settings → Pages
4. Select branch: `main`, folder: `/ (root)`
5. Click Save
6. Your site will be live at: `https://yourusername.github.io/yourrepo/`

## Step 4: Update API Restrictions

1. Go back to Google Cloud Console
2. Edit your API Key
3. Add your GitHub Pages URL as an allowed HTTP referrer:
   `https://yourusername.github.io/yourrepo/*`
4. Save

## Done! 🎉

Your research website is now live and collecting data to Google Sheets!

## Testing Your Setup

1. Visit your GitHub Pages URL
2. Complete the full study flow
3. Check your Google Sheet for the submitted data
4. If data doesn't appear, check browser console (F12) for errors

## Customization

### Change Completion URL
Edit: `thank-you.html` (line ~102)
- Replace `https://example.com/complete/` with your actual URL
- The `${userId}` will be automatically included

### Change the Article
Edit: `config/reading/article.md`

### Change Questions
Edit JSON files in:
- `config/pre-test/` - Mini test questions
- `config/post-test/` - All post-reading questionnaires

### Change Timers
Edit: `config/general/settings.json`
- `miniTestTimer`: Seconds for mini test (default: 120)
- `readingTimer`: Seconds for reading (default: 480)
- `aiQuestionInterval`: Seconds between AI help (default: 30)
- `popupQuizInterval`: Seconds between quizzes (default: 45)

### Change Consent Form
Edit: `config/general/consent.md`

## Need Help?

Check the full README.md for:
- Detailed Google Sheets setup
- Troubleshooting common issues
- Advanced customization options
- Question format examples

## Common Issues

**Data not submitting?**
- Check Google Sheets API key and sheet ID in `config/general/settings.json`
- Verify sheet is shared as "Anyone with link" → "Editor"
- Check browser console (F12) for errors

**Timer not starting?**
- Verify `config/general/settings.json` is valid JSON
- Check browser console for errors

**Questions not showing?**
- Validate JSON format at jsonlint.com
- Ensure all question files exist in config folders


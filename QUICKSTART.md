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

## Step 2: Set Up Supabase (Data Backend)

Since GitHub Pages requires a public repo, we use Supabase as the data backend. The Supabase `anon` key is safe to be public — data is protected by Row Level Security (RLS).

### 2a. Create a Supabase Project

1. Go to https://supabase.com and create a free account
2. Create a new project
3. Note your **Project URL** and **anon public key** (Settings → API)

### 2b. Create the Database Table

Go to the **SQL Editor** in your Supabase dashboard and run:

```sql
CREATE TABLE responses (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id TEXT NOT NULL,
  scenario INTEGER,
  consent_time TEXT,
  mini_test_answers TEXT,
  reading_start_time TEXT,
  reading_end_time TEXT,
  reading_duration INTEGER,
  interaction_count INTEGER,
  interactions TEXT,
  manipulation_check_answers TEXT,
  self_report_answers TEXT,
  reading_comprehension_answers TEXT,
  post_experiment_answers TEXT,
  submit_time TEXT
);
```

### 2c. Set Up Row Level Security (RLS)

This ensures participants can only INSERT data but never read other responses:

```sql
-- Enable RLS
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (submit responses)
CREATE POLICY "Allow anonymous inserts"
  ON responses FOR INSERT
  WITH CHECK (true);

-- No SELECT/UPDATE/DELETE policy = no public read access
-- Only you can read data via the Supabase dashboard or service role key
```

### 2d. Update Settings

Edit `config/general/settings.json`:

```json
{
  "localMode": false,
  "supabaseUrl": "https://YOUR_PROJECT_ID.supabase.co",
  "supabaseAnonKey": "YOUR_ANON_KEY_HERE",
  ...
}
```

> **Why is the anon key safe to be public?** Supabase's anon key is designed for client-side use. With RLS enabled, it can only perform operations you explicitly allow (INSERT only, in our case). Nobody can read, update, or delete data with it.

## Step 3: Deploy to GitHub Pages

1. Create a new repository on GitHub
2. Initialize git in your project folder:
   ```bash
   cd thoth
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

### Scenario-Specific Links

You can distribute links that force a specific scenario:
- `https://yourusername.github.io/yourrepo/?s=1` — Scenario 1 (control)
- `https://yourusername.github.io/yourrepo/?s=2` — Scenario 2 (AI only)
- `https://yourusername.github.io/yourrepo/?s=3` — Scenario 3 (quiz only)
- `https://yourusername.github.io/yourrepo/?s=4` — Scenario 4 (AI + quiz)

Without `?s=`, scenarios are assigned randomly.

## Done!

Your research website is now live and collecting data to Supabase!

## Testing Your Setup

1. Visit your GitHub Pages URL
2. Complete the full study flow
3. Check your Supabase dashboard (Table Editor → responses) for the submitted data
4. If data doesn't appear, check browser console (F12) for errors

## Customization

### Change the Article
Edit: `config/reading/article.md`

### Change Questions
Edit JSON files in:
- `config/pre-test/` - Mini test questions
- `config/reading/` - AI questions and pop-up quiz
- `config/post-test/` - All post-reading questionnaires

### Change Timers
Edit: `config/general/settings.json`
- `miniTestTimer`: Seconds for mini test (default: 120)
- `readingTimer`: Seconds for reading (default: 480)
- `popupQuizInterval`: Seconds between quizzes (default: 45)
- `popupQuizCount`: Max number of pop-up quizzes (default: 3)

### Change Consent Form
Edit: `config/general/consent.md`

### Change Completion URL
Edit: `thank-you.html` (~line 102)

## Common Issues

**Data not submitting?**
- Check `supabaseUrl` and `supabaseAnonKey` in `config/general/settings.json`
- Verify RLS policies are set up correctly
- Check browser console (F12) for errors

**Timer not starting?**
- Verify `config/general/settings.json` is valid JSON
- Check browser console for errors

**Questions not showing?**
- Validate JSON format at jsonlint.com
- Ensure all question files exist in config folders

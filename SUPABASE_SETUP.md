# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `exercise-counter`
   - Database Password: (choose a strong password)
   - Region: (choose closest to your location)
6. Click "Create new project"

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - Project URL
   - Project API keys > anon/public key

## 3. Update Configuration

1. Open `supabase-config.js`
2. Replace the placeholder values:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Replace with your project URL
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your anon key
   ```

## 4. Create Database Tables

1. In your Supabase dashboard, go to SQL Editor
2. Run the following SQL to create the workouts table:

```sql
-- Create workouts table
CREATE TABLE workouts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise TEXT NOT NULL,
    reps INTEGER NOT NULL,
    sets INTEGER NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scores JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assessments table
CREATE TABLE assessments (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sport TEXT NOT NULL,
    assessment_data JSONB NOT NULL,
    final_scores JSONB NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_date ON workouts(date);
CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_sport ON assessments(sport);
CREATE INDEX idx_assessments_date ON assessments(date);

-- Enable Row Level Security (RLS)
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Create policies for workouts table
CREATE POLICY "Users can view their own workouts" ON workouts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workouts" ON workouts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts" ON workouts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts" ON workouts
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for assessments table
CREATE POLICY "Users can view their own assessments" ON assessments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessments" ON assessments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments" ON assessments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assessments" ON assessments
    FOR DELETE USING (auth.uid() = user_id);
```

## 5. Configure Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure the following:
   - Site URL: `http://localhost:3000` (or your domain)
   - Redirect URLs: Add your domain
   - Email confirmation: Enable if desired
   - Password requirements: Set minimum length to 6

## 6. Test the Setup

1. Open `index.html` in your browser
2. Try creating a new account
3. Sign in with your credentials
4. Test the exercise counter functionality

## 7. Optional: Deploy to Production

1. Deploy your files to a web hosting service (Netlify, Vercel, etc.)
2. Update the Site URL and Redirect URLs in Supabase to match your production domain
3. Update the configuration in `supabase-config.js` if needed

## Troubleshooting

- **Authentication not working**: Check that your Supabase URL and API key are correct
- **Database errors**: Ensure the workouts table was created successfully
- **CORS issues**: Make sure your domain is added to the allowed origins in Supabase
- **Email verification**: Check your spam folder for verification emails

## Security Notes

- Never commit your actual Supabase credentials to version control
- Use environment variables in production
- The anon key is safe to use in client-side code
- Row Level Security (RLS) ensures users can only access their own data

# 🚀 Quick Start - Aquasync

## Step 1: Setup Supabase (5 minutes)

1. Go to [supabase.com](https://supabase.com) → Sign up
2. Create new project → Choose name "Aquasync"
3. Go to **SQL Editor** → Run this script:

```sql
CREATE TABLE lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  instructor TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON lessons FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON lessons FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON lessons FOR DELETE USING (true);
```

4. Go to **Project Settings** → **API** → Copy:
   - Project URL
   - anon public key

## Step 2: Configure GitHub (2 minutes)

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Add two secrets:
   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key

## Step 3: Enable GitHub Pages (1 minute)

1. Go to **Settings** → **Pages**
2. Set **Source** to "GitHub Actions"

## Step 4: Deploy (1 minute)

1. Merge this PR to `main` branch, OR
2. Go to **Actions** → **Deploy to GitHub Pages** → **Run workflow**

## Step 5: Access Your App

🎉 Your app will be live at: **https://pioshin.github.io/Aquasync/**

---

📚 **Need more details?** See the complete guide in [SETUP_GUIDE.md](./SETUP_GUIDE.md)

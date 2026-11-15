# Roster — Student Sports Registry

A responsive React + Vite app for recording students' names, ages, courses, year levels, and sports. Supabase stores the records; Netlify hosts the frontend.

## 1. Create the Supabase backend

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** in your Supabase dashboard.
3. Paste and run the contents of `database.sql`.
4. Open **Project Settings → API** (or **Connect**) and copy the project URL and publishable/anon key.

> **Important:** The included SQL policies are intentionally open so a demo app can read and manage records without a login. Do not use this configuration for real sensitive student data or a public production deployment. Add Supabase Auth and restrict Row Level Security policies before collecting real personal information. Never put a `service_role` key in frontend environment variables.

## 2. Run locally

```bash
npm install
cp .env.example .env
```

Edit `.env` and enter your Supabase URL and publishable/anon key:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

Then run:

```bash
npm run dev
```

## 3. Deploy to Netlify

1. Push this project to a GitHub repository.
2. In Netlify, choose **Add new site → Import an existing project** and select the repository.
3. Netlify should detect the settings in `netlify.toml` (`npm run build`, publish directory `dist`).
4. In **Site configuration → Environment variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy (or trigger a new deploy after changing environment variables).

## Features

- Add, edit, and delete student records
- Search by name, course, year level, or sport
- Filter by sport
- Summary cards for total students, sports, and courses
- Responsive minimalist layout
- Supabase connection status and helpful setup/error messages

# Zenith Self Organizer

**Zenith** is an all-in-one **Personal Life Organizer** built as a Progressive Web App (PWA). It helps you manage finances, build positive habits, and journal your life journey in a modern, aesthetic interface designed for both Mobile and Desktop.

<img width="1920" height="976" alt="screencapture-localhost-5173-2026-01-06-14_59_21" src="https://github.com/user-attachments/assets/0394b33e-0858-4f1c-ad15-cf4d1b9718e2" />
<img width="1920" height="976" alt="screencapture-selfhabits-vercel-app-2026-01-06-15_12_22" src="https://github.com/user-attachments/assets/cc32d7c3-3f5f-4209-9eec-bf79ae6e5235" />



## Key Features

* **Wallet (Finance Manager):**
    * **Expense Tracking:** Log daily expenses with iconic categories.
    * **Visual Analytics:** Interactive Pie and Bar charts to track weekly trends.
    * **Smart Budgeting:** Set spending limits per category (Food, Transport, etc).
    * **Subscription Tracker:** Manage recurring bills like Netflix or Spotify.
    * **Calendar View:** Visual overview of daily spending patterns.
    * **Export Data:** Download financial reports as CSV/Excel files.

* **Habits (Habit Builder):**
    * **Streak Tracker:** Gamified consistency tracking.
    * **Heatmap Visualization:** GitHub-style contribution graph to view long-term performance.
    * **Flexible Targets:** Support for specific frequencies (e.g., 3x per week).

* **Journal (Life Logger):**
    * **Mood Tracker:** Track daily emotions with an emoji selector.
    * **Tagging System:** Organize entries using dynamic #tags.
    * **Rich Editor:** Distraction-free writing experience.

* **General:**
    * **PWA Support:** Installable on Android/iOS/Desktop with offline capabilities.
    * **Google Auth:** Secure and fast sign-in.
    * **Dark Mode:** Adaptive UI for visual comfort.

## Tech Stack

* **Framework:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** CSS Variables (Custom Design System) + [Lucide React](https://lucide.dev/)
* **Charting:** [Recharts](https://recharts.org/)
* **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL & Auth)
* **Deployment:** Vercel

## Getting Started

Follow these steps to run the project locally.

### Prerequisites

* Node.js (v16 or higher)
* npm or yarn
* A free [Supabase](https://supabase.com/) account

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/username-anda/zenith.git](https://github.com/username-anda/zenith.git)
    cd zenith
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Setup Database**
    Run the following SQL query in your **Supabase SQL Editor** to create the necessary tables:

    ```sql
    -- 1. Expenses Table
    CREATE TABLE expenses (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id uuid REFERENCES auth.users NOT NULL,
      description text NOT NULL,
      amount numeric NOT NULL,
      category text NOT NULL,
      date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
    );

    -- 2. Habits Table
    CREATE TABLE habits (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id uuid REFERENCES auth.users NOT NULL,
      name text NOT NULL,
      streak integer DEFAULT 0,
      completed_dates text[] DEFAULT array[]::text[],
      reminder_time text,
      target_days_per_week integer DEFAULT 7,
      created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
    );

    -- 3. Notes Table
    CREATE TABLE notes (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id uuid REFERENCES auth.users NOT NULL,
      title text,
      content text,
      mood text,
      tags text[],
      created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
    );

    -- 4. Savings Table
    CREATE TABLE savings (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id uuid REFERENCES auth.users NOT NULL,
      name text NOT NULL,
      target numeric NOT NULL,
      current numeric DEFAULT 0,
      created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
    );

    -- 5. Budgets Table
    CREATE TABLE budgets (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id uuid REFERENCES auth.users NOT NULL,
      category text NOT NULL,
      amount numeric NOT NULL,
      month_year text
    );
    ```

5.  **Enable Google Auth (Optional)**
    * Go to **Supabase Dashboard** > Authentication > Providers > Google.
    * Enter your **Client ID** & **Client Secret** from Google Cloud Console.
    * Ensure the Redirect URL in Google Cloud points to your Supabase Callback URL.

6.  **Run the App**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser.

## Build for Production

To create a production-ready build:

```bash
npm run build
```

##  License

**Built with ❤️ by [Harits Taqiy]**

# How to Access the Dashboard - Setup Guide

## Quick Start (3 Steps)

### Step 1: Create Test User

Run this command in the project root directory (with virtual environment activated):

```bash
python manage.py create_test_user
```

This will create a test account with:

- **Username:** `testuser`
- **Password:** `testpass123`

### Step 2: Start Django Server

If not already running, start the Django development server:

```bash
python manage.py runserver
```

The server will run on `http://127.0.0.1:8000`

### Step 3: Start React Dev Server

In another terminal, navigate to the client app directory:

```bash
cd client/app
npm run dev
```

The frontend will run on `http://localhost:5174`

## Login & Access Dashboard

1. Open your browser and go to `http://localhost:5174`
2. You'll see the Login page
3. Enter the credentials:
   - **Username:** `testuser`
   - **Password:** `testpass123`
4. Click "Log In"
5. After successful login, you'll be redirected to the Dashboard

## Dashboard Features

The dashboard includes:

- **Sidebar Navigation:** Dashboard, History, User Profile, Logout
- **Welcome Section:** Personalized greeting with stats
- **Stats Cards:**
  - Pending Requests (25/45)
  - Approved Requests (20)
  - On-board Count (20)
- **Data Table:** View all redemption requests with details
- **Action Buttons:** Approve/Reject/Archive requests
- **Theme Toggle:** Switch between Light/Dark mode
- **Search & Filter:** Search requests and filter by type

## API Endpoints

The backend provides these endpoints:

- `POST /login/` - User login (handles authentication)
- `GET /dashboard/` - Fetch dashboard data and stats
- `POST /requests/<id>/approve/` - Approve a request
- `POST /requests/<id>/reject/` - Reject a request

## Creating Additional Test Users (Optional)

You can modify the `create_test_user.py` command to create different users:

Edit: `server/management/commands/create_test_user.py`

Change username and password values, then run the command again.

## Troubleshooting

**Problem:** Can't login even with correct credentials

- **Solution:** Make sure Django server is running at `http://127.0.0.1:8000`
- Check the browser console for errors (F12 → Console tab)

**Problem:** Dashboard doesn't load after login

- **Solution:** Make sure React dev server is running
- Check network tab (F12 → Network) to see if `/dashboard/` API call succeeds

**Problem:** CORS errors

- **Solution:** The CORS settings are already configured for localhost:5173 and localhost:5174
- Make sure the React app is running on 5174 (should default to this after running `npm run dev`)

## Notes

- The test account credentials are temporary and stored in the SQLite database
- You can create as many test accounts as needed with the management command
- All user data is stored in `db.sqlite3`

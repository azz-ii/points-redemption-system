# 🔐 Dashboard Login Credentials

Your temporary test account has been created! Use these credentials to access the dashboard:

```
Username: testuser
Password: testpass123
```

## ✅ Quick Access Steps

1. **Make sure servers are running:**

   - Django: `python manage.py runserver` (should be on `http://127.0.0.1:8000`)
   - React: `npm run dev` in `client/app` directory (should be on `http://localhost:5174`)

2. **Open the app:**

   - Go to `http://localhost:5174` in your browser

3. **Login:**

   - Enter the credentials above
   - Click "Log In"

4. **Access Dashboard:**
   - After login, you'll automatically be redirected to the dashboard

## 📊 Dashboard Features

Once logged in, you can:

- ✓ View pending redemption requests (25/45)
- ✓ See approved requests (20)
- ✓ Check on-board count (20)
- ✓ Search and filter requests
- ✓ Approve or reject requests
- ✓ Toggle between light/dark theme
- ✓ View user profile and logout

## 🌓 Theme Support

The entire app (Login + Dashboard) supports:

- Light Mode
- Dark Mode
- System preference
- Toggle button in top-right corner

## 🐛 Troubleshooting

**Can't login?**

- Check that Django server is running at `http://127.0.0.1:8000`
- Open browser console (F12) and check for errors

**Dashboard won't load after login?**

- Make sure React dev server is running on `http://localhost:5174`
- Check network tab (F12 → Network) to see if API calls succeed

**CORS errors?**

- The backend is already configured to accept requests from localhost:5174
- Make sure React app is running on port 5174

## 📝 Notes

- This is a temporary test account for development
- The account data is stored in `db.sqlite3`
- You can create additional test accounts by running the same command again
- All login validation uses Django's authentication system

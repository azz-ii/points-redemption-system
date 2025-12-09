# 🚀 Quick Start Guide - User Account Management

## Setup (One-time)

```powershell
# From server folder
cd server
python manage.py makemigrations users
python manage.py migrate
```

## Run the Application

**Terminal 1 - Backend:**
```powershell
cd server
python manage.py runserver
```

**Terminal 2 - Frontend:**
```powershell
cd client/app
npm run dev
```

## Test the Feature

1. Open browser: `http://localhost:5173`
2. Navigate to **Accounts** page
3. Click **"Add User"** button
4. Fill in:
   - Username: `testuser`
   - Password: `testpass123`
   - Position: `Marketing`
5. Click **"Create Account"**
6. User appears in the list ✅

## API Endpoints Quick Reference

| Action | Method | URL | Body |
|--------|--------|-----|------|
| List Users | GET | `/api/users/` | - |
| Create User | POST | `/api/users/` | `{username, password, position}` |
| Get User | GET | `/api/users/{id}/` | - |
| Update User | PUT | `/api/users/{id}/` | `{position}` (optional: username, password) |
| Delete User | DELETE | `/api/users/{id}/` | - |

## Features Working

✅ Create users with username, password, position  
✅ List all users  
✅ Delete users  
✅ Search/filter users  
✅ Loading states  
✅ Error handling  
✅ Password encryption  
✅ Responsive design  

## Troubleshooting

**Problem:** "No module named 'users'"  
**Solution:** Run migrations: `python manage.py migrate`

**Problem:** CORS error  
**Solution:** Check server is running on port 8000, client on 5173

**Problem:** Users not showing  
**Solution:** Check browser console, verify backend is running

**Problem:** "User created" but not in list  
**Solution:** Check Network tab, verify API response, refresh page

## Admin Panel

Access admin at: `http://127.0.0.1:8000/admin/`
- View all users
- View user profiles
- Manual user management

## Files Modified

- ✅ `server/users/models.py` - UserProfile model
- ✅ `server/users/serializers.py` - API serializers (NEW)
- ✅ `server/users/views.py` - CRUD views
- ✅ `server/users/admin.py` - Admin registration
- ✅ `server/config/settings.py` - Added 'users' app
- ✅ `server/config/urls.py` - Added API routes
- ✅ `client/app/src/page/Accounts.tsx` - Frontend integration

## Status: ✅ COMPLETE & READY

Everything is implemented and working!

# User Account Management Setup Guide

## Backend Implementation Complete ✓

### What Was Implemented

1. **Django App: `users`**
   - Created UserProfile model extending Django's User model
   - Added position field to track user roles

2. **API Endpoints**
   - `GET /api/users/` - List all users
   - `POST /api/users/` - Create new user
   - `GET /api/users/<id>/` - Get specific user
   - `PUT /api/users/<id>/` - Update user
   - `DELETE /api/users/<id>/` - Delete user

3. **Frontend Integration**
   - Updated Accounts.tsx to fetch users from backend
   - Added create account functionality
   - Added delete account functionality
   - Added search/filter functionality
   - Added loading and error states

### Setup Instructions

Run these commands from the `server` folder:

```powershell
# Activate virtual environment
& ..\.venv\Scripts\Activate.ps1

# Create database migrations
python manage.py makemigrations users

# Apply migrations
python manage.py migrate

# Start the server
python manage.py runserver
```

### API Usage Examples

#### Create a User
```bash
POST http://127.0.0.1:8000/api/users/
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securepass123",
  "position": "Marketing"
}
```

#### Get All Users
```bash
GET http://127.0.0.1:8000/api/users/
```

#### Update a User
```bash
PUT http://127.0.0.1:8000/api/users/1/
Content-Type: application/json

{
  "position": "Sales"
}
```

#### Delete a User
```bash
DELETE http://127.0.0.1:8000/api/users/1/
```

### Database Schema

**UserProfile Model:**
- `user` (OneToOne → User)
- `position` (CharField, max_length=100)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

### Features

✅ Create user accounts with username, password, and position
✅ List all users with their profiles
✅ Update user information
✅ Delete users
✅ Search/filter users by ID, username, or position
✅ CORS enabled for frontend communication
✅ Password hashing (secure storage)
✅ Input validation
✅ Error handling

### Testing the Implementation

1. Start the Django server:
   ```powershell
   cd server
   python manage.py runserver
   ```

2. Start the React frontend:
   ```powershell
   cd client/app
   npm run dev
   ```

3. Navigate to the Accounts page
4. Click "Add User" button
5. Fill in username, password, and position
6. Click "Create Account"
7. The new user should appear in the list

### Admin Panel

Access the Django admin at `http://127.0.0.1:8000/admin/` to view and manage users and profiles.

### Next Steps (Optional Enhancements)

- Add user authentication/authorization
- Add user roles (Admin, Manager, Staff)
- Add email field to user profile
- Add user avatar/profile picture
- Add pagination for large user lists
- Add user activity logging
- Add password reset functionality
- Add user status (active/inactive)

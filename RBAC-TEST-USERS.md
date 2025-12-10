# Role-Based Access Control (RBAC) Test Users

This document contains test credentials for verifying the role-based authentication and routing system.

## Test User Credentials

### Support Role
- **Username:** `support_user`
- **Password:** `support123`
- **Full Name:** Support Staff
- **Email:** support@oracle.com
- **Position:** Support
- **Expected Dashboard:** Blue-themed Support Dashboard

### Sales Role
- **Username:** `sales_user`
- **Password:** `sales123`
- **Full Name:** Sales Staff
- **Email:** sales@oracle.com
- **Position:** Sales
- **Expected Dashboard:** Green-themed Sales Dashboard

### Marketing Role
- **Username:** `marketing_user`
- **Password:** `marketing123`
- **Full Name:** Marketing Staff
- **Email:** marketing@oracle.com
- **Position:** Marketing
- **Expected Dashboard:** Purple-themed Marketing Dashboard

### Admin Role
- **Username:** `superadmin`
- **Password:** `admin123`
- **Position:** Admin
- **Expected Dashboard:** SuperAdmin Dashboard (full CRUD access)

## Testing Instructions

1. Start the Django backend server:
   ```bash
   cd server
   python manage.py runserver
   ```

2. Start the React frontend development server:
   ```bash
   cd client/app
   npm run dev
   ```

3. Open `http://localhost:5173` in your browser

4. Test each user by logging in with their credentials and verify:
   - User is redirected to the correct role-specific dashboard
   - Dashboard displays the correct role name and theme color
   - Logout functionality works correctly

## Role-Based Routing Logic

The application uses the `position` field from the UserProfile model to determine dashboard routing:

- **Position: "Support"** → `/support/dashboard` (Blue theme)
- **Position: "Sales"** → `/sales/dashboard` (Green theme)
- **Position: "Marketing"** → `/marketing/dashboard` (Purple theme)
- **Position: "Admin"** or any other → `/superadmin/dashboard` (Default theme)

## Implementation Details

- Backend: Login endpoint (`/login/`) returns user's position in response
- Frontend: Login component receives position and passes it to App component
- App.tsx: Renders appropriate dashboard based on user position
- Each role has a separate dashboard component in their respective folders

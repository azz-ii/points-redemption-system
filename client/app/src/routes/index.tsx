import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, PublicRoute } from "./ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Login pages
import Login from "../page/login/Login";
import PasswordReset from "../page/login/PasswordReset";

// Dashboard pages
import SalesDashboard from "../page/sales_agent/Dashboard/Dashboard";
import MarketingDashboard from "../page/marketing/Dashboard/Dashboard";
import SuperAdminDashboard from "../page/superadmin/Dashboard";

// History pages
import ApproverHistory from "../page/approver/History/History";
import MarketingHistory from "../page/marketing/History/History";
import RequestHistory from "../page/superadmin/RequestHistory/RequestHistory";

// Approver pages
import ApproverDashboard from "../page/approver/Dashboard/Dashboard";
import ApproverRequests from "../page/approver/Requests/Requests";
import ApproverTeam from "../page/approver/Team/Team";

// Marketing pages
import MarketingProcessRequests from "../page/marketing/ProcessRequests/ProcessRequests";
import ItemAssignments from "../page/marketing/ItemAssignments/ItemAssignments";

// Sales Agent pages
import RedeemItem from "../page/sales_agent/Redeem Item/Redeem-Item";
import RedemptionStatus from "../page/sales_agent/Redemption Status/Redemption-Status";

// SuperAdmin pages
import Accounts from "../page/superadmin/Accounts/Accounts";
import Catalogue from "../page/superadmin/Catalogue/Catalogue";
import Redemption from "../page/superadmin/Redemption/Redemption";
import Inventory from "../page/superadmin/Inventory/Inventory";
import Distributors from "../page/superadmin/Distributors/Distributors";
import Customers from "../page/superadmin/Customers/Customers";
import Teams from "../page/superadmin/Teams/Teams";
import Marketing from "../page/superadmin/Marketing/Marketing";

// Components
import { useAuth } from "../context/AuthContext";

// Dashboard router - redirects to role-specific dashboard
function DashboardRouter() {
  const { userPosition } = useAuth();

  switch (userPosition) {
    case "Sales Agent":
      return <Navigate to="/sales/dashboard" replace />;
    case "Approver":
      return <Navigate to="/approver/dashboard" replace />;
    case "Handler":
      return <Navigate to="/handler/dashboard" replace />;
    case "Admin":
    case "SuperAdmin":
    case "admin":
    default:
      return <Navigate to="/admin/dashboard" replace />;
  }
}

// History router - redirects to role-specific history
function HistoryRouter() {
  const { userPosition } = useAuth();

  switch (userPosition) {
    case "Approver":
      return <Navigate to="/approver/history" replace />;
    case "Handler":
      return <Navigate to="/handler/history" replace />;
    case "Admin":
    case "SuperAdmin":
    case "admin":
    default:
      return <Navigate to="/admin/dashboard" replace />;
  }
}

export function AppRoutes() {
  const { userPosition: _userPosition, isLoggedIn: _isLoggedIn } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Password reset - accessible regardless of auth status */}
      <Route path="/password-reset" element={<PasswordReset />} />

      {/* Protected routes - require authentication */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Generic dashboard/history redirects based on role */}
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/history" element={<HistoryRouter />} />

          {/* Admin/SuperAdmin routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["Admin", "SuperAdmin", "admin"]} />
            }
          >
            <Route path="/admin/dashboard" element={<SuperAdminDashboard />} />
            <Route path="/admin/accounts" element={<Accounts />} />
            <Route path="/admin/catalogue" element={<Catalogue />} />
            <Route path="/admin/redemption" element={<Redemption />} />
            <Route path="/admin/request-history" element={<RequestHistory />} />
            <Route path="/admin/inventory" element={<Inventory />} />
            <Route path="/admin/handler" element={<Marketing />} />
            <Route path="/admin/distributors" element={<Distributors />} />
            <Route path="/admin/customers" element={<Customers />} />
            <Route path="/admin/teams" element={<Teams />} />
          </Route>

          {/* Approver routes */}
          <Route element={<ProtectedRoute allowedRoles={["Approver"]} />}>
            <Route path="/approver/dashboard" element={<ApproverDashboard />} />
            <Route path="/approver/requests" element={<ApproverRequests />} />
            <Route path="/approver/history" element={<ApproverHistory />} />
            <Route path="/approver/team" element={<ApproverTeam />} />
            <Route path="/approver/redeem-items" element={<RedeemItem />} />
            <Route path="/approver/redemption-status" element={<RedemptionStatus />} />
          </Route>

          {/* Sales Agent routes */}
          <Route element={<ProtectedRoute allowedRoles={["Sales Agent"]} />}>
            <Route path="/sales/dashboard" element={<SalesDashboard />} />
            <Route path="/sales/redeem-items" element={<RedeemItem />} />
            <Route
              path="/sales/redemption-status"
              element={<RedemptionStatus />}
            />
          </Route>

          {/* Handler routes */}
          <Route element={<ProtectedRoute allowedRoles={["Handler"]} />}>
            <Route path="/handler/dashboard" element={<MarketingDashboard />} />
            <Route
              path="/handler/process-requests"
              element={<MarketingProcessRequests />}
            />
            <Route path="/handler/history" element={<MarketingHistory />} />
            <Route path="/handler/item-assignments" element={<ItemAssignments />} />
          </Route>


        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 404 - Not Found */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

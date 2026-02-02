import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, PublicRoute } from "./ProtectedRoute";

// Login pages
import Login from "../page/login/Login";

// Dashboard pages
import ApproverDashboard from "../page/approver/Dashboard";
import SalesDashboard from "../page/sales_agent/Dashboard";
import MarketingDashboard from "../page/marketing/Dashboard/Dashboard";
import ReceptionDashboard from "../page/reception/Dashboard";
import ExecutiveAssistantDashboard from "../page/executive_assistant/Dashboard";
import SuperAdminDashboard from "../page/superadmin/Dashboard";

// History pages
import ApproverHistory from "../page/approver/History/History";
import MarketingHistory from "../page/marketing/History/History";
import ReceptionHistory from "../page/reception/History";
import ExecutiveAssistantHistory from "../page/executive_assistant/History";
import RequestHistory from "../page/superadmin/RequestHistory/RequestHistory";

// Approver pages
import ApproverRequests from "../page/approver/Requests/Requests";

// Marketing pages
import MarketingProcessRequests from "../page/marketing/ProcessRequests/ProcessRequests";

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
    case "Marketing":
      return <Navigate to="/marketing/dashboard" replace />;
    case "Reception":
      return <Navigate to="/reception/dashboard" replace />;
    case "Executive Assistant":
      return <Navigate to="/executive-assistant/dashboard" replace />;
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
    case "Marketing":
      return <Navigate to="/marketing/history" replace />;
    case "Reception":
      return <Navigate to="/reception/history" replace />;
    case "Executive Assistant":
      return <Navigate to="/executive-assistant/history" replace />;
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

      {/* Protected routes - require authentication */}
      <Route element={<ProtectedRoute />}>
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
          <Route path="/admin/marketing" element={<Marketing />} />
          <Route path="/admin/distributors" element={<Distributors />} />
          <Route path="/admin/customers" element={<Customers />} />
          <Route path="/admin/teams" element={<Teams />} />
        </Route>

        {/* Approver routes */}
        <Route element={<ProtectedRoute allowedRoles={["Approver"]} />}>
          <Route path="/approver/dashboard" element={<ApproverDashboard />} />
          <Route path="/approver/requests" element={<ApproverRequests />} />
          <Route path="/approver/history" element={<ApproverHistory />} />
        </Route>

        {/* Sales Agent routes */}
        <Route element={<ProtectedRoute allowedRoles={["Sales Agent"]} />}>
          <Route path="/sales/dashboard" element={<SalesDashboard />} />
          <Route path="/sales/redeem-items" element={<RedeemItem />} />
          <Route path="/sales/redemption-status" element={<RedemptionStatus />} />
        </Route>

        {/* Marketing routes */}
        <Route element={<ProtectedRoute allowedRoles={["Marketing"]} />}>
          <Route path="/marketing/dashboard" element={<MarketingDashboard />} />
          <Route path="/marketing/process-requests" element={<MarketingProcessRequests />} />
          <Route path="/marketing/history" element={<MarketingHistory />} />
        </Route>

        {/* Reception routes */}
        <Route element={<ProtectedRoute allowedRoles={["Reception"]} />}>
          <Route path="/reception/dashboard" element={<ReceptionDashboard />} />
          <Route path="/reception/history" element={<ReceptionHistory />} />
        </Route>

        {/* Executive Assistant routes */}
        <Route
          element={<ProtectedRoute allowedRoles={["Executive Assistant"]} />}
        >
          <Route
            path="/executive-assistant/dashboard"
            element={<ExecutiveAssistantDashboard />}
          />
          <Route
            path="/executive-assistant/history"
            element={<ExecutiveAssistantHistory />}
          />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 404 - Not Found */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

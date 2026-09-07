import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth, dashboardFor } from "./context/AuthContext";
import Layout from "./components/Layout";
import { Protected, RoleOnly } from "./components/Protected";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateUser from "./pages/admin/CreateUser";
import UserList from "./pages/admin/UserList";
import AdminVendors from "./pages/admin/AdminVendors";
import SalesDashboard from "./pages/sales/SalesDashboard";
import AddVendor from "./pages/sales/AddVendor";
import AuthorshipSale from "./pages/sales/AuthorshipSale";
import Publication from "./pages/sales/Publication";
import LeadGeneration from "./pages/sales/LeadGeneration";
import VendorList from "./pages/sales/VendorList";
import SalesRecords from "./pages/sales/SalesRecords";
import LeadList from "./pages/sales/LeadList";
import FinanceDashboard from "./pages/finance/FinanceDashboard";
import Payments from "./pages/finance/Payments";
import Receipts from "./pages/common/Receipts";
import Placeholder from "./pages/common/Placeholder";

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="empty">Loading RC ERP…</div>;
  return <Navigate to={user ? dashboardFor(user.role) : "/login"} replace />;
}
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route element={<Protected />}>
        <Route element={<Layout />}>
          <Route element={<RoleOnly role="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users/create" element={<CreateUser />} />
            <Route path="/admin/users" element={<UserList />} />
            <Route
              path="/admin/roles"
              element={
                <Placeholder
                  title="Roles & Permissions"
                  description="Role access is enforced in both frontend routing and backend middleware. Admin can create Sales and Finance users."
                />
              }
            />
            <Route path="/admin/vendors" element={<AdminVendors />} />
            <Route
              path="/admin/vendors/by-employee"
              element={<AdminVendors byEmployee />}
            />
            <Route path="/admin/payments" element={<Payments admin />} />
            <Route path="/admin/receipts" element={<Receipts />} />
            <Route
              path="/admin/accounting"
              element={
                <Placeholder
                  title="Accounting Log"
                  description="Review payment and financial audit activity across RC ERP."
                />
              }
            />
            <Route
              path="/admin/reports"
              element={
                <Placeholder
                  title="Reports"
                  description="CSV exports are available from Users, Vendors, Sales and Payments modules."
                />
              }
            />
            <Route
              path="/admin/settings"
              element={
                <Placeholder
                  title="Settings"
                  description="RC ERP system settings workspace for administrators."
                />
              }
            />
            <Route
              path="/admin/activity"
              element={
                <Placeholder
                  title="Activity Log"
                  description="All important create, update, payment and login actions are recorded by the backend audit system."
                />
              }
            />
          </Route>
          <Route element={<RoleOnly role="sales" />}>
            <Route path="/sales/dashboard" element={<SalesDashboard />} />
            <Route path="/sales/vendors" element={<VendorList />} />
            <Route path="/sales/vendors/create" element={<AddVendor />} />
            <Route path="/sales/authorship-sales" element={<SalesRecords />} />
            <Route
              path="/sales/authorship-sales/create"
              element={<AuthorshipSale />}
            />
            <Route
              path="/sales/publications"
              element={<SalesRecords type="publication" />}
            />
            <Route
              path="/sales/publications/create"
              element={<Publication />}
            />
            <Route path="/sales/leads" element={<LeadList />} />
            <Route path="/sales/leads/create" element={<LeadGeneration />} />
            <Route path="/sales/follow-ups" element={<LeadList />} />
            <Route
              path="/sales/activities"
              element={
                <Placeholder
                  title="My Activities"
                  description="Your sales activity is automatically recorded by the backend audit log."
                />
              }
            />
            <Route
              path="/sales/reports"
              element={
                <Placeholder
                  title="Sales Reports"
                  description="Use the Sales export endpoint for authorship and direct publication records."
                />
              }
            />
            <Route path="/sales/vendor-reports" element={<VendorList />} />
            <Route
              path="/sales/activity-reports"
              element={<Placeholder title="Activity Reports" />}
            />
            <Route
              path="/sales/templates"
              element={<Placeholder title="Templates" />}
            />
            <Route
              path="/sales/pricing"
              element={<Placeholder title="Pricing & Services" />}
            />
            <Route
              path="/sales/communication"
              element={<Placeholder title="Communication" />}
            />
          </Route>
          <Route element={<RoleOnly role="finance" />}>
            <Route path="/finance/dashboard" element={<FinanceDashboard />} />
            <Route path="/finance/payments" element={<Payments />} />
            <Route path="/finance/transactions" element={<Payments />} />
            <Route path="/finance/receipts" element={<Receipts />} />
            <Route
              path="/finance/accounting"
              element={
                <Placeholder
                  title="Accounting Log"
                  description="Finance verification actions are tracked in the backend audit trail."
                />
              }
            />
            <Route
              path="/finance/reports"
              element={<Placeholder title="Financial Reports" />}
            />
            <Route path="/finance/payment-reports" element={<Payments />} />
            <Route
              path="/finance/outstanding"
              element={
                <Placeholder
                  title="Outstanding Payments"
                  description="Outstanding balances are calculated from authorship and publication records and shown on the Finance Dashboard."
                />
              }
            />
            <Route
              path="/finance/activity"
              element={<Placeholder title="My Activities" />}
            />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

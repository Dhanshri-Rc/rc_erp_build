import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BadgeIndianRupee,
  BarChart3,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Calculator,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  FileCheck2,
  FileText,
  HandCoins,
  Home,
  Landmark,
  LayoutDashboard,
  ListTodo,
  Menu,
  MessageCircle,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  Store,
  Target,
  UserPlus,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { initials } from "./UI";

const sections = {
  admin: [
    ["MAIN", [["Dashboard", "/admin/dashboard", LayoutDashboard]]],
    [
      "USER MANAGEMENT",
      [
        ["Create User", "/admin/users/create", UserPlus],
        ["Users List", "/admin/users", Users],
        ["Roles & Permissions", "/admin/roles", ShieldCheck],
      ],
    ],
    [
      "VENDOR MANAGEMENT",
      [
        ["All Vendors", "/admin/vendors", Store],
        ["Vendors by Employee", "/admin/vendors/by-employee", Users],
      ],
    ],
    [
      "ACCOUNTING & LOGS",
      [
        ["Accounting Log", "/admin/accounting", ClipboardList],
        ["Payment Verification", "/admin/payments", FileCheck2],
        ["Receipts", "/admin/receipts", ReceiptText],
        ["Reports", "/admin/reports", BarChart3],
      ],
    ],
    [
      "SYSTEM",
      [
        ["Settings", "/admin/settings", Settings],
        ["Activity Log", "/admin/activity", Activity],
      ],
    ],
  ],
  sales: [
    ["MAIN", [["Dashboard", "/sales/dashboard", LayoutDashboard]]],
    [
      "MARKETING / SALES",
      [
        ["Vendors", "/sales/vendors", Store],
        ["Add Vendor", "/sales/vendors/create", UserPlus],
        ["Authorship Sale", "/sales/authorship-sales/create", HandCoins],
        ["Direct Paper Publication", "/sales/publications/create", FileText],
        ["Lead Generation", "/sales/leads/create", Target],
        ["My Activities", "/sales/activities", Activity],
        ["Follow-ups", "/sales/follow-ups", ListTodo],
      ],
    ],
    [
      "REPORTS",
      [
        ["Sales Reports", "/sales/reports", BarChart3],
        ["Vendor Reports", "/sales/vendor-reports", BriefcaseBusiness],
        ["Activity Reports", "/sales/activity-reports", ClipboardList],
      ],
    ],
    [
      "TOOLS",
      [
        ["Templates", "/sales/templates", FileText],
        ["Pricing & Services", "/sales/pricing", BadgeIndianRupee],
        ["Communication", "/sales/communication", MessageCircle],
      ],
    ],
  ],
  finance: [
    ["MAIN", [["Dashboard", "/finance/dashboard", LayoutDashboard]]],
    [
      "ACCOUNTING",
      [
        ["Payment Verification", "/finance/payments", FileCheck2],
        ["Transactions", "/finance/transactions", WalletCards],
        ["Accounting Log", "/finance/accounting", ClipboardList],
        ["Receipts", "/finance/receipts", ReceiptText],
      ],
    ],
    [
      "REPORTS",
      [
        ["Financial Reports", "/finance/reports", BarChart3],
        ["Payment Reports", "/finance/payment-reports", FileText],
        ["Outstanding Payments", "/finance/outstanding", Calculator],
      ],
    ],
    ["SYSTEM", [["My Activities", "/finance/activity", Activity]]],
  ],
};
const roleLabel = {
  admin: "Super Administrator",
  sales: "Marketing User",
  finance: "Accounting User",
};
export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate(),
    loc = useLocation();
  const [open, setOpen] = useState(false),
    [notifications, setNotifications] = useState({ items: [], unread: 0 }),
    [drop, setDrop] = useState(false);
  useEffect(() => setOpen(false), [loc.pathname]);
  useEffect(() => {
    if (user)
      api
        .get("/notifications")
        .then((r) => setNotifications(r.data.data))
        .catch(() => {});
  }, [user, loc.pathname]);
  const signout = async () => {
    await logout();
    nav("/login");
  };
  const markAll = async () => {
    await api.patch("/notifications/read-all");
    setNotifications((x) => ({
      ...x,
      unread: 0,
      items: x.items.map((i) => ({ ...i, read: true })),
    }));
  };
  return (
    <div className="shell">
      <div
        className={`overlay ${open ? "show" : ""}`}
        onClick={() => setOpen(false)}
      />
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-head">
          <div className="side-logo">
            <img src="/rc-logo.png" /> RC ERP
          </div>
        </div>
        <div className="side-scroll">
          {sections[user.role].map(([group, items]) => (
            <div key={group}>
              <div className="nav-group">{group}</div>
              {items.map(([label, to, Icon]) => (
                <NavLink
                  className={({ isActive }) =>
                    `nav-item ${isActive ? "active" : ""}`
                  }
                  to={to}
                  key={to}
                >
                  <Icon />
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </div>
        <button
          className="sidebar-profile"
          onClick={signout}
          style={{
            background: "none",
            border: 0,
            width: "calc(100% - 22px)",
            textAlign: "left",
          }}
        >
          <div className="avatar">{initials(user.fullName)}</div>
          <div className="profile-text">
            <b>{user.fullName}</b>
            <span>{roleLabel[user.role]}</span>
          </div>
          <ChevronDown size={12} />
        </button>
      </aside>
      <main className="main">
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="menu-toggle icon-btn"
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
            <div className="crumbs">
              <span>Dashboard</span>
              <span>›</span>
              <span>
                {loc.pathname
                  .split("/")
                  .filter(Boolean)
                  .slice(-1)[0]
                  ?.replaceAll("-", " ")}
              </span>
            </div>
          </div>
          <div className="top-actions">
            <div style={{ position: "relative" }}>
              <button className="icon-btn" onClick={() => setDrop(!drop)}>
                <Bell />
                {notifications.unread > 0 && <span className="notify-dot" />}
              </button>
              <AnimatePresence>
                {drop && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="dropdown"
                  >
                    <div className="dropdown-head">
                      <span>Notifications ({notifications.unread})</span>
                      <button className="link-btn" onClick={markAll}>
                        Mark all read
                      </button>
                    </div>
                    {notifications.items.length ? (
                      notifications.items.slice(0, 7).map((n) => (
                        <div
                          key={n._id}
                          className={`notify-item ${n.read ? "" : "unread"}`}
                        >
                          <Bell size={13} color="#7450ef" />
                          <div>
                            <b>{n.title}</b>
                            <p>{n.message}</p>
                            <time>
                              {new Date(n.createdAt).toLocaleString()}
                            </time>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty">You're all caught up.</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button className="icon-btn">
              <CircleHelp />
            </button>
            <div className="top-profile">
              <div className="top-avatar">{initials(user.fullName)}</div>
              <div className="profile-text">
                <b>{user.fullName}</b>
                <span>{roleLabel[user.role]}</span>
              </div>
              <ChevronDown size={11} />
            </div>
          </div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

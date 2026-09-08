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
  LogOut,
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

const sidebarBase =
  "fixed z-50 top-0 bottom-0 left-0 h-screen w-[224px] max-[1200px]:w-[205px] overflow-hidden bg-white border-r border-[#eceef5] flex flex-col transition-transform duration-[250ms] max-[900px]:shadow-[12px_0_30px_rgba(29,34,60,0.12)] max-[900px]:-translate-x-full";
const sidebarOpen = "max-[900px]:translate-x-0";
const navItemBase =
  "flex items-center gap-[10px] h-9 px-[10px] rounded-[6px] text-[#5f687b] my-[2px] text-[12px] transition-all duration-200 hover:bg-[#f7f5ff] hover:text-[#613ef0] hover:translate-x-[2px] [&>svg]:w-[15px] [&>svg]:h-[15px]";
const navItemActive =
  "bg-rc-grad text-white shadow-[0_5px_12px_rgba(105,75,232,0.18)] hover:translate-x-0 hover:bg-rc-grad hover:text-white";
const iconBtn =
  "w-8 h-8 border-0 bg-white rounded-full grid place-items-center text-[#70798e] relative transition-colors duration-200 hover:bg-[#f6f3ff] hover:text-[#6d49ef] [&>svg]:w-[15px]";
  
export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate(),
    loc = useLocation();
  const [open, setOpen] = useState(false),
    [notifications, setNotifications] = useState({ items: [], unread: 0 }),
    [drop, setDrop] = useState(false),
    [profileMenu, setProfileMenu] = useState(false);
  useEffect(() => {
    setOpen(false);
    setProfileMenu(false);
  }, [loc.pathname]);
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
    <div className="min-h-screen">
      <div
        className={
          open
            ? "hidden max-[900px]:block fixed inset-0 bg-[rgba(24,29,47,0.3)] z-[45]"
            : "hidden"
        }
        onClick={() => setOpen(false)}
      />
      <aside className={`${sidebarBase} ${open ? sidebarOpen : ""}`}>
        <div className="h-[72px] flex items-center px-[19px] border-b border-[#f0f1f6]">
          <div className="flex items-center gap-[7px] font-bold text-[13px]">
            <img className="w-8 h-[30px] object-cover" src="/rc-logo.png" /> RC
            ERP
          </div>
        </div>
        <div className="flex-1 overflow-hidden py-[11px] px-[10px]">
          {sections[user.role].map(([group, items]) => (
            <div key={group}>
              <div className="text-[8px] font-semibold text-[#afb5c4] tracking-[0.08em] mt-4 mx-[9px] mb-2">
                {group}
              </div>
              {items.map(([label, to, Icon]) => (
                <NavLink
                  className={({ isActive }) =>
                    `${navItemBase} ${isActive ? navItemActive : ""}`
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
        <div className="relative mx-[11px] mb-[15px] mt-2">
          <AnimatePresence>
            {profileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute bottom-[calc(100%+6px)] left-0 right-0 overflow-hidden rounded-[7px] border border-[#e8eaf1] bg-white p-1 shadow-[0_10px_28px_rgba(34,40,74,0.14)]"
              >
                <button
                  type="button"
                  onClick={signout}
                  className="flex h-9 w-full items-center gap-[9px] rounded-[5px] border-0 bg-transparent px-[10px] text-left text-[12px] text-[#e5484d] transition-colors hover:bg-[#fff1f1] [&>svg]:h-[15px] [&>svg]:w-[15px]"
                >
                  <LogOut />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            type="button"
            className="flex w-full items-center gap-2 border-x-0 border-b-0 border-t border-[#eff0f5] bg-transparent p-[10px] text-left"
            onClick={() => setProfileMenu((value) => !value)}
            aria-expanded={profileMenu}
          >
            <div className="w-[30px] h-[30px] rounded-full inline-flex items-center justify-center bg-[#ede8ff] text-rc-purple font-bold text-[10px] flex-none">
              {initials(user.fullName)}
            </div>
            <div className="min-w-0 flex-1">
              <b className="text-[9px] block whitespace-nowrap overflow-hidden text-ellipsis">
                {user.fullName}
              </b>
              <span className="text-[7.5px] text-[#9aa1b1] block mt-[2px]">
                {roleLabel[user.role]}
              </span>
            </div>
            <ChevronDown
              size={12}
              className={`transition-transform ${profileMenu ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </aside>
      <main className="ml-[224px] min-h-screen max-[1200px]:ml-[205px] max-[900px]:ml-0">
        <header className="h-16 bg-white border-b border-[#eceef5] flex items-center justify-between px-6 sticky top-0 z-[35] max-[900px]:px-4 max-[680px]:h-[58px]">
          <div className="flex items-center gap-3">
            <button
              className={`hidden max-[900px]:grid max-[900px]:place-items-center border-0 bg-transparent text-[#6b7385] w-8 h-8 rounded-full`}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
            <div className="flex items-center gap-[7px] text-[9px] text-[#8d94a5] max-[680px]:hidden">
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
          <div className="flex items-center gap-[13px] max-[390px]:gap-1">
            <div className="relative">
              <button className={iconBtn} onClick={() => setDrop(!drop)}>
                <Bell />
                {notifications.unread > 0 && (
                  <span className="absolute right-[5px] top-[5px] w-[6px] h-[6px] bg-rc-purple rounded-full border border-white" />
                )}
              </button>
              <AnimatePresence>
                {drop && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 top-[41px] w-[320px] bg-white border border-[#e8eaf1] rounded-[9px] shadow-[0_15px_40px_rgba(34,40,74,0.12)] overflow-hidden z-[80] max-[680px]:fixed max-[680px]:left-3 max-[680px]:right-3 max-[680px]:top-[62px] max-[680px]:w-auto"
                  >
                    <div className="px-[14px] py-3 border-b border-[#eef0f4] flex justify-between items-center text-[9px] font-bold">
                      <span>Notifications ({notifications.unread})</span>
                      <button
                        className="border-0 bg-transparent text-[#6538f3] p-0"
                        onClick={markAll}
                      >
                        Mark all read
                      </button>
                    </div>
                    {notifications.items.length ? (
                      notifications.items.slice(0, 7).map((n) => (
                        <div
                          key={n._id}
                          className={`px-[13px] py-[11px] border-b border-[#f2f3f6] flex gap-2 bg-white last:border-b-0 ${n.read ? "" : "bg-[#fbf9ff]"}`}
                        >
                          <Bell size={13} color="#7450ef" />
                          <div>
                            <b className="text-[8px]">{n.title}</b>
                            <p className="text-[7.5px] text-[#838b9e] my-[3px]">
                              {n.message}
                            </p>
                            <time className="text-[6.5px] text-[#adb2bf]">
                              {new Date(n.createdAt).toLocaleString()}
                            </time>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-[30px] text-center text-[#9aa0ae] text-[9px]">
                        You're all caught up.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button className={iconBtn}>
              <CircleHelp />
            </button>
            <div className="flex items-center gap-2 pl-1">
              <div className="w-7 h-7 rounded-full bg-[#f0ebff] text-[#7250ef] grid place-items-center font-bold text-[9px] border border-[#e1d8ff]">
                {initials(user.fullName)}
              </div>
              <div className="min-w-0 flex-1 max-[680px]:hidden">
                <b className="text-[9px] block">{user.fullName}</b>
                <span className="text-[7.5px] text-[#9aa1b1] block">
                  {roleLabel[user.role]}
                </span>
              </div>
              <ChevronDown size={11} />
            </div>
          </div>
        </header>
        <div className="px-[26px] pt-[21px] pb-7 max-w-[1500px] mx-auto max-[1200px]:p-[18px] max-[900px]:p-4 max-[680px]:px-3 max-[680px]:py-[13px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

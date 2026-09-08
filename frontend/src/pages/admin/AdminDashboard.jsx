import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Activity,
  Calculator,
  CalendarDays,
  Store,
  Users,
  UserRoundCog,
  WalletCards,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../../services/api";
import {
  Badge,
  Panel,
  Spinner,
  StatCard,
  dateFmt,
  money,
} from "../../components/UI";
import * as tw from "../../styles/tw";

const pieColors = ["#6f4cf4", "#14b6bf", "#8aa2e8"];
export default function AdminDashboard() {
  const [data, setData] = useState(null),
    [range, setRange] = useState("30");
  useEffect(() => {
    api.get("/dashboard/admin").then((r) => setData(r.data.data));
  }, [range]);
  if (!data) return <Spinner />;
  const m = data.metrics;
  const chart = [
    {
      name: "Week 1",
      submitted: data.accountingOverview?.[0]?.value * 0.45 || 0,
      verified: data.accountingOverview?.[1]?.value * 0.38 || 0,
    },
    {
      name: "Week 2",
      submitted: data.accountingOverview?.[0]?.value * 0.62 || 0,
      verified: data.accountingOverview?.[1]?.value * 0.52 || 0,
    },
    {
      name: "Week 3",
      submitted: data.accountingOverview?.[0]?.value * 0.52 || 0,
      verified: data.accountingOverview?.[1]?.value * 0.49 || 0,
    },
    {
      name: "Week 4",
      submitted: data.accountingOverview?.[0]?.value || 0,
      verified: data.accountingOverview?.[1]?.value || 0,
    },
  ];
  return (
    <>
      <div className={tw.pageHead}>
        <div>
          <h1 className={tw.pageTitleH1}>Admin Dashboard</h1>
          <p className={tw.pageTitleP}>
            Overview of system activities and operations
          </p>
        </div>
        <div className={tw.headActions}>
          <button className={tw.button.date}>
            <CalendarDays size={12} /> 01 Aug 2026 - 31 Aug 2026
          </button>
        </div>
      </div>
      <div className={tw.statsGrid}>
        <StatCard
          label="Total Users"
          value={m.totalUsers}
          note={`${m.activeUsers} active users`}
          icon={Users}
        />
        <StatCard
          label="Sales/Marketing Users"
          value={m.salesUsers}
          note="Marketing team"
          icon={UserRoundCog}
          tone="cyan"
        />
        <StatCard
          label="Finance/Accounting Users"
          value={m.financeUsers}
          note="Accounting team"
          icon={WalletCards}
          tone="purple"
        />
        <StatCard
          label="Total Vendors"
          value={m.totalVendors}
          note={`${m.activeVendors} active vendors`}
          icon={Store}
          tone="cyan"
        />
        <StatCard
          label="Accounting Logs"
          value={m.accountingLogs}
          note="All time logs"
          icon={Calculator}
        />
      </div>
      <div className={tw.dashboardGrid}>
        <Panel
          title="Users by Role"
          action={
            <Link to="/admin/users" className={tw.viewLink}>
              View All
            </Link>
          }
        >
          <div className={tw.donutWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.usersByRole}
                  dataKey="value"
                  innerRadius={45}
                  outerRadius={67}
                  paddingAngle={2}
                >
                  {data.usersByRole.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel
          title="Recent User Registrations"
          action={
            <Link to="/admin/users" className={tw.viewLink}>
              View All
            </Link>
          }
        >
          <div className={tw.tableWrap}>
            <table className={tw.dataTable} style={{ minWidth: 420 }}>
              <thead>
                <tr>
                  <th className={tw.th}>Name</th>
                  <th className={tw.th}>Role</th>
                  <th className={tw.th}>Registered On</th>
                  <th className={tw.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentUsers.map((u) => (
                  <tr key={u._id} className={tw.tr}>
                    <td className={tw.td}>
                      <strong className={tw.tdStrong}>{u.fullName}</strong>
                      <div className={`${tw.text.tiny} ${tw.text.muted}`}>
                        @{u.username}
                      </div>
                    </td>
                    <td className={tw.td}>
                      <Badge>
                        {u.role === "sales"
                          ? "Marketing"
                          : u.role === "finance"
                            ? "Accounting"
                            : "Admin"}
                      </Badge>
                    </td>
                    <td className={tw.td}>{dateFmt(u.createdAt)}</td>
                    <td className={tw.td}>
                      <Badge>{u.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel
          title="Accounting Log Overview"
          action={
            <Link to="/admin/accounting" className={tw.viewLink}>
              View All
            </Link>
          }
        >
          <div className={tw.chartWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6f4cf4" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#6f4cf4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f0f1f5" vertical={false} />
                <XAxis dataKey="name" fontSize={7} tickLine={false} />
                <YAxis fontSize={7} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="submitted"
                  stroke="#6f4cf4"
                  fill="url(#g1)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="verified"
                  stroke="#14b6bf"
                  fillOpacity={0}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className={tw.panelPad} style={{ paddingTop: 0 }}>
            <div className={tw.kpiLine}>
              <span>Total Logs</span>
              <b className={tw.kpiLineB}>
                {money(data.accountingOverview?.[0]?.value)}
              </b>
            </div>
            <div className={tw.kpiLine}>
              <span>Verified Logs</span>
              <b className={tw.kpiLineB}>
                {money(data.accountingOverview?.[1]?.value)}
              </b>
            </div>
          </div>
        </Panel>
      </div>
      <div className={tw.dashboardGridTwo}>
        <Panel
          title="Vendors by Employee (Top 5)"
          action={
            <Link to="/admin/vendors/by-employee" className={tw.viewLink}>
              View all vendors by employee →
            </Link>
          }
        >
          <div className={tw.tableWrap}>
            <table className={tw.dataTable}>
              <thead>
                <tr>
                  <th className={tw.th}>Employee</th>
                  <th className={tw.th}>Total Vendors</th>
                  <th className={tw.th}>Active Vendors</th>
                  <th className={tw.th}>Inactive Vendors</th>
                  <th className={tw.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.vendorByEmployee.map((v, i) => (
                  <tr key={i} className={tw.tr}>
                    <td className={tw.td}>
                      <strong className={tw.tdStrong}>{v.employee}</strong>
                    </td>
                    <td className={tw.td}>{v.total}</td>
                    <td className={tw.td}>{v.active}</td>
                    <td className={tw.td}>{v.inactive}</td>
                    <td className={tw.td}>
                      <button className={tw.actionLink}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel
          title="Recent Accounting Logs"
          action={
            <Link to="/admin/accounting" className={tw.viewLink}>
              View All
            </Link>
          }
        >
          <div className={tw.tableWrap}>
            <table className={tw.dataTable}>
              <thead>
                <tr>
                  <th className={tw.th}>Date & Time</th>
                  <th className={tw.th}>Employee</th>
                  <th className={tw.th}>Reference</th>
                  <th className={tw.th}>Amount</th>
                  <th className={tw.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentPayments.map((p) => (
                  <tr key={p._id} className={tw.tr}>
                    <td className={tw.td}>{dateFmt(p.createdAt)}</td>
                    <td className={tw.td}>{p.submittedBy?.fullName || "—"}</td>
                    <td className={tw.td}>{p.paymentNo}</td>
                    <td className={tw.td}>{money(p.amount)}</td>
                    <td className={tw.td}>
                      <Badge>{p.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}

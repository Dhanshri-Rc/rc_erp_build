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
      <div className="page-head">
        <div className="page-title">
          <h1>Admin Dashboard</h1>
          <p>Overview of system activities and operations</p>
        </div>
        <div className="head-actions">
          <button className="date-btn">
            <CalendarDays size={12} /> 01 Aug 2026 - 31 Aug 2026
          </button>
        </div>
      </div>
      <div className="stats-grid">
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
      <div className="dashboard-grid">
        <Panel
          title="Users by Role"
          action={<span className="view-link">View All</span>}
        >
          <div className="donut-wrap">
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
          action={<span className="view-link">View All</span>}
        >
          <div className="table-wrap">
            <table className="data-table" style={{ minWidth: 420 }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Registered On</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentUsers.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <strong>{u.fullName}</strong>
                      <div className="tiny muted">@{u.username}</div>
                    </td>
                    <td>
                      <Badge>
                        {u.role === "sales"
                          ? "Marketing"
                          : u.role === "finance"
                            ? "Accounting"
                            : "Admin"}
                      </Badge>
                    </td>
                    <td>{dateFmt(u.createdAt)}</td>
                    <td>
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
          action={<span className="view-link">View All</span>}
        >
          <div className="chart-wrap">
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
          <div className="panel-pad" style={{ paddingTop: 0 }}>
            <div className="kpi-line">
              <span>Total Logs</span>
              <b>{money(data.accountingOverview?.[0]?.value)}</b>
            </div>
            <div className="kpi-line">
              <span>Verified Logs</span>
              <b>{money(data.accountingOverview?.[1]?.value)}</b>
            </div>
          </div>
        </Panel>
      </div>
      <div className="dashboard-grid two">
        <Panel
          title="Vendors by Employee (Top 5)"
          action={
            <span className="view-link">View all vendors by employee →</span>
          }
        >
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Total Vendors</th>
                  <th>Active Vendors</th>
                  <th>Inactive Vendors</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.vendorByEmployee.map((v, i) => (
                  <tr key={i}>
                    <td>
                      <strong>{v.employee}</strong>
                    </td>
                    <td>{v.total}</td>
                    <td>{v.active}</td>
                    <td>{v.inactive}</td>
                    <td>
                      <button className="action-link">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel
          title="Recent Accounting Logs"
          action={<span className="view-link">View All</span>}
        >
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Employee</th>
                  <th>Reference</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentPayments.map((p) => (
                  <tr key={p._id}>
                    <td>{dateFmt(p.createdAt)}</td>
                    <td>{p.submittedBy?.fullName || "—"}</td>
                    <td>{p.paymentNo}</td>
                    <td>{money(p.amount)}</td>
                    <td>
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

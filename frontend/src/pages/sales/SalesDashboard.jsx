import { useEffect, useState } from "react";
import {
  BadgeIndianRupee,
  BookOpenCheck,
  CalendarDays,
  FileText,
  Plus,
  Store,
  Target,
  UsersRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { useAuth } from "../../context/AuthContext";
import {
  Badge,
  Panel,
  Spinner,
  StatCard,
  dateFmt,
  money,
} from "../../components/UI";

export default function SalesDashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [d, setD] = useState(null);
  useEffect(() => {
    api.get("/dashboard/sales").then((r) => setD(r.data.data));
  }, []);
  if (!d) return <Spinner />;
  const m = d.metrics;
  const quick = [
    [
      "Add New Vendor",
      "Add a new vendor to your network",
      Plus,
      "/sales/vendors/create",
    ],
    [
      "Authorship Sale",
      "Create authorship sale for a vendor",
      UsersRound,
      "/sales/authorship-sales/create",
    ],
    [
      "Direct Paper Publication",
      "Create direct publication service",
      FileText,
      "/sales/publications/create",
    ],
    ["My Vendors", "View and manage your vendor list", Store, "/sales/vendors"],
  ];
  return (
    <>
      <div className="page-head">
        <div className="page-title">
          <h1>Welcome back, {user.fullName}! 👋</h1>
          <p>Here's what's happening with your marketing activities today.</p>
        </div>
        <div className="head-actions">
          <button className="date-btn">
            <CalendarDays size={12} /> 01 Sep 2026 - 30 Sep 2026
          </button>
        </div>
      </div>
      <div className="stats-grid">
        <StatCard
          label="Total Vendors"
          value={m.totalVendors}
          note={`${m.activeVendors} active vendors`}
          icon={Store}
        />
        <StatCard
          label="Authorship Sales"
          value={m.authorshipSales}
          note="Current period"
          icon={UsersRound}
          tone="cyan"
        />
        <StatCard
          label="Direct Publications"
          value={m.publicationCount}
          note="Current period"
          icon={BookOpenCheck}
        />
        <StatCard
          label="Total Value"
          value={money(m.totalValue)}
          note="Combined sales value"
          icon={BadgeIndianRupee}
          tone="cyan"
        />
        <StatCard
          label="Conversion Rate"
          value={`${m.conversionRate}%`}
          note="Lead conversion"
          icon={Target}
        />
      </div>
      <div className="section-label">QUICK ACTIONS</div>
      <div className="quick-grid">
        {quick.map(([a, b, I, to]) => (
          <div className="quick-card" key={a} onClick={() => nav(to)}>
            <div className="qicon">
              <I size={15} />
            </div>
            <div>
              <b>{a}</b>
              <small>{b}</small>
            </div>
            <span className="quick-arrow">→</span>
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <Panel
          title="Sales Overview"
          action={
            <span className="chart-legend">
              <span>
                <i className="legend-dot" />
                Authorship Sale
              </span>
              <span>
                <i className="legend-dot cyan" />
                Direct Publication
              </span>
            </span>
          }
        >
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={d.salesOverview}>
                <defs>
                  <linearGradient id="saleg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6f4cf4" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6f4cf4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f0f1f5" vertical={false} />
                <XAxis dataKey="name" fontSize={7} />
                <YAxis fontSize={7} axisLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="authorship"
                  stroke="#6f4cf4"
                  fill="url(#saleg)"
                />
                <Area
                  type="monotone"
                  dataKey="publication"
                  stroke="#12b3bb"
                  fillOpacity={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Service Distribution">
          <div className="donut-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={d.serviceDistribution}
                  dataKey="value"
                  innerRadius={43}
                  outerRadius={62}
                >
                  {d.serviceDistribution.map((_, i) => (
                    <Cell key={i} fill={i ? "#14b6bf" : "#6f4cf4"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel
          title="My Tasks"
          action={<span className="view-link">View All</span>}
        >
          <div className="panel-pad">
            {d.tasks.length ? (
              d.tasks.map((t) => (
                <div className="kpi-line" key={t._id}>
                  <div>
                    <b>{t.leadTitle}</b>
                    <div className="tiny muted">
                      Follow-up {dateFmt(t.nextFollowUpDate)}
                    </div>
                  </div>
                  <Badge>{t.status}</Badge>
                </div>
              ))
            ) : (
              <div className="empty">No pending follow-ups.</div>
            )}
          </div>
        </Panel>
      </div>
      <div className="dashboard-grid two">
        <Panel
          title="Recent Activities"
          action={<span className="view-link">View All</span>}
        >
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Module</th>
                  <th>Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {d.recentActivities.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <strong>{a.description}</strong>
                    </td>
                    <td>{a.module}</td>
                    <td>
                      <Badge>{a.action.replaceAll("_", " ")}</Badge>
                    </td>
                    <td>{dateFmt(a.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel
          title="Top Vendors"
          action={<span className="view-link">View All</span>}
        >
          <div className="table-wrap">
            <table className="data-table" style={{ minWidth: 480 }}>
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Total Sales</th>
                  <th>Total Value</th>
                </tr>
              </thead>
              <tbody>
                {d.topVendors.map((v, i) => (
                  <tr key={i}>
                    <td>
                      <strong>{v.vendor}</strong>
                    </td>
                    <td>{v.totalSales}</td>
                    <td>{money(v.totalValue)}</td>
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

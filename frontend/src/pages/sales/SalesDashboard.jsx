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
import * as tw from "../../styles/tw";

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
      <div className={tw.pageHead}>
        <div>
          <h1 className={tw.pageTitleH1}>Welcome back, {user.fullName}! 👋</h1>
          <p className={tw.pageTitleP}>
            Here's what's happening with your marketing activities today.
          </p>
        </div>
        <div className={tw.headActions}>
          <button className={tw.button.date}>
            <CalendarDays size={12} /> 01 Sep 2026 - 30 Sep 2026
          </button>
        </div>
      </div>
      <div className={tw.statsGrid}>
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
      <div className={tw.sectionLabel}>QUICK ACTIONS</div>
      <div className={tw.quickGrid}>
        {quick.map(([a, b, I, to], idx) => (
          <div
            className={tw.quickCard}
            key={a}
            onClick={() => nav(to)}
          >
            <div className={tw.quickIconTones[idx % tw.quickIconTones.length]}>
              <I size={15} />
            </div>
            <div>
              <b className={tw.quickCardB}>{a}</b>
              <small className={tw.quickCardSmall}>{b}</small>
            </div>
            <span className={tw.quickArrow}>→</span>
          </div>
        ))}
      </div>
      <div className={tw.dashboardGrid}>
        <Panel
          title="Sales Overview"
          action={
            <span className={tw.chartLegend}>
              <span>
                <i className={tw.legendDot} />
                Authorship Sale
              </span>
              <span>
                <i className={`${tw.legendDot} ${tw.legendDotCyan}`} />
                Direct Publication
              </span>
            </span>
          }
        >
          <div className={tw.chartWrap}>
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
          <div className={tw.donutWrap}>
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
          action={<span className={tw.viewLink}>View All</span>}
        >
          <div className={tw.panelPad}>
            {d.tasks.length ? (
              d.tasks.map((t) => (
                <div className={tw.kpiLine} key={t._id}>
                  <div>
                    <b className={tw.kpiLineB}>{t.leadTitle}</b>
                    <div className={`${tw.text.tiny} ${tw.text.muted}`}>
                      Follow-up {dateFmt(t.nextFollowUpDate)}
                    </div>
                  </div>
                  <Badge>{t.status}</Badge>
                </div>
              ))
            ) : (
              <div className={tw.empty}>No pending follow-ups.</div>
            )}
          </div>
        </Panel>
      </div>
      <div className={tw.dashboardGridTwo}>
        <Panel
          title="Recent Activities"
          action={<span className={tw.viewLink}>View All</span>}
        >
          <div className={tw.tableWrap}>
            <table className={tw.dataTable}>
              <thead>
                <tr>
                  <th className={tw.th}>Activity</th>
                  <th className={tw.th}>Module</th>
                  <th className={tw.th}>Type</th>
                  <th className={tw.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {d.recentActivities.map((a) => (
                  <tr key={a._id} className={tw.tr}>
                    <td className={tw.td}>
                      <strong className={tw.tdStrong}>{a.description}</strong>
                    </td>
                    <td className={tw.td}>{a.module}</td>
                    <td className={tw.td}>
                      <Badge>{a.action.replaceAll("_", " ")}</Badge>
                    </td>
                    <td className={tw.td}>{dateFmt(a.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel
          title="Top Vendors"
          action={<span className={tw.viewLink}>View All</span>}
        >
          <div className={tw.tableWrap}>
            <table className={tw.dataTable} style={{ minWidth: 480 }}>
              <thead>
                <tr>
                  <th className={tw.th}>Vendor</th>
                  <th className={tw.th}>Total Sales</th>
                  <th className={tw.th}>Total Value</th>
                </tr>
              </thead>
              <tbody>
                {d.topVendors.map((v, i) => (
                  <tr key={i} className={tw.tr}>
                    <td className={tw.td}>
                      <strong className={tw.tdStrong}>{v.vendor}</strong>
                    </td>
                    <td className={tw.td}>{v.totalSales}</td>
                    <td className={tw.td}>{money(v.totalValue)}</td>
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

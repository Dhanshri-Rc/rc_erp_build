import { useEffect, useState } from "react";
import {
  BadgeIndianRupee,
  BookOpenCheck,
  CalendarDays,
  FileText,
  Plus,
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
  const [d, setD] = useState(null),[range,setRange]=useState("30");
  useEffect(() => {
    const to=new Date();
    const from=new Date();
    from.setDate(to.getDate()-Number(range));
    api.get("/dashboard/sales",{params:{from:from.toISOString(),to:to.toISOString()}}).then((r) => setD(r.data.data));
  }, [range]);
  if (!d) return <Spinner />;
  const m = d.metrics;
  const quick = [
    [
      "Add New Client",
      "Create a B-B or B-C client",
      Plus,
      "/sales/clients/create",
    ],
    [
      "Authorship Sale",
      "Book available article positions",
      UsersRound,
      "/sales/authorship-sales/create",
    ],
    [
      "Direct Paper Publication",
      "Create direct publication service",
      FileText,
      "/sales/publications/create",
    ],
    ["Client List", "View and manage your clients", UsersRound, "/sales/clients"],
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
          <label className={tw.button.date}>
            <CalendarDays size={12} />
            <select className="border-0 bg-transparent outline-none" value={range} onChange={(e)=>setRange(e.target.value)}>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </label>
        </div>
      </div>
      <div className={tw.statsGrid}>
        <StatCard
          label="Total Clients"
          value={m.totalClients}
          note={`${m.activeClients} active clients`}
          icon={UsersRound}
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
          action={<button className={tw.actionLink} onClick={()=>nav("/sales/leads")}>View All</button>}
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
          action={<button className={tw.actionLink} onClick={()=>nav("/sales/activities")}>View All</button>}
        >
          <div className={tw.tableWrap}>
            <table className={tw.dataTable}>
              <thead>
                <tr>
                  <th className={tw.th}>Activity</th>
                  <th className={tw.th}>Module</th>
                
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
                
                    <td className={tw.td}>{dateFmt(a.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel
          title="Recent Clients"
          action={<button className={tw.actionLink} onClick={()=>nav("/sales/clients")}>View All</button>}
        >
          <div className={tw.tableWrap}>
            <table className={tw.dataTable} style={{ minWidth: 480 }}>
              <thead>
                <tr>
                  <th className={tw.th}>Client</th>
                  <th className={tw.th}>Business Type</th>
                  <th className={tw.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {d.recentClients.map((v) => (
                  <tr key={v._id} className={tw.tr}>
                    <td className={tw.td}>
                      <strong className={tw.tdStrong}>{v.clientName}</strong>
                    </td>
                    <td className={tw.td}>{v.businessType}</td>
                    <td className={tw.td}><Badge>{v.status}</Badge></td>
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

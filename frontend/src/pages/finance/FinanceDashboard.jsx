import { useEffect, useState } from "react";
import {
  BadgeCheck,
  BadgeIndianRupee,
  CircleX,
  Clock3,
  FileCheck2,
  ReceiptText,
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

export default function FinanceDashboard() {
  const [d, setD] = useState(null);
  useEffect(() => {
    api.get("/dashboard/finance").then((r) => setD(r.data.data));
  }, []);
  if (!d) return <Spinner />;
  const m = d.metrics;
  return (
    <>
      <div className={tw.pageHead}>
        <div>
          <h1 className={tw.pageTitleH1}>Finance Dashboard</h1>
          <p className={tw.pageTitleP}>
            Payment verification, receipts and financial performance overview.
          </p>
        </div>
      </div>
      <div className={tw.statsGrid}>
        <StatCard
          label="Total Revenue"
          value={money(m.totalRevenue)}
          icon={BadgeIndianRupee}
        />
        <StatCard
          label="Amount Received"
          value={money(m.amountReceived)}
          icon={BadgeCheck}
          tone="green"
        />
        <StatCard
          label="Outstanding Amount"
          value={money(m.outstandingAmount)}
          icon={Clock3}
          tone="orange"
        />
        <StatCard
          label="Pending Verifications"
          value={m.pendingVerifications}
          icon={FileCheck2}
          tone="cyan"
        />
        <StatCard
          label="Verified Payments"
          value={m.verifiedPayments}
          icon={ReceiptText}
        />
      </div>
      <div className={tw.dashboardGrid}>
        <Panel title="Revenue Overview">
          <div className={tw.chartWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={d.revenueOverview}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6f4cf4" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#6f4cf4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f0f1f5" vertical={false} />
                <XAxis dataKey="name" fontSize={7} />
                <YAxis fontSize={7} axisLine={false} />
                <Tooltip formatter={(v) => money(v)} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6f4cf4"
                  fill="url(#rev)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Payment Status Distribution">
          <div className={tw.donutWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={d.paymentStatus}
                  dataKey="value"
                  innerRadius={42}
                  outerRadius={61}
                >
                  {d.paymentStatus.map((_, i) => (
                    <Cell key={i} fill={["#24b47e", "#f5a524", "#ed5d67"][i]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => money(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Finance Snapshot">
          <div className={tw.panelPad}>
            <div className={tw.kpiLine}>
              <span>Verified payments</span>
              <b className={tw.kpiLineB}>{m.verifiedPayments}</b>
            </div>
            <div className={tw.kpiLine}>
              <span>Pending verifications</span>
              <b className={tw.kpiLineB}>{m.pendingVerifications}</b>
            </div>
            <div className={tw.kpiLine}>
              <span>Rejected payments</span>
              <b className={tw.kpiLineB}>{m.rejectedPayments}</b>
            </div>
            <div className={tw.kpiLine}>
              <span>Receipts generated</span>
              <b className={tw.kpiLineB}>{m.receipts}</b>
            </div>
          </div>
        </Panel>
      </div>
      <div className={tw.dashboardGridTwo}>
        <Panel title="Recent Transactions">
          <div className={tw.tableWrap}>
            <table className={tw.dataTable}>
              <thead>
                <tr>
                  <th className={tw.th}>Reference</th>
                  <th className={tw.th}>Vendor</th>
                  <th className={tw.th}>Submitted By</th>
                  <th className={tw.th}>Amount</th>
                  <th className={tw.th}>Date</th>
                  <th className={tw.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {d.recentTransactions.map((p) => (
                  <tr key={p._id} className={tw.tr}>
                    <td className={tw.td}>
                      <strong className={tw.tdStrong}>{p.paymentNo}</strong>
                    </td>
                    <td className={tw.td}>{p.vendor?.vendorName}</td>
                    <td className={tw.td}>{p.submittedBy?.fullName}</td>
                    <td className={tw.td}>{money(p.amount)}</td>
                    <td className={tw.td}>{dateFmt(p.createdAt)}</td>
                    <td className={tw.td}>
                      <Badge>{p.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Pending Verifications">
          <div className={tw.tableWrap}>
            <table className={tw.dataTable} style={{ minWidth: 500 }}>
              <thead>
                <tr>
                  <th className={tw.th}>Payment</th>
                  <th className={tw.th}>Vendor</th>
                  <th className={tw.th}>Amount</th>
                  <th className={tw.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {d.pendingPayments.map((p) => (
                  <tr key={p._id} className={tw.tr}>
                    <td className={tw.td}>
                      <strong className={tw.tdStrong}>{p.paymentNo}</strong>
                    </td>
                    <td className={tw.td}>{p.vendor?.vendorName}</td>
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

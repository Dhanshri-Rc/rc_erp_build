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

export default function FinanceDashboard() {
  const [d, setD] = useState(null);
  useEffect(() => {
    api.get("/dashboard/finance").then((r) => setD(r.data.data));
  }, []);
  if (!d) return <Spinner />;
  const m = d.metrics;
  return (
    <>
      <div className="page-head">
        <div className="page-title">
          <h1>Finance Dashboard</h1>
          <p>
            Payment verification, receipts and financial performance overview.
          </p>
        </div>
      </div>
      <div className="stats-grid">
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
      <div className="dashboard-grid">
        <Panel title="Revenue Overview">
          <div className="chart-wrap">
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
          <div className="donut-wrap">
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
          <div className="panel-pad">
            <div className="kpi-line">
              <span>Verified payments</span>
              <b>{m.verifiedPayments}</b>
            </div>
            <div className="kpi-line">
              <span>Pending verifications</span>
              <b>{m.pendingVerifications}</b>
            </div>
            <div className="kpi-line">
              <span>Rejected payments</span>
              <b>{m.rejectedPayments}</b>
            </div>
            <div className="kpi-line">
              <span>Receipts generated</span>
              <b>{m.receipts}</b>
            </div>
          </div>
        </Panel>
      </div>
      <div className="dashboard-grid two">
        <Panel title="Recent Transactions">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Vendor</th>
                  <th>Submitted By</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {d.recentTransactions.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <strong>{p.paymentNo}</strong>
                    </td>
                    <td>{p.vendor?.vendorName}</td>
                    <td>{p.submittedBy?.fullName}</td>
                    <td>{money(p.amount)}</td>
                    <td>{dateFmt(p.createdAt)}</td>
                    <td>
                      <Badge>{p.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Pending Verifications">
          <div className="table-wrap">
            <table className="data-table" style={{ minWidth: 500 }}>
              <thead>
                <tr>
                  <th>Payment</th>
                  <th>Vendor</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {d.pendingPayments.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <strong>{p.paymentNo}</strong>
                    </td>
                    <td>{p.vendor?.vendorName}</td>
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

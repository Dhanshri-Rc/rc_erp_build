import { useEffect, useState } from "react";
import {
  CalendarClock,
  CircleCheckBig,
  CircleX,
  Download,
  Plus,
  Store,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import {
  Badge,
  Button,
  Pagination,
  SearchBox,
  StatCard,
  dateFmt,
  initials,
} from "../../components/UI";

export default function AdminVendors({ byEmployee = false }) {
  const [items, setItems] = useState([]),
    [meta, setMeta] = useState(null),
    [q, setQ] = useState(""),
    [status, setStatus] = useState(""),
    [employee, setEmployee] = useState(""),
    [users, setUsers] = useState([]),
    [page, setPage] = useState(1);
  const load = () =>
    api
      .get("/vendors", {
        params: {
          page,
          limit: 10,
          search: q,
          status,
          employee: byEmployee ? employee : "",
        },
      })
      .then((r) => {
        setItems(r.data.data.items);
        setMeta(r.data.data.pagination);
      });
  useEffect(() => {
    load();
  }, [page, status, employee]);
  useEffect(() => {
    api
      .get("/users", { params: { role: "sales", limit: 100 } })
      .then((r) => setUsers(r.data.data.items));
  }, []);
  const active = items.filter((x) => x.status === "active").length,
    inactive = items.filter((x) => x.status === "inactive").length;
  return (
    <>
      <div className="page-head">
        <div className="page-title">
          <h1>{byEmployee ? "Vendors by Employee" : "All Vendors"}</h1>
          <p>
            {byEmployee
              ? "View and manage vendors assigned to individual employees"
              : "View and manage all vendors across RC ERP"}
          </p>
        </div>
        <Button
          kind="secondary"
          icon={Download}
          onClick={() =>
            window.open(
              `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/reports/vendors`,
              "_blank",
            )
          }
        >
          Export Report
        </Button>
      </div>
      {byEmployee && (
        <div className="toolbar">
          <select
            className="compact-select"
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
          >
            <option value="">All Marketing Employees</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.fullName}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="summary-strip">
        <StatCard label="Total Vendors" value={meta?.total || 0} icon={Store} />
        <StatCard
          label="Active Vendors"
          value={active}
          icon={CircleCheckBig}
          tone="green"
        />
        <StatCard
          label="Inactive Vendors"
          value={inactive}
          icon={CircleX}
          tone="red"
        />
        <StatCard
          label="Employees Shown"
          value={byEmployee ? (employee ? 1 : users.length) : users.length}
          icon={Store}
          tone="cyan"
        />
        <StatCard
          label="Last Updated"
          value={new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          })}
          icon={CalendarClock}
          tone="blue"
        />
      </div>
      <div className="toolbar">
        <SearchBox
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search vendor by name, email or contact"
        />
        <select
          className="compact-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <Button
          kind="secondary"
          onClick={() => {
            setPage(1);
            load();
          }}
        >
          Filter
        </Button>
      </div>
      <div className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Vendor Name</th>
                <th>Vendor Type</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Contact Number</th>
                <th>Status</th>
                <th>Added On</th>
                <th>Added By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((v, i) => (
                <tr key={v._id}>
                  <td>{(meta?.page - 1) * meta?.limit + i + 1}</td>
                  <td>
                    <strong>{v.vendorName}</strong>
                  </td>
                  <td>{v.businessType}</td>
                  <td>{v.contactPerson || "—"}</td>
                  <td>{v.email}</td>
                  <td>{v.mobile}</td>
                  <td>
                    <Badge>{v.status}</Badge>
                  </td>
                  <td>{dateFmt(v.createdAt)}</td>
                  <td>{v.assignedTo?.fullName || "—"}</td>
                  <td>
                    <button className="action-link">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={meta} onPage={setPage} />
      </div>
    </>
  );
}

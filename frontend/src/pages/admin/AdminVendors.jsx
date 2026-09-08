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
import * as tw from "../../styles/tw";

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
      <div className={tw.pageHead}>
        <div>
          <h1 className={tw.pageTitleH1}>
            {byEmployee ? "Vendors by Employee" : "All Vendors"}
          </h1>
          <p className={tw.pageTitleP}>
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
        <div className={tw.toolbar}>
          <select
            className={tw.compactSelect}
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
      <div className={tw.summaryStrip}>
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
      <div className={tw.toolbar}>
        <SearchBox
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search vendor by name, email or contact"
        />
        <select
          className={tw.compactSelect}
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
      <div className={tw.panel}>
        <div className={tw.tableWrap}>
          <table className={tw.dataTable}>
            <thead>
              <tr>
                <th className={tw.th}>#</th>
                <th className={tw.th}>Vendor Name</th>
                <th className={tw.th}>Vendor Type</th>
                <th className={tw.th}>Contact Person</th>
                <th className={tw.th}>Email</th>
                <th className={tw.th}>Contact Number</th>
                <th className={tw.th}>Status</th>
                <th className={tw.th}>Added On</th>
                <th className={tw.th}>Added By</th>
                <th className={tw.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((v, i) => (
                <tr key={v._id} className={tw.tr}>
                  <td className={tw.td}>{(meta?.page - 1) * meta?.limit + i + 1}</td>
                  <td className={tw.td}>
                    <strong className={tw.tdStrong}>{v.vendorName}</strong>
                  </td>
                  <td className={tw.td}>{v.businessType}</td>
                  <td className={tw.td}>{v.contactPerson || "—"}</td>
                  <td className={tw.td}>{v.email}</td>
                  <td className={tw.td}>{v.mobile}</td>
                  <td className={tw.td}>
                    <Badge>{v.status}</Badge>
                  </td>
                  <td className={tw.td}>{dateFmt(v.createdAt)}</td>
                  <td className={tw.td}>{v.assignedTo?.fullName || "—"}</td>
                  <td className={tw.td}>
                    <button className={tw.actionLink}>View</button>
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

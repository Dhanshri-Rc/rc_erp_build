import { useEffect, useState } from "react";
import { Download, Plus, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import {
  Badge,
  Button,
  Pagination,
  SearchBox,
  dateFmt,
} from "../../components/UI";
export default function VendorList() {
  const [items, setItems] = useState([]),
    [meta, setMeta] = useState(null),
    [q, setQ] = useState(""),
    [status, setStatus] = useState(""),
    [page, setPage] = useState(1);
  const load = () =>
    api
      .get("/vendors", { params: { page, limit: 10, search: q, status } })
      .then((r) => {
        setItems(r.data.data.items);
        setMeta(r.data.data.pagination);
      });
  useEffect(() => {
    load();
  }, [page, status]);
  return (
    <>
      <div className="page-head">
        <div className="page-title">
          <h1>My Vendors</h1>
          <p>View and manage vendors assigned to your marketing account.</p>
        </div>
        <Link to="/sales/vendors/create">
          <Button icon={Plus}>Add Vendor</Button>
        </Link>
      </div>
      <div className="toolbar">
        <SearchBox
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search vendor name, email or contact"
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
          Export
        </Button>
      </div>
      <div className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Vendor Name</th>
                <th>Business Type</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Status</th>
                <th>Added On</th>
                <th>Action</th>
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

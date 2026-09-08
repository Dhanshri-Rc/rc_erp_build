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
import * as tw from "../../styles/tw";

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
      <div className={tw.pageHead}>
        <div>
          <h1 className={tw.pageTitleH1}>My Vendors</h1>
          <p className={tw.pageTitleP}>
            View and manage vendors assigned to your marketing account.
          </p>
        </div>
        <Link to="/sales/vendors/create">
          <Button icon={Plus}>Add Vendor</Button>
        </Link>
      </div>
      <div className={tw.toolbar}>
        <SearchBox
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search vendor name, email or contact"
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
      <div className={tw.panel}>
        <div className={tw.tableWrap}>
          <table className={tw.dataTable}>
            <thead>
              <tr>
                <th className={tw.th}>#</th>
                <th className={tw.th}>Vendor Name</th>
                <th className={tw.th}>Business Type</th>
                <th className={tw.th}>Contact Person</th>
                <th className={tw.th}>Email</th>
                <th className={tw.th}>Mobile</th>
                <th className={tw.th}>Status</th>
                <th className={tw.th}>Added On</th>
                <th className={tw.th}>Action</th>
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

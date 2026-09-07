import { useEffect, useState } from "react";
import { CheckCircle2, Download, Eye, XCircle } from "lucide-react";
import { api } from "../../services/api";
import {
  Badge,
  Button,
  Modal,
  Pagination,
  Toast,
  dateFmt,
  money,
} from "../../components/UI";

export default function Payments({ admin = false }) {
  const [items, setItems] = useState([]),
    [meta, setMeta] = useState(null),
    [status, setStatus] = useState("pending"),
    [page, setPage] = useState(1),
    [selected, setSelected] = useState(null),
    [notes, setNotes] = useState(""),
    [toast, setToast] = useState(null);
  const load = () =>
    api.get("/payments", { params: { status, page, limit: 10 } }).then((r) => {
      setItems(r.data.data.items);
      setMeta(r.data.data.pagination);
    });
  useEffect(() => {
    load();
  }, [status, page]);
  const act = async (kind) => {
    try {
      await api.patch(`/payments/${selected._id}/${kind}`, { notes });
      setToast({
        type: "success",
        message: `Payment ${kind === "verify" ? "verified" : "rejected"} successfully`,
      });
      setSelected(null);
      setNotes("");
      load();
    } catch (e) {
      setToast({ type: "error", message: e.message });
    }
  };
  return (
    <>
      <div className="page-head">
        <div className="page-title">
          <h1>Payment Verification</h1>
          <p>
            Review submitted sales payments, verify proof and generate receipt
            records.
          </p>
        </div>
        <Button
          kind="secondary"
          icon={Download}
          onClick={() =>
            window.open(
              `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/reports/payments`,
              "_blank",
            )
          }
        >
          Export
        </Button>
      </div>
      <div className="toolbar">
        <select
          className="compact-select"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Payments</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Payment Ref</th>
                <th>Service</th>
                <th>Vendor</th>
                <th>Submitted By</th>
                <th>Amount</th>
                <th>Transaction ID</th>
                <th>Transaction Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p._id}>
                  <td>
                    <strong>{p.paymentNo}</strong>
                  </td>
                  <td>{p.sourceType}</td>
                  <td>{p.vendor?.vendorName}</td>
                  <td>{p.submittedBy?.fullName}</td>
                  <td>{money(p.amount)}</td>
                  <td>{p.transactionId || "—"}</td>
                  <td>{dateFmt(p.transactionDate || p.createdAt)}</td>
                  <td>
                    <Badge>{p.status}</Badge>
                  </td>
                  <td>
                    {p.status === "pending" ? (
                      <div className="inline-actions">
                        <button
                          className="action-link"
                          onClick={() => setSelected(p)}
                        >
                          <Eye size={10} /> Review
                        </button>
                      </div>
                    ) : (
                      <span className="muted tiny">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={meta} onPage={setPage} />
      </div>
      {selected && (
        <Modal
          title={`Verify ${selected.paymentNo}`}
          onClose={() => setSelected(null)}
        >
          <div className="summary-list">
            <div className="summary-line">
              <span>Vendor</span>
              <strong>{selected.vendor?.vendorName}</strong>
            </div>
            <div className="summary-line">
              <span>Amount</span>
              <strong className="summary-total">
                {money(selected.amount)}
              </strong>
            </div>
            <div className="summary-line">
              <span>Transaction</span>
              <strong>{selected.transactionId || "—"}</strong>
            </div>
            <div className="summary-line">
              <span>Mode</span>
              <strong>{selected.paymentMode || "—"}</strong>
            </div>
          </div>
          {selected.proof && (
            <p className="small">
              <a
                className="view-link"
                target="_blank"
                rel="noreferrer"
                href={`${(import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "")}/${selected.proof.replaceAll("\\", "/")}`}
              >
                Open payment proof
              </a>
            </p>
          )}
          <textarea
            className="textarea"
            placeholder="Verification notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="form-actions">
            <Button kind="danger" icon={XCircle} onClick={() => act("reject")}>
              Reject
            </Button>
            <Button icon={CheckCircle2} onClick={() => act("verify")}>
              Verify Payment
            </Button>
          </div>
        </Modal>
      )}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}

import { useEffect, useState } from "react";
import { CheckCircle2, Download, Eye, XCircle } from "lucide-react";
import { api, protectedFileUrl } from "../../services/api";
import {
  Badge,
  Button,
  Modal,
  Pagination,
  Toast,
  dateFmt,
  money,
} from "../../components/UI";
import * as tw from "../../styles/tw";

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
      <div className={tw.pageHead}>
        <div>
          <h1 className={tw.pageTitleH1}>Payment Verification</h1>
          <p className={tw.pageTitleP}>
            Review submitted sales payments, verify proof and generate receipt
            records.
          </p>
        </div>
        <Button
          kind="secondary"
          icon={Download}
          onClick={() =>
            window.open(
              `${api.defaults.baseURL}/reports/payments`,
              "_blank",
            )
          }
        >
          Export
        </Button>
      </div>
      <div className={tw.toolbar}>
        <select
          className={tw.compactSelect}
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
      <div className={tw.panel}>
        <div className={tw.tableWrap}>
          <table className={tw.dataTable}>
            <thead>
              <tr>
                <th className={tw.th}>Payment Ref</th>
                <th className={tw.th}>Service</th>
                <th className={tw.th}>Vendor</th>
                <th className={tw.th}>Submitted By</th>
                <th className={tw.th}>Amount</th>
                <th className={tw.th}>Transaction ID</th>
                <th className={tw.th}>Transaction Date</th>
                <th className={tw.th}>Status</th>
                <th className={tw.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p._id} className={tw.tr}>
                  <td className={tw.td}>
                    <strong className={tw.tdStrong}>{p.paymentNo}</strong>
                  </td>
                  <td className={tw.td}>{p.sourceType}</td>
                  <td className={tw.td}>{p.vendor?.vendorName}</td>
                  <td className={tw.td}>{p.submittedBy?.fullName}</td>
                  <td className={tw.td}>{money(p.amount)}</td>
                  <td className={tw.td}>{p.transactionId || "—"}</td>
                  <td className={tw.td}>{dateFmt(p.transactionDate || p.createdAt)}</td>
                  <td className={tw.td}>
                    <Badge>{p.status}</Badge>
                  </td>
                  <td className={tw.td}>
                    {p.status === "pending" ? (
                      <div className={tw.inlineActions}>
                        <button
                          className={tw.actionLink}
                          onClick={() => setSelected(p)}
                        >
                          <Eye size={10} /> Review
                        </button>
                      </div>
                    ) : (
                      <span className={`${tw.text.muted} ${tw.text.tiny}`}>
                        Processed
                      </span>
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
          <div className={tw.summaryList}>
            <div className={tw.summaryLine}>
              <span className={tw.summaryLineSpan}>Vendor</span>
              <strong className={tw.summaryLineStrong}>
                {selected.vendor?.vendorName}
              </strong>
            </div>
            <div className={tw.summaryLine}>
              <span className={tw.summaryLineSpan}>Amount</span>
              <strong className={tw.summaryTotal}>{money(selected.amount)}</strong>
            </div>
            <div className={tw.summaryLine}>
              <span className={tw.summaryLineSpan}>Transaction</span>
              <strong className={tw.summaryLineStrong}>
                {selected.transactionId || "—"}
              </strong>
            </div>
            <div className={tw.summaryLine}>
              <span className={tw.summaryLineSpan}>Mode</span>
              <strong className={tw.summaryLineStrong}>
                {selected.paymentMode || "—"}
              </strong>
            </div>
          </div>
          {selected.proof && (
            <p className={`${tw.text.small} mt-2`}>
              <a
                className={tw.viewLink}
                target="_blank"
                rel="noreferrer"
                href={protectedFileUrl(selected.proof)}
              >
                Open payment proof
              </a>
            </p>
          )}
          <textarea
            className={`${tw.textarea} mt-2`}
            placeholder="Verification notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className={tw.formActions}>
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

import { useEffect, useState } from "react";
import { Info, Save, Upload } from "lucide-react";
import { api } from "../../services/api";
import {
  Button,
  Field,
  Input,
  Select,
  Textarea,
  Toast,
  money,
} from "../../components/UI";

export default function Publication() {
  const [catalog, setCatalog] = useState({
      journals: [],
      issues: [],
      vendors: [],
    }),
    [file, setFile] = useState(null),
    [toast, setToast] = useState(null),
    [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    journal: "",
    issueType: "Regular Issue",
    journalIssue: "",
    paperTitle: "",
    vendor: "",
    authorCategory: "Indian",
    currency: "INR",
    exchangeRate: 1,
    totalAmount: "",
    advanceAmount: "",
    paymentAccount: "HDFC Current Account",
    paymentMode: "Bank Transfer",
    transactionId: "",
    transactionDate: new Date().toISOString().slice(0, 10),
    expectedPublicationDate: "",
    doi: "",
    manuscriptStatus: "Received",
    numberOfAuthors: 1,
    correspondingAuthor: "",
    remarks: "",
  });
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const remaining = Math.max(
    Number(f.totalAmount || 0) - Number(f.advanceAmount || 0),
    0,
  );
  useEffect(() => {
    Promise.all([
      api.get("/catalog/journals"),
      api.get("/vendors", { params: { limit: 100 } }),
    ]).then(([j, v]) =>
      setCatalog((x) => ({
        ...x,
        journals: j.data.data,
        vendors: v.data.data.items,
      })),
    );
  }, []);
  useEffect(() => {
    if (f.journal)
      api
        .get("/catalog/issues", { params: { journal: f.journal } })
        .then((r) => setCatalog((x) => ({ ...x, issues: r.data.data })));
  }, [f.journal]);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(f).forEach(([k, v]) => v !== "" && fd.append(k, v));
      if (file) fd.append("paymentProof", file);
      await api.post("/sales/publications", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setToast({
        type: "success",
        message:
          "Publication service saved successfully and finance workflow created.",
      });
      setF((x) => ({
        ...x,
        paperTitle: "",
        vendor: "",
        totalAmount: "",
        advanceAmount: "",
        transactionId: "",
        doi: "",
        correspondingAuthor: "",
        remarks: "",
      }));
      setFile(null);
    } catch (err) {
      setToast({ type: "error", message: err.message });
    } finally {
      setBusy(false);
    }
  };
  const vendor = catalog.vendors.find((v) => v._id === f.vendor);
  return (
    <>
      <div className="page-head">
        <div className="page-title">
          <h1>New Paper Publication Service</h1>
          <p>
            Create a direct paper publication service and capture complete
            payment details.
          </p>
        </div>
      </div>
      <div className="form-layout">
        <form onSubmit={submit}>
          <div className="form-card">
            <h3>1. Publication Details</h3>
            <div className="form-grid">
              <Field label="Journal Name" required>
                <Select
                  value={f.journal}
                  onChange={(e) => set("journal", e.target.value)}
                >
                  <option value="">Select journal</option>
                  {catalog.journals.map((j) => (
                    <option key={j._id} value={j._id}>
                      {j.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Issue Type" required>
                <Select
                  value={f.issueType}
                  onChange={(e) => set("issueType", e.target.value)}
                >
                  <option>Regular Issue</option>
                  <option>Special Issue</option>
                  <option>Fast Track</option>
                </Select>
              </Field>
              <Field label="Issue / Volume">
                <Select
                  value={f.journalIssue}
                  onChange={(e) => set("journalIssue", e.target.value)}
                >
                  <option value="">Select issue</option>
                  {catalog.issues.map((i) => (
                    <option key={i._id} value={i._id}>
                      Vol. {i.volume} · Issue {i.issue} · {i.month} {i.year}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Manuscript / Paper Title" required>
                <Input
                  value={f.paperTitle}
                  onChange={(e) => set("paperTitle", e.target.value)}
                />
              </Field>
            </div>
          </div>
          <div className="form-card">
            <h3>2. Vendor Details</h3>
            <div className="form-grid">
              <Field label="Select Vendor" required>
                <Select
                  value={f.vendor}
                  onChange={(e) => set("vendor", e.target.value)}
                >
                  <option value="">Select vendor</option>
                  {catalog.vendors.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.vendorName}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Contact Person">
                <Input readOnly value={vendor?.contactPerson || ""} />
              </Field>
              <Field label="Mobile Number">
                <Input readOnly value={vendor?.mobile || ""} />
              </Field>
              <Field label="Email Address">
                <Input readOnly value={vendor?.email || ""} />
              </Field>
            </div>
          </div>
          <div className="form-card">
            <h3>3. Publication & Pricing</h3>
            <div className="form-grid three">
              <Field label="Author Category / Region" required>
                <Select
                  value={f.authorCategory}
                  onChange={(e) => set("authorCategory", e.target.value)}
                >
                  <option>Indian</option>
                  <option>International</option>
                  <option>SAARC</option>
                </Select>
              </Field>
              <Field label="Currency">
                <Select
                  value={f.currency}
                  onChange={(e) => set("currency", e.target.value)}
                >
                  <option>INR</option>
                  <option>USD</option>
                  <option>EUR</option>
                </Select>
              </Field>
              <Field label="Exchange Rate">
                <Input
                  type="number"
                  step="0.01"
                  value={f.exchangeRate}
                  onChange={(e) => set("exchangeRate", e.target.value)}
                />
              </Field>
              <Field label="Total Amount" required>
                <Input
                  type="number"
                  min="0"
                  value={f.totalAmount}
                  onChange={(e) => set("totalAmount", e.target.value)}
                />
              </Field>
              <Field label="Advance Amount" required>
                <Input
                  type="number"
                  min="0"
                  value={f.advanceAmount}
                  onChange={(e) => set("advanceAmount", e.target.value)}
                />
              </Field>
              <Field label="Remaining Amount">
                <Input readOnly value={remaining} />
              </Field>
            </div>
          </div>
          <div className="form-card">
            <h3>4. Payment Information</h3>
            <div className="form-grid three">
              <Field label="Payment Account" required>
                <Select
                  value={f.paymentAccount}
                  onChange={(e) => set("paymentAccount", e.target.value)}
                >
                  <option>HDFC Current Account</option>
                  <option>ICICI Current Account</option>
                  <option>SBI Current Account</option>
                </Select>
              </Field>
              <Field label="Payment Mode" required>
                <Select
                  value={f.paymentMode}
                  onChange={(e) => set("paymentMode", e.target.value)}
                >
                  <option>Bank Transfer</option>
                  <option>UPI</option>
                  <option>Cheque</option>
                  <option>Cash</option>
                </Select>
              </Field>
              <Field label="UTR / Transaction ID" required>
                <Input
                  value={f.transactionId}
                  onChange={(e) => set("transactionId", e.target.value)}
                />
              </Field>
              <Field label="Transaction Date" required>
                <Input
                  type="date"
                  value={f.transactionDate}
                  onChange={(e) => set("transactionDate", e.target.value)}
                />
              </Field>
              <Field label="Payment Screenshot / Proof" className="full">
                <label className="file-drop">
                  <div>
                    <Upload size={17} />
                    <div>
                      {file ? file.name : "Upload JPG, PNG or PDF · max 5MB"}
                    </div>
                    <input
                      hidden
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </label>
              </Field>
            </div>
          </div>
          <div className="form-card">
            <h3>5. Additional Information</h3>
            <div className="form-grid three">
              <Field label="Expected Publication Date">
                <Input
                  type="date"
                  value={f.expectedPublicationDate}
                  onChange={(e) =>
                    set("expectedPublicationDate", e.target.value)
                  }
                />
              </Field>
              <Field label="DOI (if known)">
                <Input
                  value={f.doi}
                  onChange={(e) => set("doi", e.target.value)}
                />
              </Field>
              <Field label="Manuscript Status">
                <Select
                  value={f.manuscriptStatus}
                  onChange={(e) => set("manuscriptStatus", e.target.value)}
                >
                  <option>Received</option>
                  <option>Under Review</option>
                  <option>Accepted</option>
                  <option>Published</option>
                </Select>
              </Field>
              <Field label="No. of Authors">
                <Input
                  type="number"
                  min="1"
                  value={f.numberOfAuthors}
                  onChange={(e) => set("numberOfAuthors", e.target.value)}
                />
              </Field>
              <Field label="Corresponding Author">
                <Input
                  value={f.correspondingAuthor}
                  onChange={(e) => set("correspondingAuthor", e.target.value)}
                />
              </Field>
            </div>
          </div>
          <div className="form-card">
            <h3>6. Remarks & Notes</h3>
            <Field label="Remarks">
              <Textarea
                value={f.remarks}
                onChange={(e) => set("remarks", e.target.value)}
              />
            </Field>
            <div className="form-actions">
              <Button kind="secondary">Cancel</Button>
              <Button type="submit" icon={Save} disabled={busy}>
                {busy ? "Saving…" : "Save Publication Service"}
              </Button>
            </div>
          </div>
        </form>
        <aside className="side-info">
          <div className="info-card purple">
            <h4>Publication Summary</h4>
            <div className="summary-list">
              <div className="summary-line">
                <span>Journal</span>
                <strong>
                  {catalog.journals.find((j) => j._id === f.journal)
                    ?.shortName || "—"}
                </strong>
              </div>
              <div className="summary-line">
                <span>Vendor</span>
                <strong>{vendor?.vendorName || "—"}</strong>
              </div>
              <div className="summary-line">
                <span>Authors</span>
                <strong>{f.numberOfAuthors}</strong>
              </div>
              <div className="summary-line">
                <span>Total</span>
                <strong>{money(f.totalAmount)}</strong>
              </div>
              <div className="summary-line">
                <span>Advance</span>
                <strong>{money(f.advanceAmount)}</strong>
              </div>
              <div className="summary-line">
                <span>Remaining</span>
                <strong className="summary-total">{money(remaining)}</strong>
              </div>
            </div>
          </div>
          <div className="info-card blue">
            <div className="info-row">
              <div className="info-icon">
                <Info />
              </div>
              <div>
                <b>Payment Verification</b>
                <p>
                  Advance payments automatically appear in the Finance
                  payment-verification queue.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}

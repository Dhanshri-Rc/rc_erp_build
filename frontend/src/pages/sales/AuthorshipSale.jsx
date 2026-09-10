import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  FileCheck2,
  Info,
  Save,
  Upload,
  UserRoundPlus,
  WalletCards,
} from "lucide-react";
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
import * as tw from "../../styles/tw";

export default function AuthorshipSale() {
  const [catalog, setCatalog] = useState({
      journals: [],
      articles: [],
      vendors: [],
    }),
    [file, setFile] = useState(null),
    [toast, setToast] = useState(null),
    [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    journal: "",
    article: "",
    vendor: "",
    totalPrice: "",
    pricePerAuthor: "",
    numberOfAuthors: 1,
    advancePayment: "",
    authors: "",
    paymentAccount: "HDFC Current Account",
    paymentMode: "Bank Transfer",
    transactionId: "",
    transactionDate: new Date().toISOString().slice(0, 10),
    remarks: "",
  });
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const remaining = Math.max(
    Number(f.totalPrice || 0) - Number(f.advancePayment || 0),
    0,
  );
  const selectedArticle = catalog.articles.find((a) => a._id === f.article);
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
    if (!f.journal) {
      setCatalog((x) => ({ ...x, articles: [] }));
      return;
    }
    api
      .get("/catalog/articles", { params: { journal: f.journal } })
      .then((r) => setCatalog((x) => ({ ...x, articles: r.data.data })));
  }, [f.journal]);
  useEffect(() => {
    if (selectedArticle)
      setF((x) => ({
        ...x,
        pricePerAuthor: selectedArticle.pricePerAuthor || "",
        totalPrice:
          (selectedArticle.pricePerAuthor || 0) *
          Number(x.numberOfAuthors || 1),
      }));
  }, [f.article]);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries({ ...f, remainingAmount: remaining }).forEach(([k, v]) =>
        fd.append(k, v),
      );
      if (file) fd.append("paymentProof", file);
      await api.post("/sales/authorship", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setToast({
        type: "success",
        message:
          "Authorship sale created. Finance can now verify the submitted payment.",
      });
      setF((x) => ({
        ...x,
        article: "",
        vendor: "",
        totalPrice: "",
        pricePerAuthor: "",
        numberOfAuthors: 1,
        advancePayment: "",
        authors: "",
        transactionId: "",
        remarks: "",
      }));
      setFile(null);
    } catch (err) {
      setToast({ type: "error", message: err.message });
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <div className={tw.pageHead}>
        <div>
          <h1 className={tw.pageTitleH1}>New Authorship Sale</h1>
          <p className={tw.pageTitleP}>
            Create and record a new authorship sale with vendor, article, author
            and payment information.
          </p>
        </div>
      </div>
      <div className={tw.formLayout}>
        <form onSubmit={submit}>
          <div className={tw.formCard}>
            <h3 className={tw.formCardH3}>1. Select Journal</h3>
            <div className={tw.formGrid}>
              <Field label="Journal Name" required className="full">
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
            </div>
          </div>
          <div className={tw.formCard}>
            <h3 className={tw.formCardH3}>2. Select Article</h3>
            <div className={tw.formGrid}>
              <Field label="Article" required>
                <Select
                  value={f.article}
                  onChange={(e) => set("article", e.target.value)}
                >
                  <option value="">Select available article</option>
                  {catalog.articles.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.title}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Available POS">
                <Input readOnly value={selectedArticle?.availablePOS ?? "—"} />
              </Field>
            </div>
          </div>
          <div className={tw.formCard}>
            <h3 className={tw.formCardH3}>3. Vendor Details</h3>
            <div className={tw.formGrid}>
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
                <Input
                  readOnly
                  value={
                    catalog.vendors.find((v) => v._id === f.vendor)
                      ?.contactPerson || ""
                  }
                />
              </Field>
              <Field label="Email" className="full">
                <Input
                  readOnly
                  value={
                    catalog.vendors.find((v) => v._id === f.vendor)?.email || ""
                  }
                />
              </Field>
            </div>
          </div>
          <div className={tw.formCard}>
            <h3 className={tw.formCardH3}>4. Pricing Details</h3>
            <div className={tw.formGridThree}>
              <Field label="Total Price (₹)" required>
                <Input
                  type="number"
                  min="0"
                  value={f.totalPrice}
                  readOnly
                />
              </Field>
              <Field label="Price Per Author (₹)" required>
                <Input
                  type="number"
                  min="0"
                  value={f.pricePerAuthor}
                  readOnly
                />
              </Field>
              <Field label="No. of Authors / POS" required>
                <Input
                  type="number"
                  min="1"
                  max={selectedArticle?.availablePOS || 20}
                  value={f.numberOfAuthors}
                  onChange={(e) => {
                    const n = e.target.value;
                    setF((x) => ({
                      ...x,
                      numberOfAuthors: n,
                      totalPrice: Number(x.pricePerAuthor || 0) * Number(n || 0),
                    }));
                  }}
                />
              </Field>
              <Field label="Advance Payment (₹)" required>
                <Input
                  type="number"
                  min="0"
                  max={f.totalPrice || 0}
                  value={f.advancePayment}
                  onChange={(e) => set("advancePayment", e.target.value)}
                />
              </Field>
              <Field label="Remaining Amount (₹)">
                <Input readOnly value={remaining} />
              </Field>
            </div>
          </div>
          <div className={tw.formCard}>
            <h3 className={tw.formCardH3}>5. Author Details</h3>
            <Field label="Author Names & Affiliations" required>
              <Textarea
                value={f.authors}
                onChange={(e) => set("authors", e.target.value)}
                placeholder="1. Author Name — Department, Institution&#10;2. Author Name — Department, Institution"
              />
            </Field>
          </div>
          <div className={tw.formCard}>
            <h3 className={tw.formCardH3}>6. Payment Information</h3>
            <div className={tw.formGridThree}>
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
                <label className={tw.fileDrop}>
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
          <div className={tw.formCard}>
            <h3 className={tw.formCardH3}>7. Remarks</h3>
            <Field label="Remarks / Notes">
              <Textarea
                value={f.remarks}
                onChange={(e) => set("remarks", e.target.value)}
                placeholder="Add notes for this transaction"
              />
            </Field>
            <div className={tw.formActions}>
              <Button kind="secondary">Cancel</Button>
              <Button type="submit" icon={Save} disabled={busy}>
                {busy ? "Saving…" : "Save Authorship Sale"}
              </Button>
            </div>
          </div>
        </form>
        <aside className={tw.sideInfo}>
          <div className={tw.infoCard.purple}>
            <h4 className={tw.infoCardH4}>Sale Summary</h4>
            <div className={tw.summaryList}>
              <div className={tw.summaryLine}>
                <span className={tw.summaryLineSpan}>Journal</span>
                <strong className={tw.summaryLineStrong}>
                  {catalog.journals.find((j) => j._id === f.journal)
                    ?.shortName || "—"}
                </strong>
              </div>
              <div className={tw.summaryLine}>
                <span className={tw.summaryLineSpan}>Available POS</span>
                <strong className={tw.summaryLineStrong}>
                  {selectedArticle?.availablePOS ?? "—"}
                </strong>
              </div>
              <div className={tw.summaryLine}>
                <span className={tw.summaryLineSpan}>Authors / POS</span>
                <strong className={tw.summaryLineStrong}>
                  {f.numberOfAuthors || 0}
                </strong>
              </div>
              <div className={tw.summaryLine}>
                <span className={tw.summaryLineSpan}>Total Price</span>
                <strong className={tw.summaryLineStrong}>{money(f.totalPrice)}</strong>
              </div>
              <div className={tw.summaryLine}>
                <span className={tw.summaryLineSpan}>Advance</span>
                <strong className={tw.summaryLineStrong}>{money(f.advancePayment)}</strong>
              </div>
              <div className={tw.summaryLine}>
                <span className={tw.summaryLineSpan}>Remaining</span>
                <strong className={tw.summaryTotal}>{money(remaining)}</strong>
              </div>
            </div>
          </div>
          <div className={tw.infoCard.blue}>
            <div className={tw.infoRow}>
              <div className={tw.infoIcon}>
                <Info />
              </div>
              <div>
                <b className={tw.infoRowB}>Finance Workflow</b>
                <p className={tw.infoRowP}>
                  Any submitted advance creates a payment-verification record
                  for the Finance team. Article POS are reserved when the sale
                  is saved.
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

import { useState } from "react";
import {
  BadgeIndianRupee,
  Building2,
  FileText,
  Info,
  Save,
  ShieldCheck,
} from "lucide-react";
import { api } from "../../services/api";
import {
  Button,
  Field,
  Input,
  Select,
  Textarea,
  Toast,
} from "../../components/UI";
import * as tw from "../../styles/tw";

const initial = {
  vendorName: "",
  businessType: "Supplier",
  vendorCategory: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  postalCode: "",
  mobile: "",
  email: "",
  gstNumber: "",
  contactPerson: "",
  designation: "",
  alternateMobile: "",
  panNumber: "",
  website: "",
  vendorSince: new Date().toISOString().slice(0, 10),
  paymentTerms: "30 Days",
  creditLimit: "",
  preferredPaymentMode: "Bank Transfer",
  notes: "",
  status: "active",
};
export default function AddVendor() {
  const [form, setForm] = useState(initial),
    [toast, setToast] = useState(null),
    [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((x) => ({ ...x, [k]: v }));
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/vendors", {
        ...form,
        creditLimit: Number(form.creditLimit || 0),
      });
      setToast({ type: "success", message: "Vendor added successfully" });
      setForm(initial);
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
          <h1 className={tw.pageTitleH1}>Add New Vendor</h1>
          <p className={tw.pageTitleP}>
            Add vendor details to your account. All fields marked with * are
            required.
          </p>
        </div>
      </div>
      <div className={tw.formLayout}>
        <form onSubmit={submit}>
          <div className={tw.formCard}>
            <h3 className={tw.formCardH3}>Vendor Information</h3>
            <div className={tw.subtext}>
              Basic business, address and contact information.
            </div>
            <div className={tw.formGridThree}>
              <Field label="Vendor Name" required>
                <Input
                  value={form.vendorName}
                  onChange={(e) => set("vendorName", e.target.value)}
                  placeholder="Enter vendor name"
                />
              </Field>
              <Field label="Business Type" required>
                <Select
                  value={form.businessType}
                  onChange={(e) => set("businessType", e.target.value)}
                >
                  <option>Supplier</option>
                  <option>Service Provider</option>
                  <option>Publisher</option>
                  <option>Others</option>
                </Select>
              </Field>
              <Field label="Vendor Category">
                <Select
                  value={form.vendorCategory}
                  onChange={(e) => set("vendorCategory", e.target.value)}
                >
                  <option value="">Select category</option>
                  <option>Academic</option>
                  <option>Research</option>
                  <option>Publication</option>
                  <option>Consulting</option>
                </Select>
              </Field>
              <Field label="Address" required className="full">
                <Textarea
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="Enter full business address"
                />
              </Field>
              <Field label="City" required>
                <Input
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                />
              </Field>
              <Field label="State / Province" required>
                <Input
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                />
              </Field>
              <Field label="Country" required>
                <Input
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                />
              </Field>
              <Field label="PIN / Postal Code" required>
                <Input
                  value={form.postalCode}
                  onChange={(e) => set("postalCode", e.target.value)}
                />
              </Field>
              <Field label="Mobile Number" required>
                <Input
                  value={form.mobile}
                  onChange={(e) => set("mobile", e.target.value)}
                />
              </Field>
              <Field label="Email Address" required>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </Field>
              <Field label="GST Number (Optional)">
                <Input
                  value={form.gstNumber}
                  onChange={(e) => set("gstNumber", e.target.value)}
                />
              </Field>
            </div>
          </div>
          <div className={tw.formCard}>
            <h3 className={tw.formCardH3}>Additional Information</h3>
            <div className={tw.subtext}>
              Optional commercial and relationship details.
            </div>
            <div className={tw.formGridThree}>
              <Field label="Contact Person">
                <Input
                  value={form.contactPerson}
                  onChange={(e) => set("contactPerson", e.target.value)}
                />
              </Field>
              <Field label="Designation">
                <Input
                  value={form.designation}
                  onChange={(e) => set("designation", e.target.value)}
                />
              </Field>
              <Field label="Alternate Mobile (Optional)">
                <Input
                  value={form.alternateMobile}
                  onChange={(e) => set("alternateMobile", e.target.value)}
                />
              </Field>
              <Field label="PAN Number (Optional)">
                <Input
                  value={form.panNumber}
                  onChange={(e) => set("panNumber", e.target.value)}
                />
              </Field>
              <Field label="Website (Optional)">
                <Input
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                  placeholder="https://"
                />
              </Field>
              <Field label="Vendor Since" required>
                <Input
                  type="date"
                  value={form.vendorSince}
                  onChange={(e) => set("vendorSince", e.target.value)}
                />
              </Field>
              <Field label="Payment Terms">
                <Select
                  value={form.paymentTerms}
                  onChange={(e) => set("paymentTerms", e.target.value)}
                >
                  <option>Advance</option>
                  <option>15 Days</option>
                  <option>30 Days</option>
                  <option>45 Days</option>
                </Select>
              </Field>
              <Field label="Credit Limit (₹)">
                <Input
                  type="number"
                  min="0"
                  value={form.creditLimit}
                  onChange={(e) => set("creditLimit", e.target.value)}
                />
              </Field>
              <Field label="Preferred Payment Mode">
                <Select
                  value={form.preferredPaymentMode}
                  onChange={(e) => set("preferredPaymentMode", e.target.value)}
                >
                  <option>Bank Transfer</option>
                  <option>UPI</option>
                  <option>Cheque</option>
                  <option>Cash</option>
                </Select>
              </Field>
              <Field label="Notes (Optional)" className="full">
                <Textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Enter any additional notes about this vendor"
                />
              </Field>
            </div>
            <div className={tw.formActions}>
              <Button kind="secondary">Cancel</Button>
              <Button type="submit" icon={Save} disabled={busy}>
                {busy ? "Saving…" : "Save Vendor"}
              </Button>
            </div>
          </div>
        </form>
        <aside className={tw.sideInfo}>
          <div className={tw.infoCard.purple}>
            <h4 className={tw.infoCardH4}>Business Type</h4>
            <div className={tw.infoRow}>
              <div className={tw.infoIcon}>
                <Building2 />
              </div>
              <div>
                <b className={tw.infoRowB}>Supplier</b>
                <p className={tw.infoRowP}>Vendor supplies products or materials.</p>
              </div>
            </div>
            <div className={tw.infoRow}>
              <div className={tw.infoIcon}>
                <FileText />
              </div>
              <div>
                <b className={tw.infoRowB}>Service Provider</b>
                <p className={tw.infoRowP}>
                  Professional or publication-related services.
                </p>
              </div>
            </div>
            <div className={tw.infoRow}>
              <div className={tw.infoIcon}>
                <ShieldCheck />
              </div>
              <div>
                <b className={tw.infoRowB}>Publisher</b>
                <p className={tw.infoRowP}>
                  Journal, book or academic publishing partner.
                </p>
              </div>
            </div>
            <div className={tw.infoRow}>
              <div className={tw.infoIcon}>
                <BadgeIndianRupee />
              </div>
              <div>
                <b className={tw.infoRowB}>Others</b>
                <p className={tw.infoRowP}>Other approved business relationships.</p>
              </div>
            </div>
          </div>
          <div className={tw.infoCard.blue}>
            <div className={tw.infoRow}>
              <div className={tw.infoIcon}>
                <Info />
              </div>
              <div>
                <b className={tw.infoRowB}>Information</b>
                <p className={tw.infoRowP}>
                  Vendors you create are automatically assigned to your Sales
                  account and visible to Admin.
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

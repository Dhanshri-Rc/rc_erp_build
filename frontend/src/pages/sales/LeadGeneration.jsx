import { useEffect, useState } from "react";
import { Info, Save, Target, Upload } from "lucide-react";
import { api } from "../../services/api";
import {
  Badge,
  Button,
  Field,
  Input,
  Select,
  Textarea,
  Toast,
  dateFmt,
  money,
} from "../../components/UI";

const initial = {
  leadTitle: "",
  leadType: "New Requirement",
  priority: "medium",
  leadFor: "Journal Publication",
  expectedDealType: "Standard",
  targetBudget: "",
  description: "",
  contactName: "",
  email: "",
  mobile: "",
  organization: "",
  designation: "",
  country: "India",
  preferredContactMethod: "Phone",
  bestTimeToContact: "",
  alternateContact: "",
  subjectArea: "",
  journalType: "Scopus",
  indexingPreference: "Scopus",
  expectedTimeline: "",
  volumeFrequency: "",
  expectedArticles: "",
  leadSource: "Website",
  referredBy: "",
  remarks: "",
  nextFollowUpDate: "",
  followUpStatus: "Pending",
  status: "new",
};
export default function LeadGeneration() {
  const [f, setF] = useState(initial),
    [file, setFile] = useState(null),
    [recent, setRecent] = useState([]),
    [toast, setToast] = useState(null),
    [busy, setBusy] = useState(false);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const load = () =>
    api
      .get("/leads", { params: { limit: 6 } })
      .then((r) => setRecent(r.data.data.items));
  useEffect(() => {
    load();
  }, []);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(f).forEach(([k, v]) => v !== "" && fd.append(k, v));
      if (file) fd.append("attachment", file);
      await api.post("/leads", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setToast({ type: "success", message: "Lead captured successfully" });
      setF(initial);
      setFile(null);
      load();
    } catch (err) {
      setToast({ type: "error", message: err.message });
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <div className="page-head">
        <div className="page-title">
          <h1>Lead Generation</h1>
          <p>
            Capture and manage potential leads for new journals or low-cost
            deals not currently available.
          </p>
        </div>
      </div>
      <div className="form-layout">
        <form onSubmit={submit}>
          <div className="form-card">
            <h3>1. Lead Information</h3>
            <div className="form-grid three">
              <Field label="Lead Title / Requirement" required className="full">
                <Input
                  value={f.leadTitle}
                  onChange={(e) => set("leadTitle", e.target.value)}
                  placeholder="Enter lead title or requirement"
                />
              </Field>
              <Field label="Lead Type" required>
                <Select
                  value={f.leadType}
                  onChange={(e) => set("leadType", e.target.value)}
                >
                  <option>New Requirement</option>
                  <option>Authorship</option>
                  <option>Publication</option>
                  <option>Journal Inquiry</option>
                </Select>
              </Field>
              <Field label="Priority">
                <Select
                  value={f.priority}
                  onChange={(e) => set("priority", e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </Select>
              </Field>
              <Field label="Lead For" required>
                <Select
                  value={f.leadFor}
                  onChange={(e) => set("leadFor", e.target.value)}
                >
                  <option>Journal Publication</option>
                  <option>Authorship</option>
                  <option>Conference</option>
                  <option>Editorial Service</option>
                </Select>
              </Field>
              <Field label="Expected Deal Type">
                <Select
                  value={f.expectedDealType}
                  onChange={(e) => set("expectedDealType", e.target.value)}
                >
                  <option>Standard</option>
                  <option>Low Cost</option>
                  <option>Bulk</option>
                  <option>Premium</option>
                </Select>
              </Field>
              <Field label="Target Cost / Budget (₹)">
                <Input
                  type="number"
                  min="0"
                  value={f.targetBudget}
                  onChange={(e) => set("targetBudget", e.target.value)}
                />
              </Field>
              <Field
                label="Description / Requirement Details"
                required
                className="full"
              >
                <Textarea
                  value={f.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Describe the complete requirement"
                />
              </Field>
            </div>
          </div>
          <div className="form-card">
            <h3>2. Contact & Organization Details</h3>
            <div className="form-grid three">
              <Field label="Contact Name" required>
                <Input
                  value={f.contactName}
                  onChange={(e) => set("contactName", e.target.value)}
                />
              </Field>
              <Field label="Email" required>
                <Input
                  type="email"
                  value={f.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </Field>
              <Field label="Mobile Number" required>
                <Input
                  value={f.mobile}
                  onChange={(e) => set("mobile", e.target.value)}
                />
              </Field>
              <Field label="Organization / Institution">
                <Input
                  value={f.organization}
                  onChange={(e) => set("organization", e.target.value)}
                />
              </Field>
              <Field label="Designation">
                <Input
                  value={f.designation}
                  onChange={(e) => set("designation", e.target.value)}
                />
              </Field>
              <Field label="Country" required>
                <Input
                  value={f.country}
                  onChange={(e) => set("country", e.target.value)}
                />
              </Field>
              <Field label="Preferred Contact Method">
                <Select
                  value={f.preferredContactMethod}
                  onChange={(e) =>
                    set("preferredContactMethod", e.target.value)
                  }
                >
                  <option>Phone</option>
                  <option>Email</option>
                  <option>WhatsApp</option>
                  <option>Video Call</option>
                </Select>
              </Field>
              <Field label="Best Time to Contact">
                <Input
                  value={f.bestTimeToContact}
                  onChange={(e) => set("bestTimeToContact", e.target.value)}
                  placeholder="e.g. 3:00 PM - 5:00 PM"
                />
              </Field>
              <Field label="Alternate Contact (Optional)">
                <Input
                  value={f.alternateContact}
                  onChange={(e) => set("alternateContact", e.target.value)}
                />
              </Field>
            </div>
          </div>
          <div className="form-card">
            <h3>3. Lead Preferences</h3>
            <div className="form-grid three">
              <Field label="Subject Area / Category">
                <Input
                  value={f.subjectArea}
                  onChange={(e) => set("subjectArea", e.target.value)}
                />
              </Field>
              <Field label="Journal Type">
                <Select
                  value={f.journalType}
                  onChange={(e) => set("journalType", e.target.value)}
                >
                  <option>Scopus</option>
                  <option>Web of Science</option>
                  <option>Peer Reviewed</option>
                  <option>UGC</option>
                </Select>
              </Field>
              <Field label="Indexing Preference">
                <Input
                  value={f.indexingPreference}
                  onChange={(e) => set("indexingPreference", e.target.value)}
                />
              </Field>
              <Field label="Expected Timeline">
                <Input
                  value={f.expectedTimeline}
                  onChange={(e) => set("expectedTimeline", e.target.value)}
                  placeholder="e.g. 30 days"
                />
              </Field>
              <Field label="Volume / Frequency">
                <Input
                  value={f.volumeFrequency}
                  onChange={(e) => set("volumeFrequency", e.target.value)}
                />
              </Field>
              <Field label="No. of Articles (Expected)">
                <Input
                  type="number"
                  min="0"
                  value={f.expectedArticles}
                  onChange={(e) => set("expectedArticles", e.target.value)}
                />
              </Field>
            </div>
          </div>
          <div className="form-card">
            <h3>4. Source & Additional Information</h3>
            <div className="form-grid">
              <Field label="Lead Source" required>
                <Select
                  value={f.leadSource}
                  onChange={(e) => set("leadSource", e.target.value)}
                >
                  <option>Website</option>
                  <option>Referral</option>
                  <option>Email Campaign</option>
                  <option>LinkedIn</option>
                  <option>WhatsApp</option>
                  <option>Existing Vendor</option>
                </Select>
              </Field>
              <Field label="Referred By">
                <Input
                  value={f.referredBy}
                  onChange={(e) => set("referredBy", e.target.value)}
                />
              </Field>
              <Field label="Attachment">
                <label className="file-drop">
                  <div>
                    <Upload size={16} />
                    <div>{file ? file.name : "Upload supporting file"}</div>
                    <input
                      hidden
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </label>
              </Field>
              <Field label="Remarks / Notes">
                <Textarea
                  value={f.remarks}
                  onChange={(e) => set("remarks", e.target.value)}
                />
              </Field>
            </div>
          </div>
          <div className="form-card">
            <h3>5. Follow-up & Assignment</h3>
            <div className="form-grid three">
              <Field label="Assigned To" required>
                <Input readOnly value="Me (Current Marketing User)" />
              </Field>
              <Field label="Next Follow-up Date" required>
                <Input
                  type="date"
                  value={f.nextFollowUpDate}
                  onChange={(e) => set("nextFollowUpDate", e.target.value)}
                />
              </Field>
              <Field label="Follow-up Status">
                <Select
                  value={f.followUpStatus}
                  onChange={(e) => set("followUpStatus", e.target.value)}
                >
                  <option>Pending</option>
                  <option>Scheduled</option>
                  <option>Completed</option>
                </Select>
              </Field>
            </div>
            <div className="form-actions">
              <Button kind="secondary">Reset</Button>
              <Button type="submit" icon={Save} disabled={busy}>
                {busy ? "Saving…" : "Save Lead"}
              </Button>
            </div>
          </div>
        </form>
        <aside className="side-info">
          <div className="info-card purple">
            <h4>Lead Summary</h4>
            <div className="summary-list">
              <div className="summary-line">
                <span>Lead For</span>
                <strong>{f.leadFor || "—"}</strong>
              </div>
              <div className="summary-line">
                <span>Priority</span>
                <strong>{f.priority}</strong>
              </div>
              <div className="summary-line">
                <span>Budget</span>
                <strong>{money(f.targetBudget)}</strong>
              </div>
              <div className="summary-line">
                <span>Contact</span>
                <strong>{f.contactName || "—"}</strong>
              </div>
              <div className="summary-line">
                <span>Follow-up</span>
                <strong>{f.nextFollowUpDate || "—"}</strong>
              </div>
            </div>
          </div>
          <div className="info-card blue">
            <div className="info-row">
              <div className="info-icon">
                <Info />
              </div>
              <div>
                <b>Quick Tips</b>
                <p>
                  Capture a clear requirement, correct contact details and a
                  realistic follow-up date for stronger conversion tracking.
                </p>
              </div>
            </div>
          </div>
          <div className="info-card">
            <h4>Lead Status Workflow</h4>
            <div className="workflow">
              {[
                "New",
                "Contacted",
                "In Discussion",
                "Proposal Sent",
                "Negotiation",
                "Converted / Closed",
              ].map((s, i) => (
                <div key={s}>
                  <div className="workflow-step">
                    <span className="workflow-dot">{i + 1}</span>
                    {s}
                  </div>
                  {i < 5 && <div className="workflow-line" />}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
      <div className="panel" style={{ marginTop: 14 }}>
        <div className="panel-head">
          <h3>Recent Leads</h3>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Lead Title</th>
                <th>Lead For</th>
                <th>Contact Name</th>
                <th>Target Budget</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Next Follow-up</th>
                <th>Assigned To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((l, i) => (
                <tr key={l._id}>
                  <td>{i + 1}</td>
                  <td>
                    <strong>{l.leadTitle}</strong>
                  </td>
                  <td>{l.leadFor}</td>
                  <td>{l.contactName}</td>
                  <td>{money(l.targetBudget)}</td>
                  <td>
                    <Badge>{l.status}</Badge>
                  </td>
                  <td>
                    <Badge
                      tone={
                        l.priority === "high"
                          ? "red"
                          : l.priority === "medium"
                            ? "orange"
                            : "blue"
                      }
                    >
                      {l.priority}
                    </Badge>
                  </td>
                  <td>{dateFmt(l.nextFollowUpDate)}</td>
                  <td>{l.assignedTo?.fullName || "Me"}</td>
                  <td>
                    <button className="action-link">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}

import { useState } from "react";
import {
  BriefcaseBusiness,
  Calculator,
  Info,
  Save,
  ShieldCheck,
} from "lucide-react";
import { api } from "../../services/api";
import { Button, Field, Input, Select, Toast } from "../../components/UI";

export default function CreateUser() {
  const [form, setForm] = useState({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      contactNumber: "",
      role: "sales",
      status: "active",
    }),
    [toast, setToast] = useState(null),
    [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((x) => ({ ...x, [k]: v }));
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/users", form);
      setToast({ type: "success", message: "User created successfully" });
      setForm({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        contactNumber: "",
        role: "sales",
        status: "active",
      });
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Unable to create user",
      });
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <div className="page-head">
        <div className="page-title">
          <h1>Create New User</h1>
          <p>
            Add a new user to the system. Fill in the details below and assign
            appropriate role.
          </p>
        </div>
      </div>
      <div className="form-layout">
        <form onSubmit={submit}>
          <div className="form-card">
            <h3>User Information</h3>
            <div className="subtext">
              Enter the basic account and contact details.
            </div>
            <div className="form-grid">
              <Field label="Username" required>
                <Input
                  value={form.username}
                  onChange={(e) => set("username", e.target.value)}
                  placeholder="Enter username"
                />
              </Field>
              <Field label="Email Address" required>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="Enter email address"
                />
              </Field>
              <Field
                label="Password"
                required
                help="Minimum 8 characters with letter and number"
              >
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Enter password"
                />
              </Field>
              <Field label="Confirm Password" required>
                <Input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => set("confirmPassword", e.target.value)}
                  placeholder="Confirm password"
                />
              </Field>
              <Field label="Full Name" required>
                <Input
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  placeholder="Enter full name"
                />
              </Field>
              <Field label="Contact Number" required>
                <Input
                  value={form.contactNumber}
                  onChange={(e) => set("contactNumber", e.target.value)}
                  placeholder="Enter contact number"
                />
              </Field>
              <Field label="User Type" required>
                <Select
                  value={form.role}
                  onChange={(e) => set("role", e.target.value)}
                >
                  <option value="sales">Marketing User</option>
                  <option value="finance">Accounting User</option>
                </Select>
              </Field>
              <Field label="Status" required>
                <Select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </Field>
            </div>
            <div className="form-actions">
              <Button kind="secondary" type="button">
                Cancel
              </Button>
              <Button type="submit" icon={Save} disabled={busy}>
                {busy ? "Creating…" : "Create User"}
              </Button>
            </div>
          </div>
        </form>
        <aside className="side-info">
          <div className="info-card purple">
            <h4>User Type Information</h4>
            <div className="info-row">
              <div className="info-icon">
                <BriefcaseBusiness />
              </div>
              <div>
                <b>Marketing User</b>
                <p>
                  Marketing users can manage vendors, author sales, direct
                  publications and leads. They do not have access to user
                  management or finance verification.
                </p>
              </div>
            </div>
            <div className="info-row">
              <div
                className="info-icon"
                style={{ background: "#e9fbfb", color: "#12a7ae" }}
              >
                <Calculator />
              </div>
              <div>
                <b>Accounting User</b>
                <p>
                  Accounting users verify payments, manage receipts, review
                  transactions and financial reports.
                </p>
              </div>
            </div>
          </div>
          <div className="info-card">
            <div className="info-row">
              <div className="info-icon">
                <ShieldCheck />
              </div>
              <div>
                <b>Admin Controlled</b>
                <p>
                  Only administrators can create Sales/Marketing and
                  Finance/Accounting users.
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

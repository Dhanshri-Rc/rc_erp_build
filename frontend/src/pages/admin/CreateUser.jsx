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
import * as tw from "../../styles/tw";

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
      <div className={tw.pageHead}>
        <div>
          <h1 className={tw.pageTitleH1}>Create New User</h1>
          <p className={tw.pageTitleP}>
            Add a new user to the system. Fill in the details below and assign
            appropriate role.
          </p>
        </div>
      </div>
      <div className={tw.formLayout}>
        <form onSubmit={submit}>
          <div className={tw.formCard}>
            <h3 className={tw.formCardH3}>User Information</h3>
            <div className={tw.subtext}>
              Enter the basic account and contact details.
            </div>
            <div className={tw.formGrid}>
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
            <div className={tw.formActions}>
              <Button kind="secondary" type="button">
                Cancel
              </Button>
              <Button type="submit" icon={Save} disabled={busy}>
                {busy ? "Creating…" : "Create User"}
              </Button>
            </div>
          </div>
        </form>
        <aside className={tw.sideInfo}>
          <div className={tw.infoCard.purple}>
            <h4 className={tw.infoCardH4}>User Type Information</h4>
            <div className={tw.infoRow}>
              <div className={tw.infoIcon}>
                <BriefcaseBusiness />
              </div>
              <div>
                <b className={tw.infoRowB}>Marketing User</b>
                <p className={tw.infoRowP}>
                  Marketing users can manage vendors, author sales, direct
                  publications and leads. They do not have access to user
                  management or finance verification.
                </p>
              </div>
            </div>
            <div className={tw.infoRow}>
              <div className="w-7 h-7 rounded-[7px] bg-[#e9fbfb] text-[#12a7ae] grid place-items-center flex-none [&>svg]:w-[13px]">
                <Calculator />
              </div>
              <div>
                <b className={tw.infoRowB}>Accounting User</b>
                <p className={tw.infoRowP}>
                  Accounting users verify payments, manage receipts, review
                  transactions and financial reports.
                </p>
              </div>
            </div>
          </div>
          <div className={tw.infoCard[""]}>
            <div className={tw.infoRow}>
              <div className={tw.infoIcon}>
                <ShieldCheck />
              </div>
              <div>
                <b className={tw.infoRowB}>Admin Controlled</b>
                <p className={tw.infoRowP}>
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

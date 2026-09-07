import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";

export const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
export const initials = (name = "User") =>
  name
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
export const dateFmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

export function Button({
  children,
  kind = "primary",
  icon: Icon,
  type = "button",
  className = "",
  ...props
}) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      className={`${kind === "primary" ? "primary-btn" : kind === "danger" ? "danger-btn" : "secondary-btn"} ${className}`}
      {...props}
    >
      {Icon && <Icon className="button-icon" />}
      {children}
    </motion.button>
  );
}
export function StatCard({ label, value, note, icon: Icon, tone = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="stat-card"
    >
      <div className={`stat-icon ${tone}`}>{Icon && <Icon />}</div>
      <div className="stat-body">
        <span>{label}</span>
        <strong>{value}</strong>
        {note && <small>{note}</small>}
      </div>
    </motion.div>
  );
}
export function Panel({ title, action, children, className = "" }) {
  return (
    <div className={`panel ${className}`}>
      <div className="panel-head">
        <h3>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
export function Badge({ children, tone }) {
  let t =
    tone ||
    (/active|verified|paid|converted/i.test(String(children))
      ? "green"
      : /inactive|rejected|closed/i.test(String(children))
        ? "red"
        : /pending|partial|negotiation/i.test(String(children))
          ? "orange"
          : /sales|marketing/i.test(String(children))
            ? "purple"
            : /finance|accounting/i.test(String(children))
              ? "cyan"
              : "blue");
  return (
    <span className={`badge ${t}`}>
      <span className="status-dot" />
      {children}
    </span>
  );
}
export function Field({
  label,
  required,
  children,
  help,
  error,
  className = "",
}) {
  return (
    <div className={`field ${className}`}>
      <label>
        {label}
        {required && <span className="req"> *</span>}
      </label>
      {children}
      {error ? (
        <small className="error">{error}</small>
      ) : (
        help && <small>{help}</small>
      )}
    </div>
  );
}
export const Input = (props) => <input className="input" {...props} />;
export const Select = ({ children, ...props }) => (
  <select className="select" {...props}>
    {children}
  </select>
);
export const Textarea = (props) => <textarea className="textarea" {...props} />;
export function SearchBox({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="search-box">
      <Search />
      <input value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  );
}
export function Empty({ text = "No records found." }) {
  return <div className="empty">{text}</div>;
}
export function Spinner() {
  return <div className="empty">Loading RC ERP data…</div>;
}
export function Pagination({ meta, onPage }) {
  if (!meta) return null;
  return (
    <div className="pagination">
      <span>
        Showing page {meta.page} of {meta.totalPages} · {meta.total} records
      </span>
      <div className="page-numbers">
        <button
          className="page-number"
          disabled={!meta.hasPrevPage}
          onClick={() => onPage(meta.page - 1)}
        >
          <ChevronLeft size={12} />
        </button>
        {[...Array(Math.min(meta.totalPages, 5))].map((_, i) => {
          const p = i + 1;
          return (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={`page-number ${meta.page === p ? "active" : ""}`}
            >
              {p}
            </button>
          );
        })}
        <button
          className="page-number"
          disabled={!meta.hasNextPage}
          onClick={() => onPage(meta.page + 1)}
        >
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}
export function ExportButton({ url = "" }) {
  return (
    <Button
      kind="secondary"
      icon={Download}
      onClick={() => {
        if (url) window.open(url, "_blank");
      }}
    >
      Export
    </Button>
  );
}
export function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`toast ${toast.type || ""}`}
      onClick={onClose}
    >
      {toast.message}
    </motion.div>
  );
}
export function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3>{title}</h3>
        {children}
      </motion.div>
    </div>
  );
}

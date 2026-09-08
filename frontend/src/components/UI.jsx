import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import * as tw from "../styles/tw";

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
  const kindClass =
    kind === "primary"
      ? tw.button.primary
      : kind === "danger"
        ? tw.button.danger
        : tw.button.secondary;
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      className={`${kindClass} ${className}`}
      {...props}
    >
      {Icon && <Icon className={tw.button.icon} />}
      {children}
    </motion.button>
  );
}
export function StatCard({ label, value, note, icon: Icon, tone = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={tw.statCard}
    >
      <div className={tw.statIcon[tone] || tw.statIcon[""]}>
        {Icon && <Icon />}
      </div>
      <div className="min-w-0 flex-1">
        <span className={tw.statBody.span}>{label}</span>
        <strong className={tw.statBody.strong}>{value}</strong>
        {note && <small className={tw.statBody.small}>{note}</small>}
      </div>
    </motion.div>
  );
}
export function Panel({ title, action, children, className = "" }) {
  return (
    <div className={`${tw.panel} ${className}`}>
      <div className={tw.panelHead}>
        <h3 className={tw.panelHeadH3}>{title}</h3>
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
    <span className={tw.badge[t]}>
      <span className={tw.statusDot} />
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
  const wrapClass = className === "full" ? tw.fieldFull : className;
  return (
    <div className={wrapClass}>
      <label className={tw.fieldLabel}>
        {label}
        {required && <span className={tw.req}> *</span>}
      </label>
      {children}
      {error ? (
        <small className={`${tw.fieldSmall} ${tw.errorText}`}>{error}</small>
      ) : (
        help && <small className={tw.fieldSmall}>{help}</small>
      )}
    </div>
  );
}
export const Input = ({ className = "", ...props }) => (
  <input className={`${tw.input} ${className}`} {...props} />
);
export const Select = ({ children, className = "", ...props }) => (
  <select className={`${tw.select} ${className}`} {...props}>
    {children}
  </select>
);
export const Textarea = ({ className = "", ...props }) => (
  <textarea className={`${tw.textarea} ${className}`} {...props} />
);
export function SearchBox({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className={tw.searchBox}>
      <Search />
      <input
        className={tw.searchBoxInput}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}
export function Empty({ text = "No records found." }) {
  return <div className={tw.empty}>{text}</div>;
}
export function Spinner() {
  return <div className={tw.empty}>Loading RC ERP data…</div>;
}
export function Pagination({ meta, onPage }) {
  if (!meta) return null;
  return (
    <div className={tw.pagination}>
      <span>
        Showing page {meta.page} of {meta.totalPages} · {meta.total} records
      </span>
      <div className={tw.pageNumbers}>
        <button
          className={tw.pageNumber}
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
              className={`${tw.pageNumber} ${meta.page === p ? tw.pageNumberActive : ""}`}
            >
              {p}
            </button>
          );
        })}
        <button
          className={tw.pageNumber}
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
  const tone =
    toast.type === "success"
      ? tw.toast.success
      : toast.type === "error"
        ? tw.toast.error
        : tw.toast.default;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${tw.toast.base} ${tone}`}
      onClick={onClose}
    >
      {toast.message}
    </motion.div>
  );
}
export function Modal({ title, children, onClose }) {
  return (
    <div className={tw.modalBackdrop} onMouseDown={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className={tw.modal}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 className={tw.modalH3}>{title}</h3>
        {children}
      </motion.div>
    </div>
  );
}

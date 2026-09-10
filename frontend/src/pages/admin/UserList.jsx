import { useEffect, useState } from "react";
import {
  CircleUserRound,
  Download,
  Plus,
  Power,
  RefreshCcw,
  Search,
  UserCog,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import {
  Badge,
  Button,
  Modal,
  Pagination,
  SearchBox,
  StatCard,
  Toast,
  dateFmt,
  initials,
} from "../../components/UI";
import * as tw from "../../styles/tw";

export default function UserList() {
  const [items, setItems] = useState([]),
    [meta, setMeta] = useState(null),
    [q, setQ] = useState(""),
    [role, setRole] = useState(""),
    [status, setStatus] = useState(""),
    [page, setPage] = useState(1),
    [stats, setStats] = useState({}),
    [reset, setReset] = useState(null),
    [password, setPassword] = useState(""),
    [toast, setToast] = useState(null);
  const load = () =>
    api
      .get("/users", { params: { page, limit: 10, search: q, role, status } })
      .then((r) => {
        setItems(r.data.data.items);
        setMeta(r.data.data.pagination);
      });
  useEffect(() => {
    load();
  }, [page, role, status]);
  useEffect(() => {
    api.get("/users", { params: { limit: 100 } }).then((r) => {
      const all = r.data.data.items;
      setStats({
        total: r.data.data.pagination.total,
        sales: all.filter((x) => x.role === "sales").length,
        finance: all.filter((x) => x.role === "finance").length,
        active: all.filter((x) => x.status === "active").length,
        inactive: all.filter((x) => x.status === "inactive").length,
      });
    });
  }, [items.length]);
  const toggle = async (u) => {
    await api.patch(`/users/${u._id}/status`, {
      status: u.status === "active" ? "inactive" : "active",
    });
    setToast({ type: "success", message: `${u.fullName} status updated` });
    load();
  };
  const doReset = async () => {
    try {
      await api.post(`/users/${reset._id}/reset-password`, { password });
      setToast({ type: "success", message: "Password reset successfully" });
      setReset(null);
      setPassword("");
    } catch (e) {
      setToast({ type: "error", message: e.message });
    }
  };
  return (
    <>
      <div className={tw.pageHead}>
        <div>
          <h1 className={tw.pageTitleH1}>Users List</h1>
          <p className={tw.pageTitleP}>
            Manage all system users. You can view, create, deactivate users and
            reset passwords.
          </p>
        </div>
      </div>
      <div className={tw.summaryStrip}>
        <StatCard label="Total Users" value={stats.total || 0} icon={Users} />
        <StatCard
          label="Marketing Users"
          value={stats.sales || 0}
          icon={UserCog}
          tone="cyan"
        />
        <StatCard
          label="Accounting Users"
          value={stats.finance || 0}
          icon={CircleUserRound}
        />
        <StatCard
          label="Active Users"
          value={stats.active || 0}
          icon={Power}
          tone="green"
        />
        <StatCard
          label="Disabled Users"
          value={stats.inactive || 0}
          icon={Power}
          tone="red"
        />
      </div>
      <div className={tw.toolbar}>
        <SearchBox
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, username, email or mobile"
        />
        <select
          className={tw.compactSelect}
          value={role}
          onChange={(e) => {
            setPage(1);
            setRole(e.target.value);
          }}
        >
          <option value="">All User Types</option>
          <option value="sales">Marketing</option>
          <option value="finance">Accounting</option>
          <option value="admin">Admin</option>
        </select>
        <select
          className={tw.compactSelect}
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <Button
          kind="secondary"
          onClick={() => {
            setPage(1);
            load();
          }}
        >
          Filter
        </Button>
        <Button
          kind="secondary"
          icon={Download}
          onClick={() =>
            window.open(
              `${api.defaults.baseURL}/reports/users`,
              "_blank",
            )
          }
        >
          Export
        </Button>
        <Link to="/admin/users/create">
          <Button icon={Plus}>Create User</Button>
        </Link>
      </div>
      <div className={tw.panel}>
        <div className={tw.tableWrap}>
          <table className={tw.dataTable}>
            <thead>
              <tr>
                <th className={tw.th}>#</th>
                <th className={tw.th}>Full Name</th>
                <th className={tw.th}>Username</th>
                <th className={tw.th}>Email</th>
                <th className={tw.th}>Contact Number</th>
                <th className={tw.th}>User Type</th>
                <th className={tw.th}>Status</th>
                <th className={tw.th}>Created On</th>
                <th className={tw.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u, i) => (
                <tr key={u._id} className={tw.tr}>
                  <td className={tw.td}>{(meta?.page - 1) * meta?.limit + i + 1}</td>
                  <td className={tw.td}>
                    <div className={tw.person}>
                      <div className={tw.miniAvatar}>{initials(u.fullName)}</div>
                      <strong className={tw.tdStrong}>{u.fullName}</strong>
                    </div>
                  </td>
                  <td className={tw.td}>@{u.username}</td>
                  <td className={tw.td}>{u.email}</td>
                  <td className={tw.td}>{u.contactNumber || "—"}</td>
                  <td className={tw.td}>
                    <Badge>
                      {u.role === "sales"
                        ? "Marketing"
                        : u.role === "finance"
                          ? "Accounting"
                          : "Admin"}
                    </Badge>
                  </td>
                  <td className={tw.td}>
                    <Badge>{u.status}</Badge>
                  </td>
                  <td className={tw.td}>{dateFmt(u.createdAt)}</td>
                  <td className={tw.td}>
                    <div className={tw.inlineActions}>
                      {u.role !== "admin" && (
                        <>
                          <button
                            className={tw.actionLink}
                            onClick={() => {
                              setReset(u);
                              setPassword("");
                            }}
                          >
                            <RefreshCcw size={10} /> Reset Password
                          </button>
                          <button
                            className={tw.actionLink}
                            onClick={() => toggle(u)}
                          >
                            {u.status === "active" ? "Disable" : "Activate"}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={meta} onPage={setPage} />
      </div>
      {reset && (
        <Modal
          title={`Reset password — ${reset.fullName}`}
          onClose={() => setReset(null)}
        >
          <p className={`${tw.text.muted} ${tw.text.small}`}>
            Enter a temporary password. The user can use it on their next login.
          </p>
          <input
            className={`${tw.input} mt-2`}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters with a number"
          />
          <div className={tw.formActions}>
            <Button kind="secondary" onClick={() => setReset(null)}>
              Cancel
            </Button>
            <Button onClick={doReset}>Reset Password</Button>
          </div>
        </Modal>
      )}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}

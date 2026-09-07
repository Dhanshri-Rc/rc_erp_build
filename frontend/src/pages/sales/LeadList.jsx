import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import {
  Badge,
  Button,
  Pagination,
  SearchBox,
  dateFmt,
  money,
} from "../../components/UI";
export default function LeadList() {
  const [items, setItems] = useState([]),
    [meta, setMeta] = useState(null),
    [q, setQ] = useState(""),
    [status, setStatus] = useState(""),
    [page, setPage] = useState(1);
  const load = () =>
    api
      .get("/leads", { params: { page, limit: 10, search: q, status } })
      .then((r) => {
        setItems(r.data.data.items);
        setMeta(r.data.data.pagination);
      });
  useEffect(() => {
    load();
  }, [page, status]);
  return (
    <>
      <div className="page-head">
        <div className="page-title">
          <h1>Leads & Follow-ups</h1>
          <p>Track generated leads, discussions and next follow-up actions.</p>
        </div>
        <Link to="/sales/leads/create">
          <Button icon={Plus}>Create Lead</Button>
        </Link>
      </div>
      <div className="toolbar">
        <SearchBox
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search lead, contact or organization"
        />
        <select
          className="compact-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="discussion">In Discussion</option>
          <option value="proposal">Proposal Sent</option>
          <option value="negotiation">Negotiation</option>
          <option value="converted">Converted</option>
          <option value="closed">Closed</option>
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
      </div>
      <div className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Contact</th>
                <th>Lead For</th>
                <th>Budget</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Next Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {items.map((l) => (
                <tr key={l._id}>
                  <td>
                    <strong>{l.leadTitle}</strong>
                    <div className="tiny muted">{l.leadNo}</div>
                  </td>
                  <td>
                    {l.contactName}
                    <div className="tiny muted">{l.email}</div>
                  </td>
                  <td>{l.leadFor}</td>
                  <td>{money(l.targetBudget)}</td>
                  <td>
                    <Badge
                      tone={
                        l.priority === "high" || l.priority === "urgent"
                          ? "red"
                          : l.priority === "medium"
                            ? "orange"
                            : "blue"
                      }
                    >
                      {l.priority}
                    </Badge>
                  </td>
                  <td>
                    <Badge>{l.status}</Badge>
                  </td>
                  <td>{dateFmt(l.nextFollowUpDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={meta} onPage={setPage} />
      </div>
    </>
  );
}

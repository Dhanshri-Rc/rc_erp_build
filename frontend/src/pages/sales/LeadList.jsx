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
import * as tw from "../../styles/tw";

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
      <div className={tw.pageHead}>
        <div>
          <h1 className={tw.pageTitleH1}>Leads & Follow-ups</h1>
          <p className={tw.pageTitleP}>
            Track generated leads, discussions and next follow-up actions.
          </p>
        </div>
        <Link to="/sales/leads/create">
          <Button icon={Plus}>Create Lead</Button>
        </Link>
      </div>
      <div className={tw.toolbar}>
        <SearchBox
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search lead, contact or organization"
        />
        <select
          className={tw.compactSelect}
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
      <div className={tw.panel}>
        <div className={tw.tableWrap}>
          <table className={tw.dataTable}>
            <thead>
              <tr>
                <th className={tw.th}>Lead</th>
                <th className={tw.th}>Contact</th>
                <th className={tw.th}>Lead For</th>
                <th className={tw.th}>Budget</th>
                <th className={tw.th}>Priority</th>
                <th className={tw.th}>Status</th>
                <th className={tw.th}>Next Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {items.map((l) => (
                <tr key={l._id} className={tw.tr}>
                  <td className={tw.td}>
                    <strong className={tw.tdStrong}>{l.leadTitle}</strong>
                    <div className={`${tw.text.tiny} ${tw.text.muted}`}>
                      {l.leadNo}
                    </div>
                  </td>
                  <td className={tw.td}>
                    {l.contactName}
                    <div className={`${tw.text.tiny} ${tw.text.muted}`}>
                      {l.email}
                    </div>
                  </td>
                  <td className={tw.td}>{l.leadFor}</td>
                  <td className={tw.td}>{money(l.targetBudget)}</td>
                  <td className={tw.td}>
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
                  <td className={tw.td}>
                    <Badge>{l.status}</Badge>
                  </td>
                  <td className={tw.td}>{dateFmt(l.nextFollowUpDate)}</td>
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

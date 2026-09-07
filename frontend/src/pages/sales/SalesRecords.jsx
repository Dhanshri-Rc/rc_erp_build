import { useEffect, useState } from "react";
import { Download, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { Badge, Button, Pagination, dateFmt, money } from "../../components/UI";
export default function SalesRecords({ type = "authorship" }) {
  const [items, setItems] = useState([]),
    [meta, setMeta] = useState(null),
    [page, setPage] = useState(1);
  const publication = type === "publication";
  useEffect(() => {
    api
      .get(`/sales/${publication ? "publications" : "authorship"}`, {
        params: { page, limit: 10 },
      })
      .then((r) => {
        setItems(r.data.data.items);
        setMeta(r.data.data.pagination);
      });
  }, [page, type]);
  return (
    <>
      <div className="page-head">
        <div className="page-title">
          <h1>
            {publication ? "Direct Paper Publications" : "Authorship Sales"}
          </h1>
          <p>
            {publication
              ? "All direct publication services created by your account."
              : "All authorship sales created by your account."}
          </p>
        </div>
        <Link
          to={
            publication
              ? "/sales/publications/create"
              : "/sales/authorship-sales/create"
          }
        >
          <Button icon={Plus}>
            New {publication ? "Publication" : "Authorship Sale"}
          </Button>
        </Link>
      </div>
      <div className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>{publication ? "Paper / Journal" : "Article / Journal"}</th>
                <th>Vendor</th>
                <th>Total</th>
                <th>Advance</th>
                <th>Remaining</th>
                <th>Payment Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map((x) => (
                <tr key={x._id}>
                  <td>
                    <strong>{publication ? x.publicationNo : x.saleNo}</strong>
                  </td>
                  <td>
                    {publication ? x.paperTitle : x.article?.title}
                    <div className="tiny muted">{x.journal?.name}</div>
                  </td>
                  <td>{x.vendor?.vendorName}</td>
                  <td>{money(publication ? x.totalAmount : x.totalPrice)}</td>
                  <td>
                    {money(publication ? x.advanceAmount : x.advancePayment)}
                  </td>
                  <td>{money(x.remainingAmount)}</td>
                  <td>
                    <Badge>{x.paymentStatus}</Badge>
                  </td>
                  <td>{dateFmt(x.createdAt)}</td>
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

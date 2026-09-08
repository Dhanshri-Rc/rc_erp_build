import { useEffect, useState } from "react";
import { Download, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { Badge, Button, Pagination, dateFmt, money } from "../../components/UI";
import * as tw from "../../styles/tw";

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
      <div className={tw.pageHead}>
        <div>
          <h1 className={tw.pageTitleH1}>
            {publication ? "Direct Paper Publications" : "Authorship Sales"}
          </h1>
          <p className={tw.pageTitleP}>
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
      <div className={tw.panel}>
        <div className={tw.tableWrap}>
          <table className={tw.dataTable}>
            <thead>
              <tr>
                <th className={tw.th}>Reference</th>
                <th className={tw.th}>
                  {publication ? "Paper / Journal" : "Article / Journal"}
                </th>
                <th className={tw.th}>Vendor</th>
                <th className={tw.th}>Total</th>
                <th className={tw.th}>Advance</th>
                <th className={tw.th}>Remaining</th>
                <th className={tw.th}>Payment Status</th>
                <th className={tw.th}>Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map((x) => (
                <tr key={x._id} className={tw.tr}>
                  <td className={tw.td}>
                    <strong className={tw.tdStrong}>
                      {publication ? x.publicationNo : x.saleNo}
                    </strong>
                  </td>
                  <td className={tw.td}>
                    {publication ? x.paperTitle : x.article?.title}
                    <div className={`${tw.text.tiny} ${tw.text.muted}`}>
                      {x.journal?.name}
                    </div>
                  </td>
                  <td className={tw.td}>{x.vendor?.vendorName}</td>
                  <td className={tw.td}>
                    {money(publication ? x.totalAmount : x.totalPrice)}
                  </td>
                  <td className={tw.td}>
                    {money(publication ? x.advanceAmount : x.advancePayment)}
                  </td>
                  <td className={tw.td}>{money(x.remainingAmount)}</td>
                  <td className={tw.td}>
                    <Badge>{x.paymentStatus}</Badge>
                  </td>
                  <td className={tw.td}>{dateFmt(x.createdAt)}</td>
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

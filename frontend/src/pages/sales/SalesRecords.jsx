import { useEffect, useState } from "react";
import { Download, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { Badge, Button, ConfirmDialog, Field, Input, Modal, Pagination, RecordActions, Textarea, Toast, dateFmt, money } from "../../components/UI";
import * as tw from "../../styles/tw";

export default function SalesRecords({ type = "authorship" }) {
  const [items, setItems] = useState([]),
    [meta, setMeta] = useState(null),
    [page, setPage] = useState(1),
    [selected, setSelected] = useState(null),
    [editing,setEditing]=useState(null),
    [removing,setRemoving]=useState(null),
    [toast,setToast]=useState(null),
    [busy,setBusy]=useState(false);
  const publication = type === "publication";
  const load=()=>api
      .get(`/sales/${publication ? "publications" : "authorship"}`, {
        params: { page, limit: 10 },
      })
      .then((r) => {
        setItems(r.data.data.items);
        setMeta(r.data.data.pagination);
      });
  useEffect(() => {
    load().catch((error)=>setToast({type:"error",message:error.message}));
  }, [page, type]);
  const saveEdit=async(e)=>{e.preventDefault();setBusy(true);try{const path=publication?"publications":"authorship";const body=publication?{paperTitle:editing.paperTitle,issueType:editing.issueType,issueVolume:editing.issueVolume,authorCategory:editing.authorCategory,remarks:editing.remarks}:{positions:editing.positions,remarks:editing.remarks};await api.put(`/sales/${path}/${editing._id}`,body);setEditing(null);await load();setToast({type:"success",message:`${publication?"Publication":"Authorship sale"} updated successfully`});}catch(error){setToast({type:"error",message:error.message});}finally{setBusy(false);}};
  const setAuthor=(index,key,value)=>setEditing((current)=>({...current,positions:current.positions.map((position,i)=>i===index?{...position,[key]:value}:position)}));
  const remove=async()=>{setBusy(true);try{await api.delete(`/sales/${publication?"publications":"authorship"}/${removing._id}`);setRemoving(null);await load();setToast({type:"success",message:`${publication?"Publication":"Authorship sale"} deleted successfully`});}catch(error){setToast({type:"error",message:error.message});}finally{setBusy(false);}};
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
              
                <th className={tw.th}>Action</th>
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
              
                  <td className={tw.td}><RecordActions onView={()=>setSelected(x)} onEdit={()=>setEditing({...x,positions:x.positions?.map((p)=>({...p}))||[]})} onDelete={()=>setRemoving(x)}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={meta} onPage={setPage} />
      </div>
      {selected && (
        <Modal title={publication ? "Publication Service Details" : "Authorship Sale Details"} onClose={()=>setSelected(null)} wide>
          <div className={tw.detailGrid}>
            {(publication ? [
              ["Reference",selected.publicationNo],
              ["Journal",selected.journal?.name],
              ["Paper Title",selected.paperTitle],
              ["Issue / Volume",selected.issueVolume||"—"],
              ["Vendor",selected.vendor?.vendorName],
              ["Currency",selected.currency],
              ["Total",`${selected.currency||"INR"} ${Number(selected.totalAmount||0).toLocaleString("en-IN")}`],
              ["Advance",`${selected.currency||"INR"} ${Number(selected.advanceAmount||0).toLocaleString("en-IN")}`],
              ["Payment Status",selected.paymentStatus],
              ["Created",dateFmt(selected.createdAt)],
            ] : [
              ["Reference",selected.saleNo],
              ["Journal",selected.journal?.name],
              ["Article",selected.article?.title],
              ["Vendor",selected.vendor?.vendorName],
              ["Booked Positions",selected.positions?.map((p)=>p.position).join(", ")||"—"],
              ["No. of Authors",selected.numberOfAuthors],
              ["Created",dateFmt(selected.createdAt)],
              ["Remarks",selected.remarks||"—"],
            ]).map(([label,value])=><div className={tw.detailItem} key={label}><span className={tw.detailLabel}>{label}</span><div className={tw.detailValue}>{value}</div></div>)}
          </div>
          {!publication && selected.positions?.length>0 && <><h4 className="text-[12px] mt-4 mb-2">Booked Authors</h4><div className="grid gap-2">{selected.positions.map((p)=><div className={tw.detailItem} key={p.position}><span className={tw.detailLabel}>Position {p.position}</span><div className={tw.detailValue}>{p.authorName} · {[p.department,p.college].filter(Boolean).join(", ")||"No affiliation added"}</div></div>)}</div></>}
        </Modal>
      )}
      {editing&&<Modal title={`Edit ${publication?"Publication Service":"Authorship Sale"}`} onClose={()=>setEditing(null)} wide><form onSubmit={saveEdit}>
        {publication?<div className={tw.formGrid}>
          <Field label="Paper Title" required className="full"><Input value={editing.paperTitle||""} onChange={(e)=>setEditing({...editing,paperTitle:e.target.value})}/></Field>
          <Field label="Issue Type"><Input value={editing.issueType||""} onChange={(e)=>setEditing({...editing,issueType:e.target.value})}/></Field>
          <Field label="Issue / Volume" required><Input value={editing.issueVolume||""} onChange={(e)=>setEditing({...editing,issueVolume:e.target.value})}/></Field>
          <Field label="Author Category"><Input value={editing.authorCategory||""} onChange={(e)=>setEditing({...editing,authorCategory:e.target.value})}/></Field>
          <Field label="Remarks" className="full"><Textarea value={editing.remarks||""} onChange={(e)=>setEditing({...editing,remarks:e.target.value})}/></Field>
        </div>:<div className="grid gap-3">{editing.positions.map((position,index)=><div className={`${tw.formCard} mb-0`} key={position.position}><h4 className="m-0 mb-2 text-[12px]">Position {position.position}</h4><div className={tw.formGridThree}><Field label="Author Name" required><Input value={position.authorName} onChange={(e)=>setAuthor(index,"authorName",e.target.value)}/></Field><Field label="Department"><Input value={position.department||""} onChange={(e)=>setAuthor(index,"department",e.target.value)}/></Field><Field label="College"><Input value={position.college||""} onChange={(e)=>setAuthor(index,"college",e.target.value)}/></Field></div></div>)}<Field label="Remarks"><Textarea value={editing.remarks||""} onChange={(e)=>setEditing({...editing,remarks:e.target.value})}/></Field></div>}
        <div className={tw.formActions}><Button kind="secondary" onClick={()=>setEditing(null)}>Cancel</Button><Button type="submit" disabled={busy}>{busy?"Saving…":"Save Changes"}</Button></div>
      </form></Modal>}
      {removing&&<ConfirmDialog title={`Delete ${publication?"publication":"authorship sale"}?`} message={publication?`Delete “${removing.publicationNo}”? Records with verified payments cannot be deleted.`:`Delete “${removing.saleNo}”? Its booked article positions will be released.`} onClose={()=>setRemoving(null)} onConfirm={remove} busy={busy}/>} 
      <Toast toast={toast} onClose={()=>setToast(null)}/>
    </>
  );
}

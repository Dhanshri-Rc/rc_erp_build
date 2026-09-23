import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import {
  Badge,
  Button,
  ConfirmDialog,
  Field,
  Input,
  Modal,
  Pagination,
  RecordActions,
  SearchBox,
  Select,
  Textarea,
  Toast,
  dateFmt,
  money,
} from "../../components/UI";
import * as tw from "../../styles/tw";

export default function LeadList() {
  const [items, setItems] = useState([]),
    [meta, setMeta] = useState(null),
    [q, setQ] = useState(""),
    [status, setStatus] = useState(""),
    [page, setPage] = useState(1),
    [selected,setSelected]=useState(null),
    [editing,setEditing]=useState(null),
    [removing,setRemoving]=useState(null),
    [toast,setToast]=useState(null),
    [busy,setBusy]=useState(false);
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
  const saveEdit=async(e)=>{e.preventDefault();setBusy(true);try{await api.put(`/leads/${editing._id}`,editing);setEditing(null);await load();setToast({type:"success",message:"Lead updated successfully"});}catch(error){setToast({type:"error",message:error.message});}finally{setBusy(false);}};
  const remove=async()=>{setBusy(true);try{await api.delete(`/leads/${removing._id}`);setRemoving(null);await load();setToast({type:"success",message:"Lead deleted successfully"});}catch(error){setToast({type:"error",message:error.message});}finally{setBusy(false);}};
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
                <th className={tw.th}>Actions</th>
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
                  <td className={tw.td}><RecordActions onView={()=>setSelected(l)} onEdit={()=>setEditing({...l,nextFollowUpDate:l.nextFollowUpDate?.slice?.(0,10)||""})} onDelete={()=>setRemoving(l)}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={meta} onPage={setPage} />
      </div>
      {selected&&<Modal title="Lead Details" onClose={()=>setSelected(null)} wide><div className={tw.detailGrid}>{[["Lead Reference",selected.leadNo],["Lead Title",selected.leadTitle],["Lead For",selected.leadFor||"—"],["Contact",selected.contactName],["Email",selected.email||"—"],["Mobile",selected.mobile||"—"],["Organization",selected.organization||"—"],["Budget",money(selected.targetBudget)],["Priority",selected.priority],["Status",selected.status],["Next Follow-up",dateFmt(selected.nextFollowUpDate)],["Description",selected.description||"—"]].map(([label,value])=><div className={tw.detailItem} key={label}><span className={tw.detailLabel}>{label}</span><div className={tw.detailValue}>{value}</div></div>)}</div></Modal>}
      {editing&&<Modal title="Edit Lead" onClose={()=>setEditing(null)} wide><form onSubmit={saveEdit}><div className={tw.formGridThree}>
        <Field label="Lead Title" required><Input value={editing.leadTitle} onChange={(e)=>setEditing({...editing,leadTitle:e.target.value})}/></Field>
        <Field label="Contact Name" required><Input value={editing.contactName} onChange={(e)=>setEditing({...editing,contactName:e.target.value})}/></Field>
        <Field label="Organization"><Input value={editing.organization||""} onChange={(e)=>setEditing({...editing,organization:e.target.value})}/></Field>
        <Field label="Email"><Input type="email" value={editing.email||""} onChange={(e)=>setEditing({...editing,email:e.target.value})}/></Field>
        <Field label="Mobile"><Input value={editing.mobile||""} onChange={(e)=>setEditing({...editing,mobile:e.target.value})}/></Field>
        <Field label="Budget"><Input type="number" min="0" value={editing.targetBudget||""} onChange={(e)=>setEditing({...editing,targetBudget:e.target.value})}/></Field>
        <Field label="Priority"><Select value={editing.priority} onChange={(e)=>setEditing({...editing,priority:e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></Select></Field>
        <Field label="Status"><Select value={editing.status} onChange={(e)=>setEditing({...editing,status:e.target.value})}>{["new","contacted","discussion","proposal","negotiation","converted","closed"].map((x)=><option key={x} value={x}>{x}</option>)}</Select></Field>
        <Field label="Next Follow-up"><Input type="date" value={editing.nextFollowUpDate||""} onChange={(e)=>setEditing({...editing,nextFollowUpDate:e.target.value})}/></Field>
        <Field label="Description" className="full"><Textarea value={editing.description||""} onChange={(e)=>setEditing({...editing,description:e.target.value})}/></Field>
        <Field label="Remarks" className="full"><Textarea value={editing.remarks||""} onChange={(e)=>setEditing({...editing,remarks:e.target.value})}/></Field>
      </div><div className={tw.formActions}><Button kind="secondary" onClick={()=>setEditing(null)}>Cancel</Button><Button type="submit" disabled={busy}>{busy?"Saving…":"Save Changes"}</Button></div></form></Modal>}
      {removing&&<ConfirmDialog title="Delete lead?" message={`Delete “${removing.leadTitle}”? This action cannot be undone.`} onClose={()=>setRemoving(null)} onConfirm={remove} busy={busy}/>} 
      <Toast toast={toast} onClose={()=>setToast(null)}/>
    </>
  );
}

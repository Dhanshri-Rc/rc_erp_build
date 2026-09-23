import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { Badge, Button, ConfirmDialog, Field, Input, Modal, Pagination, RecordActions, SearchBox, Select, Textarea, Toast, dateFmt } from "../../components/UI";
import * as tw from "../../styles/tw";

export default function ClientList(){
  const [items,setItems]=useState([]),[meta,setMeta]=useState(null),[q,setQ]=useState(""),[status,setStatus]=useState(""),[businessType,setBusinessType]=useState(""),[page,setPage]=useState(1),[selected,setSelected]=useState(null),[editing,setEditing]=useState(null),[removing,setRemoving]=useState(null),[toast,setToast]=useState(null),[busy,setBusy]=useState(false);
  const load=()=>api.get("/clients",{params:{page,limit:10,search:q,status,businessType}}).then((r)=>{setItems(r.data.data.items);setMeta(r.data.data.pagination);});
  useEffect(()=>{load();},[page,status,businessType]);
  const saveEdit=async(e)=>{e.preventDefault();setBusy(true);try{await api.put(`/clients/${editing._id}`,editing);setEditing(null);await load();setToast({type:"success",message:"Client updated successfully"});}catch(error){setToast({type:"error",message:error.message});}finally{setBusy(false);}};
  const remove=async()=>{setBusy(true);try{await api.delete(`/clients/${removing._id}`);setRemoving(null);await load();setToast({type:"success",message:"Client deleted successfully"});}catch(error){setToast({type:"error",message:error.message});}finally{setBusy(false);}};
  return (
    <>
      <div className={tw.pageHead}><div><h1 className={tw.pageTitleH1}>Client List</h1><p className={tw.pageTitleP}>View and manage the B-B and B-C clients created by your account.</p></div><Link to="/sales/clients/create"><Button icon={Plus}>Add Client</Button></Link></div>
      <div className={tw.toolbar}><SearchBox value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search client, contact or institution"/><select className={tw.compactSelect} value={businessType} onChange={(e)=>setBusinessType(e.target.value)}><option value="">All Business Types</option><option value="B-B">B-B</option><option value="B-C">B-C</option></select><select className={tw.compactSelect} value={status} onChange={(e)=>setStatus(e.target.value)}><option value="">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></select><Button kind="secondary" onClick={()=>{setPage(1);load();}}>Filter</Button></div>
      <div className={tw.panel}><div className={tw.tableWrap}><table className={tw.dataTable}><thead><tr><th className={tw.th}>#</th><th className={tw.th}>Client</th><th className={tw.th}>Business Type</th><th className={tw.th}>Contact Person</th><th className={tw.th}>Institution</th><th className={tw.th}>Status</th><th className={tw.th}>Added</th><th className={tw.th}>Action</th></tr></thead>
        <tbody>{items.map((c,i)=><tr key={c._id} className={tw.tr}><td className={tw.td}>{(meta?.page-1)*meta?.limit+i+1}</td><td className={tw.td}><strong className={tw.tdStrong}>{c.clientName}</strong></td><td className={tw.td}><Badge tone={c.businessType==="B-B"?"purple":"cyan"}>{c.businessType}</Badge></td><td className={tw.td}>{c.contactPerson||"—"}</td><td className={tw.td}>{c.college||"—"}</td><td className={tw.td}><Badge>{c.status}</Badge></td><td className={tw.td}>{dateFmt(c.createdAt)}</td><td className={tw.td}><RecordActions onView={()=>setSelected(c)} onEdit={()=>setEditing({...c})} onDelete={()=>setRemoving(c)}/></td></tr>)}</tbody>
      </table></div><Pagination meta={meta} onPage={setPage}/></div>
      {selected&&<Modal title="Client Details" onClose={()=>setSelected(null)} wide><div className={tw.detailGrid}>{[["Client / Organization",selected.clientName],["Business Type",selected.businessType],["Contact Person",selected.contactPerson||"—"],["Email",selected.email||"—"],["Mobile",selected.mobile||"—"],["Department",selected.department||"—"],["College / Institution",selected.college||"—"],["Address",selected.address||"—"],["Status",selected.status],["Added",dateFmt(selected.createdAt)],["Notes",selected.notes||"—"]].map(([l,v])=><div className={tw.detailItem} key={l}><span className={tw.detailLabel}>{l}</span><div className={tw.detailValue}>{v}</div></div>)}</div></Modal>}
      {editing&&<Modal title="Edit Client" onClose={()=>setEditing(null)} wide><form onSubmit={saveEdit}><div className={tw.formGridThree}>
        <Field label="Client / Organization" required><Input value={editing.clientName} onChange={(e)=>setEditing({...editing,clientName:e.target.value})}/></Field>
        <Field label="Business Type" required><Select value={editing.businessType} onChange={(e)=>setEditing({...editing,businessType:e.target.value})}><option value="B-B">B-B</option><option value="B-C">B-C</option></Select></Field>
        <Field label="Contact Person"><Input value={editing.contactPerson||""} onChange={(e)=>setEditing({...editing,contactPerson:e.target.value})}/></Field>
        <Field label="Email"><Input type="email" value={editing.email||""} onChange={(e)=>setEditing({...editing,email:e.target.value})}/></Field>
        <Field label="Mobile"><Input value={editing.mobile||""} onChange={(e)=>setEditing({...editing,mobile:e.target.value})}/></Field>
        <Field label="Department"><Input value={editing.department||""} onChange={(e)=>setEditing({...editing,department:e.target.value})}/></Field>
        <Field label="College / Institution"><Input value={editing.college||""} onChange={(e)=>setEditing({...editing,college:e.target.value})}/></Field>
        <Field label="Status"><Select value={editing.status} onChange={(e)=>setEditing({...editing,status:e.target.value})}><option value="active">Active</option><option value="inactive">Inactive</option></Select></Field>
        <Field label="Address" className="full"><Textarea value={editing.address||""} onChange={(e)=>setEditing({...editing,address:e.target.value})}/></Field>
        <Field label="Notes" className="full"><Textarea value={editing.notes||""} onChange={(e)=>setEditing({...editing,notes:e.target.value})}/></Field>
      </div><div className={tw.formActions}><Button kind="secondary" onClick={()=>setEditing(null)}>Cancel</Button><Button type="submit" disabled={busy}>{busy?"Saving…":"Save Changes"}</Button></div></form></Modal>}
      {removing&&<ConfirmDialog title="Delete client?" message={`Delete “${removing.clientName}”? This action cannot be undone.`} onClose={()=>setRemoving(null)} onConfirm={remove} busy={busy}/>} 
      <Toast toast={toast} onClose={()=>setToast(null)}/>
    </>
  );
}

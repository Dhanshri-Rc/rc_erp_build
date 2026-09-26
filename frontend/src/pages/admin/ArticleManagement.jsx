import { useEffect, useState } from "react";
import { FilePlus2 } from "lucide-react";
import { api } from "../../services/api";
import { Badge, Button, ConfirmDialog, Field, Input, Modal, RecordActions, Select, Toast, dateFmt } from "../../components/UI";
import * as tw from "../../styles/tw";

const empty = { journal:"", title:"", issn:"", webUrl:"", totalPOS:"" };

export default function ArticleManagement() {
  const [form,setForm] = useState(empty);
  const [journals,setJournals] = useState([]);
  const [items,setItems] = useState([]);
  const [selected,setSelected] = useState(null);
  const [editing,setEditing] = useState(null);
  const [removing,setRemoving] = useState(null);
  const [toast,setToast] = useState(null);
  const [busy,setBusy] = useState(false);
  const load = () => Promise.all([api.get("/catalog/journals",{params:{all:true}}),api.get("/catalog/articles",{params:{all:true}})]).then(([j,a])=>{setJournals(j.data.data.filter((x)=>x.status==="active"));setItems(a.data.data);});
  useEffect(()=>{ load().catch((e)=>setToast({type:"error",message:e.message})); },[]);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      await api.post("/catalog/articles",{...form,totalPOS:Number(form.totalPOS)});
      setForm(empty); await load(); setToast({type:"success",message:"Article added and positions created"});
    } catch (error) { setToast({type:"error",message:error.message}); }
    finally { setBusy(false); }
  };
  const saveEdit=async(e)=>{e.preventDefault();setBusy(true);try{await api.put(`/catalog/articles/${editing._id}`,{...editing,journal:editing.journal?._id||editing.journal,totalPOS:Number(editing.totalPOS)});setEditing(null);await load();setToast({type:"success",message:"Article updated successfully"});}catch(error){setToast({type:"error",message:error.message});}finally{setBusy(false);}};
  const remove=async()=>{setBusy(true);try{await api.delete(`/catalog/articles/${removing._id}`);setRemoving(null);await load();setToast({type:"success",message:"Article deleted successfully"});}catch(error){setToast({type:"error",message:error.message});}finally{setBusy(false);}};
  return (
    <>
      <div className={tw.pageHead}><div><h1 className={tw.pageTitleH1}>Article Management</h1><p className={tw.pageTitleP}>Create articles and define the exact authorship position range.</p></div></div>
      <form className={tw.formCard} onSubmit={submit}>
        <h3 className={tw.formCardH3}>Add Article</h3>
        <div className={tw.subtext}>An article with 8 positions automatically provides positions 1 through 8.</div>
        <div className={tw.formGridThree}>
          <Field label="Select Journal" required><Select value={form.journal} onChange={(e)=>setForm({...form,journal:e.target.value})}><option value="">Select journal</option>{journals.map((j)=><option value={j._id} key={j._id}>{j.name}</option>)}</Select></Field>
          <Field label="Article Title" required><Input value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} /></Field>
          <Field label="ISSN No." required><Input value={form.issn} onChange={(e)=>setForm({...form,issn:e.target.value})} /></Field>
          <Field label="Web URL" required><Input type="url" value={form.webUrl} onChange={(e)=>setForm({...form,webUrl:e.target.value})} placeholder="https://" /></Field>
          <Field label="Total No. of Positions" required><Input type="number" min="1" max="100" value={form.totalPOS} onChange={(e)=>setForm({...form,totalPOS:e.target.value})} placeholder="6 or 8" /></Field>
        </div>
        <div className={tw.formActions}><Button type="submit" icon={FilePlus2} disabled={busy}>{busy?"Adding…":"Add Article"}</Button></div>
      </form>
      <div className={tw.panel}><div className={tw.panelHead}><h3 className={tw.panelHeadH3}>Article List ({items.length})</h3></div><div className={tw.tableWrap}>
        <table className={tw.dataTable}><thead><tr><th className={tw.th}>Article</th><th className={tw.th}>ISSN</th><th className={tw.th}>Action</th></tr></thead>
          <tbody>{items.map((a)=><tr key={a._id} className={tw.tr}><td className={tw.td}><strong className={tw.tdStrong}>{a.title}</strong></td><td className={tw.td}>{a.issn}</td><td className={tw.td}><RecordActions onView={()=>setSelected(a)} onEdit={()=>setEditing({...a,journal:a.journal?._id||a.journal})} onDelete={()=>setRemoving(a)}/></td></tr>)}</tbody>
        </table>
      </div></div>
      {selected && <Modal title="Article & Position Details" onClose={()=>setSelected(null)} wide>
        <div className={tw.detailGrid}>{[["Article",selected.title],["Journal",selected.journal?.name],["ISSN",selected.issn],["Web URL",selected.webUrl],["Total Positions",selected.totalPOS],["Available Positions",selected.availablePOS]].map(([l,v])=><div className={tw.detailItem} key={l}><span className={tw.detailLabel}>{l}</span><div className={tw.detailValue}>{v}</div></div>)}</div>
        <h4 className="text-[12px] mt-4 mb-2">Position Status</h4>
        <div className={tw.positionGrid}>{Array.from({length:selected.totalPOS},(_,i)=>i+1).map((pos)=>{const b=selected.bookingsByPosition?.[pos];return <div key={pos} className={b?tw.positionBooked:tw.positionAvailable}><b className="text-[11px]">POS {pos}</b><div className="text-[10px] mt-1">{b?`${b.authorName} · ${b.department||b.college||"Booked"}`:"Available"}</div></div>;})}</div>
      </Modal>}
      {editing&&<Modal title="Edit Article" onClose={()=>setEditing(null)} wide><form onSubmit={saveEdit}><div className={tw.formGridThree}>
        <Field label="Journal" required><Select value={editing.journal} onChange={(e)=>setEditing({...editing,journal:e.target.value})}>{journals.map((j)=><option key={j._id} value={j._id}>{j.name}</option>)}</Select></Field>
        <Field label="Article Title" required><Input value={editing.title} onChange={(e)=>setEditing({...editing,title:e.target.value})}/></Field>
        <Field label="ISSN No." required><Input value={editing.issn} onChange={(e)=>setEditing({...editing,issn:e.target.value})}/></Field>
        <Field label="Web URL" required><Input type="url" value={editing.webUrl} onChange={(e)=>setEditing({...editing,webUrl:e.target.value})}/></Field>
        <Field label="Total Positions" required><Input type="number" min="1" max="100" value={editing.totalPOS} onChange={(e)=>setEditing({...editing,totalPOS:e.target.value})}/></Field>
        <Field label="Status"><Select value={editing.status} onChange={(e)=>setEditing({...editing,status:e.target.value})}><option value="available">Available</option><option value="inactive">Inactive</option>{editing.availablePOS===0&&<option value="full">Full</option>}</Select></Field>
      </div><div className={tw.formActions}><Button kind="secondary" onClick={()=>setEditing(null)}>Cancel</Button><Button type="submit" disabled={busy}>{busy?"Saving…":"Save Changes"}</Button></div></form></Modal>}
      {removing&&<ConfirmDialog title="Delete article?" message={`Delete “${removing.title}”? Articles with booked positions cannot be deleted.`} onClose={()=>setRemoving(null)} onConfirm={remove} busy={busy}/>} 
      <Toast toast={toast} onClose={()=>setToast(null)} />
    </>
  );
}

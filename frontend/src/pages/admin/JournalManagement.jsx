import { useEffect, useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import { api } from "../../services/api";
import { Badge, Button, ConfirmDialog, Field, Input, Modal, RecordActions, Select, Toast, dateFmt } from "../../components/UI";
import * as tw from "../../styles/tw";

const empty = { name:"", issn:"", webUrl:"" };

export default function JournalManagement() {
  const [form,setForm] = useState(empty);
  const [items,setItems] = useState([]);
  const [selected,setSelected] = useState(null);
  const [editing,setEditing] = useState(null);
  const [removing,setRemoving] = useState(null);
  const [toast,setToast] = useState(null);
  const [busy,setBusy] = useState(false);
  const load = () => api.get("/catalog/journals",{params:{all:true}}).then((r)=>setItems(r.data.data));
  useEffect(()=>{ load().catch((e)=>setToast({type:"error",message:e.message})); },[]);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      await api.post("/catalog/journals",form);
      setForm(empty); await load();
      setToast({type:"success",message:"Journal added successfully"});
    } catch (error) { setToast({type:"error",message:error.message}); }
    finally { setBusy(false); }
  };
  const saveEdit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await api.put(`/catalog/journals/${editing._id}`,editing); setEditing(null); await load(); setToast({type:"success",message:"Journal updated successfully"}); }
    catch(error){ setToast({type:"error",message:error.message}); } finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true); try { await api.delete(`/catalog/journals/${removing._id}`); setRemoving(null); await load(); setToast({type:"success",message:"Journal deleted successfully"}); }
    catch(error){setToast({type:"error",message:error.message});} finally {setBusy(false);}
  };
  return (
    <>
      <div className={tw.pageHead}>
        <div><h1 className={tw.pageTitleH1}>Journal Management</h1><p className={tw.pageTitleP}>Add journals that will appear in every journal dropdown.</p></div>
      </div>
      <form className={tw.formCard} onSubmit={submit}>
        <h3 className={tw.formCardH3}>Add Journal</h3>
        <div className={tw.subtext}>Journal title, ISSN number and web URL are required.</div>
        <div className={tw.formGridThree}>
          <Field label="Journal Title" required><Input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="Enter journal title" /></Field>
          <Field label="ISSN No." required><Input value={form.issn} onChange={(e)=>setForm({...form,issn:e.target.value})} placeholder="XXXX-XXXX" /></Field>
          <Field label="Web URL" required><Input type="url" value={form.webUrl} onChange={(e)=>setForm({...form,webUrl:e.target.value})} placeholder="https://journal.example.com" /></Field>
        </div>
        <div className={tw.formActions}><Button type="submit" icon={Plus} disabled={busy}>{busy?"Adding…":"Add Journal"}</Button></div>
      </form>
      <div className={tw.panel}>
        <div className={tw.panelHead}><h3 className={tw.panelHeadH3}>Journal List ({items.length})</h3></div>
        <div className={tw.tableWrap}>
          <table className={tw.dataTable}><thead><tr><th className={tw.th}>Journal Title</th><th className={tw.th}>ISSN</th><th className={tw.th}>Web URL</th><th className={tw.th}>Status</th><th className={tw.th}>Added</th><th className={tw.th}>Action</th></tr></thead>
            <tbody>{items.map((j)=><tr key={j._id} className={tw.tr}><td className={tw.td}><strong className={tw.tdStrong}>{j.name}</strong></td><td className={tw.td}>{j.issn}</td><td className={tw.td}><a href={j.webUrl} target="_blank" rel="noreferrer" className={tw.actionLink}>Open URL</a></td><td className={tw.td}><Badge>{j.status}</Badge></td><td className={tw.td}>{dateFmt(j.createdAt)}</td><td className={tw.td}><RecordActions onView={()=>setSelected(j)} onEdit={()=>setEditing({...j})} onDelete={()=>setRemoving(j)}/></td></tr>)}</tbody>
          </table>
        </div>
      </div>
      {selected && <Modal title="Journal Details" onClose={()=>setSelected(null)}>
        <div className={tw.detailGrid}>{[["Journal Title",selected.name],["ISSN No.",selected.issn],["Web URL",selected.webUrl],["Status",selected.status],["Created",dateFmt(selected.createdAt)]].map(([l,v])=><div className={tw.detailItem} key={l}><span className={tw.detailLabel}>{l}</span><div className={tw.detailValue}>{v}</div></div>)}</div>
      </Modal>}
      {editing && <Modal title="Edit Journal" onClose={()=>setEditing(null)}><form onSubmit={saveEdit}><div className={tw.formGrid}>
        <Field label="Journal Title" required><Input value={editing.name} onChange={(e)=>setEditing({...editing,name:e.target.value})}/></Field>
        <Field label="ISSN No." required><Input value={editing.issn} onChange={(e)=>setEditing({...editing,issn:e.target.value})}/></Field>
        <Field label="Web URL" required className="full"><Input type="url" value={editing.webUrl} onChange={(e)=>setEditing({...editing,webUrl:e.target.value})}/></Field>
        <Field label="Status"><Select value={editing.status} onChange={(e)=>setEditing({...editing,status:e.target.value})}><option value="active">Active</option><option value="inactive">Inactive</option></Select></Field>
      </div><div className={tw.formActions}><Button kind="secondary" onClick={()=>setEditing(null)}>Cancel</Button><Button type="submit" disabled={busy}>{busy?"Saving…":"Save Changes"}</Button></div></form></Modal>}
      {removing && <ConfirmDialog title="Delete journal?" message={`Delete “${removing.name}”? Journals already used by articles or sales cannot be deleted.`} onClose={()=>setRemoving(null)} onConfirm={remove} busy={busy}/>} 
      <Toast toast={toast} onClose={()=>setToast(null)} />
    </>
  );
}

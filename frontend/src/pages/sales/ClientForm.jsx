import { useState } from "react";
import { Save, Users } from "lucide-react";
import { api } from "../../services/api";
import { Button, Field, Input, Select, Textarea, Toast } from "../../components/UI";
import * as tw from "../../styles/tw";

const initial = {clientName:"",businessType:"B-B",contactPerson:"",email:"",mobile:"",department:"",college:"",address:"",notes:"",status:"active"};

export default function ClientForm() {
  const [form,setForm] = useState(initial);
  const [toast,setToast] = useState(null);
  const [busy,setBusy] = useState(false);
  const set=(key,value)=>setForm((x)=>({...x,[key]:value}));
  const submit=async(e)=>{
    e.preventDefault();setBusy(true);
    try{await api.post("/clients",form);setForm(initial);setToast({type:"success",message:"Client added successfully"});}
    catch(error){setToast({type:"error",message:error.message});}
    finally{setBusy(false);}
  };
  return (
    <>
      <div className={tw.pageHead}><div><h1 className={tw.pageTitleH1}>Add New Client</h1><p className={tw.pageTitleP}>Create a B-B or B-C client in your sales account.</p></div></div>
      <div className={tw.formLayout}>
        <form onSubmit={submit}>
          <div className={tw.formCard}><h3 className={tw.formCardH3}>Client Information</h3><div className={tw.formGridThree}>
            <Field label="Client / Organization Name" required><Input value={form.clientName} onChange={(e)=>set("clientName",e.target.value)} /></Field>
            <Field label="Business Type" required><Select value={form.businessType} onChange={(e)=>set("businessType",e.target.value)}><option value="B-B">B-B</option><option value="B-C">B-C</option></Select></Field>
            <Field label="Contact Person"><Input value={form.contactPerson} onChange={(e)=>set("contactPerson",e.target.value)} /></Field>
            <Field label="Email"><Input type="email" value={form.email} onChange={(e)=>set("email",e.target.value)} /></Field>
            <Field label="Mobile Number"><Input value={form.mobile} onChange={(e)=>set("mobile",e.target.value)} /></Field>
            <Field label="Department"><Input value={form.department} onChange={(e)=>set("department",e.target.value)} /></Field>
            <Field label="College / Institution"><Input value={form.college} onChange={(e)=>set("college",e.target.value)} /></Field>
            <Field label="Status"><Select value={form.status} onChange={(e)=>set("status",e.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option></Select></Field>
            <Field label="Address" className="full"><Textarea value={form.address} onChange={(e)=>set("address",e.target.value)} /></Field>
            <Field label="Notes" className="full"><Textarea value={form.notes} onChange={(e)=>set("notes",e.target.value)} /></Field>
          </div><div className={tw.formActions}><Button type="button" kind="secondary" onClick={()=>setForm(initial)}>Reset</Button><Button type="submit" icon={Save} disabled={busy}>{busy?"Saving…":"Save Client"}</Button></div></div>
        </form>
        <aside className={tw.sideInfo}><div className={tw.infoCard.purple}><div className={tw.infoRow}><div className={tw.infoIcon}><Users/></div><div><b className={tw.infoRowB}>B-B</b><p className={tw.infoRowP}>Business-to-business client such as an institution, publisher or agency.</p></div></div><div className={tw.infoRow}><div className={tw.infoIcon}><Users/></div><div><b className={tw.infoRowB}>B-C</b><p className={tw.infoRowP}>Business-to-customer client such as an individual author or researcher.</p></div></div></div></aside>
      </div>
      <Toast toast={toast} onClose={()=>setToast(null)} />
    </>
  );
}

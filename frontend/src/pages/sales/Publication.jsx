import { useEffect, useState } from "react";
import { Info, Save, Upload } from "lucide-react";
import { api } from "../../services/api";
import { Button, Field, Input, Select, Textarea, Toast } from "../../components/UI";
import * as tw from "../../styles/tw";

const initial = {
  journal:"",issueType:"Regular Issue",issueVolume:"",paperTitle:"",vendor:"",
  authorCategory:"Indian",currency:"INR",exchangeRate:1,totalAmount:"",advanceAmount:"",
  paymentMode:"Bank Transfer",transactionId:"",transactionDate:new Date().toISOString().slice(0,10),remarks:""
};
const amount=(value,currency)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:currency||"INR",maximumFractionDigits:2}).format(Number(value||0));

export default function Publication(){
  const [catalog,setCatalog]=useState({journals:[],vendors:[]});
  const [form,setForm]=useState(initial);
  const [file,setFile]=useState(null);
  const [toast,setToast]=useState(null);
  const [busy,setBusy]=useState(false);
  const set=(key,value)=>setForm((x)=>({...x,[key]:value}));
  const advance=Number(form.advanceAmount||0);
  const remaining=Math.max(Number(form.totalAmount||0)-advance,0);
  const showPayment=advance>0;
  const vendor=catalog.vendors.find((v)=>v._id===form.vendor);
  useEffect(()=>{
    Promise.all([api.get("/catalog/journals"),api.get("/vendors/options")])
      .then(([j,v])=>setCatalog({journals:j.data.data,vendors:v.data.data}))
      .catch((error)=>setToast({type:"error",message:error.message}));
  },[]);
  const submit=async(e)=>{
    e.preventDefault();setBusy(true);
    try{
      const fd=new FormData();
      Object.entries(form).forEach(([key,value])=>value!==""&&fd.append(key,value));
      if(file)fd.append("paymentProof",file);
      await api.post("/sales/publications",fd,{headers:{"Content-Type":"multipart/form-data"}});
      setForm(initial);setFile(null);
      setToast({type:"success",message:"Publication service saved successfully"});
    }catch(error){setToast({type:"error",message:error.message});}
    finally{setBusy(false);}
  };
  return (
    <>
      <div className={tw.pageHead}><div><h1 className={tw.pageTitleH1}>New Paper Publication Service</h1><p className={tw.pageTitleP}>Create a publication service with a manually entered issue/volume and conditional payment information.</p></div></div>
      <div className={tw.formLayout}>
        <form onSubmit={submit}>
          <div className={tw.formCard}><h3 className={tw.formCardH3}>1. Publication Details</h3><div className={tw.formGrid}>
            <Field label="Journal Name" required><Select value={form.journal} onChange={(e)=>set("journal",e.target.value)}><option value="">Select journal</option>{catalog.journals.map((j)=><option key={j._id} value={j._id}>{j.name}</option>)}</Select></Field>
            <Field label="Issue Type" required><Select value={form.issueType} onChange={(e)=>set("issueType",e.target.value)}><option>Regular Issue</option><option>Special Issue</option><option>Fast Track</option></Select></Field>
            <Field label="Issue / Volume" required help="Enter the issue or volume manually."><Input value={form.issueVolume} onChange={(e)=>set("issueVolume",e.target.value)} placeholder="e.g. Volume 12, Issue 4"/></Field>
            <Field label="Manuscript / Paper Title" required><Input value={form.paperTitle} onChange={(e)=>set("paperTitle",e.target.value)}/></Field>
          </div></div>
          <div className={tw.formCard}><h3 className={tw.formCardH3}>2. Vendor Details</h3><div className={tw.formGrid}>
            <Field label="Select Vendor" required><Select value={form.vendor} onChange={(e)=>set("vendor",e.target.value)}><option value="">Select assigned vendor</option>{catalog.vendors.map((v)=><option key={v._id} value={v._id}>{v.vendorName}</option>)}</Select></Field>
            <Field label="Contact Person"><Input readOnly value={vendor?.contactPerson||""}/></Field>
          </div></div>
          <div className={tw.formCard}><h3 className={tw.formCardH3}>3. Publication & Pricing</h3><div className={tw.formGridThree}>
            <Field label="Author Category / Region" required><Select value={form.authorCategory} onChange={(e)=>set("authorCategory",e.target.value)}><option>Indian</option><option>International</option><option>SAARC</option></Select></Field>
            <Field label="Currency" required><Select value={form.currency} onChange={(e)=>set("currency",e.target.value)}><option value="INR">INR</option><option value="USD">USD</option></Select></Field>
            {form.currency==="USD"&&<Field label="Exchange Rate"><Input type="number" min="0.000001" step="0.01" value={form.exchangeRate} onChange={(e)=>set("exchangeRate",e.target.value)}/></Field>}
            <Field label="Total Amount" required><Input type="number" min="0.01" step="0.01" value={form.totalAmount} onChange={(e)=>set("totalAmount",e.target.value)}/></Field>
            <Field label="Advance Amount" required><Input type="number" min="0" max={form.totalAmount||0} step="0.01" value={form.advanceAmount} onChange={(e)=>set("advanceAmount",e.target.value)}/></Field>
            <Field label="Balance Amount"><Input readOnly value={remaining}/></Field>
          </div></div>
          {showPayment&&<div className={tw.formCard}><h3 className={tw.formCardH3}>4. Payment Information</h3><div className={tw.formGridThree}>
            {form.currency==="INR"&&<><Field label="Payment Mode" required><Select value={form.paymentMode} onChange={(e)=>set("paymentMode",e.target.value)}><option>Bank Transfer</option><option>UPI</option><option>Cheque</option><option>Cash</option></Select></Field><Field label="UTR / Transaction ID" required><Input value={form.transactionId} onChange={(e)=>set("transactionId",e.target.value)}/></Field><Field label="Transaction Date" required><Input type="date" value={form.transactionDate} onChange={(e)=>set("transactionDate",e.target.value)}/></Field></>}
            <Field label="Payment Screenshot / Proof" required className="full"><label className={tw.fileDrop}><div><Upload size={17}/><div>{file?file.name:`Upload ${form.currency} payment screenshot · JPG, PNG or PDF · max 5MB`}</div><input hidden type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e)=>setFile(e.target.files?.[0]||null)}/></div></label></Field>
          </div></div>}
          <div className={tw.formCard}><h3 className={tw.formCardH3}>{showPayment?"5":"4"}. Remarks & Notes</h3><Field label="Remarks"><Textarea value={form.remarks} onChange={(e)=>set("remarks",e.target.value)}/></Field><div className={tw.formActions}><Button type="button" kind="secondary" onClick={()=>{setForm(initial);setFile(null);}}>Reset</Button><Button type="submit" icon={Save} disabled={busy}>{busy?"Saving…":"Save Publication Service"}</Button></div></div>
        </form>
        <aside className={tw.sideInfo}><div className={tw.infoCard.purple}><h4 className={tw.infoCardH4}>Publication Summary</h4><div className={tw.summaryList}><div className={tw.summaryLine}><span className={tw.summaryLineSpan}>Journal</span><strong className={tw.summaryLineStrong}>{catalog.journals.find((j)=>j._id===form.journal)?.name||"—"}</strong></div><div className={tw.summaryLine}><span className={tw.summaryLineSpan}>Issue / Volume</span><strong className={tw.summaryLineStrong}>{form.issueVolume||"—"}</strong></div><div className={tw.summaryLine}><span className={tw.summaryLineSpan}>Vendor</span><strong className={tw.summaryLineStrong}>{vendor?.vendorName||"—"}</strong></div><div className={tw.summaryLine}><span className={tw.summaryLineSpan}>Total</span><strong className={tw.summaryLineStrong}>{amount(form.totalAmount,form.currency)}</strong></div><div className={tw.summaryLine}><span className={tw.summaryLineSpan}>Advance</span><strong className={tw.summaryLineStrong}>{amount(form.advanceAmount,form.currency)}</strong></div><div className={tw.summaryLine}><span className={tw.summaryLineSpan}>Balance</span><strong className={tw.summaryTotal}>{amount(remaining,form.currency)}</strong></div></div></div>
          <div className={tw.infoCard.blue}><div className={tw.infoRow}><div className={tw.infoIcon}><Info/></div><div><b className={tw.infoRowB}>Conditional Payment Section</b><p className={tw.infoRowP}>{showPayment?form.currency==="INR"?"INR advance entered: transaction details and proof are required.":"USD advance entered: only payment proof is required.":"Advance is zero, so payment information is hidden and no Finance verification record will be created."}</p></div></div></div>
        </aside>
      </div>
      <Toast toast={toast} onClose={()=>setToast(null)}/>
    </>
  );
}

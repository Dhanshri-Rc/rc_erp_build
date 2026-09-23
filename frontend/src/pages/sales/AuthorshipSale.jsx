import { useEffect, useMemo, useState } from "react";
import { Info, Save } from "lucide-react";
import { api } from "../../services/api";
import { Button, Field, Input, Select, Textarea, Toast } from "../../components/UI";
import * as tw from "../../styles/tw";

export default function AuthorshipSale() {
  const [catalog,setCatalog] = useState({journals:[],articles:[],vendors:[]});
  const [form,setForm] = useState({journal:"",article:"",vendor:"",positions:[],remarks:""});
  const [toast,setToast] = useState(null);
  const [busy,setBusy] = useState(false);
  const selectedArticle = useMemo(()=>catalog.articles.find((a)=>a._id===form.article),[catalog.articles,form.article]);
  const vendor = catalog.vendors.find((v)=>v._id===form.vendor);
  const set=(key,value)=>setForm((x)=>({...x,[key]:value}));

  useEffect(()=>{
    Promise.all([api.get("/catalog/journals"),api.get("/vendors/options")])
      .then(([j,v])=>setCatalog((x)=>({...x,journals:j.data.data,vendors:v.data.data})))
      .catch((error)=>setToast({type:"error",message:error.message}));
  },[]);

  const loadArticles=(journalId,keepArticle=false)=> {
    if(!journalId){setCatalog((x)=>({...x,articles:[]}));return Promise.resolve();}
    return api.get("/catalog/articles",{params:{journal:journalId}}).then((r)=>{
      setCatalog((x)=>({...x,articles:r.data.data}));
      if(!keepArticle)setForm((x)=>({...x,article:"",positions:[]}));
    });
  };

  const choosePosition=(position)=>{
    if(selectedArticle?.bookingsByPosition?.[position])return;
    setForm((x)=>{
      const exists=x.positions.some((p)=>p.position===position);
      return {...x,positions:exists?x.positions.filter((p)=>p.position!==position):[...x.positions,{position,authorName:"",department:"",college:""}].sort((a,b)=>a.position-b.position)};
    });
  };
  const updatePosition=(position,key,value)=>setForm((x)=>({...x,positions:x.positions.map((p)=>p.position===position?{...p,[key]:value}:p)}));
  const submit=async(e)=>{
    e.preventDefault();setBusy(true);
    try{
      await api.post("/sales/authorship",form);
      await loadArticles(form.journal,true);
      setForm((x)=>({...x,article:"",vendor:"",positions:[],remarks:""}));
      setToast({type:"success",message:"Authorship positions booked successfully"});
    }catch(error){setToast({type:"error",message:error.message});}
    finally{setBusy(false);}
  };
  return (
    <>
      <div className={tw.pageHead}><div><h1 className={tw.pageTitleH1}>New Authorship Sale</h1><p className={tw.pageTitleP}>Select an admin-added journal and article, then book exact available author positions.</p></div></div>
      <div className={tw.formLayout}>
        <form onSubmit={submit}>
          <div className={tw.formCard}><h3 className={tw.formCardH3}>1. Select Journal</h3><div className={tw.formGrid}><Field label="Journal Title" required className="full"><Select value={form.journal} onChange={(e)=>{set("journal",e.target.value);loadArticles(e.target.value);}}><option value="">Select journal</option>{catalog.journals.map((j)=><option key={j._id} value={j._id}>{j.name} · {j.issn}</option>)}</Select></Field></div></div>
          <div className={tw.formCard}><h3 className={tw.formCardH3}>2. Select Article & Available POS</h3><div className={tw.formGrid}>
            <Field label="Article" required><Select value={form.article} onChange={(e)=>setForm((x)=>({...x,article:e.target.value,positions:[]}))} disabled={!form.journal}><option value="">Select article</option>{catalog.articles.map((a)=><option key={a._id} value={a._id}>{a.title} ({a.availablePOS} available)</option>)}</Select></Field>
            <Field label="Available POS" help={selectedArticle?`Configured position range: 1–${selectedArticle.totalPOS}`:"Select an article first"}>
              <Select value="" disabled={!selectedArticle} onChange={(e)=>{const position=Number(e.target.value);if(position&&!form.positions.some((p)=>p.position===position))choosePosition(position);}}>
                <option value="">Select a position</option>
                {selectedArticle&&Array.from({length:selectedArticle.totalPOS},(_,i)=>i+1).map((position)=>{const booking=selectedArticle.bookingsByPosition?.[position];const chosen=form.positions.some((p)=>p.position===position);return <option key={position} value={position} disabled={Boolean(booking)||chosen}>{booking?`POS ${position} — Booked: ${booking.authorName} · ${booking.department||booking.college||"Affiliation not added"}`:chosen?`POS ${position} — Selected`:`POS ${position} — Available`}</option>;})}
              </Select>
            </Field>
          </div>
          {selectedArticle&&<><div className={tw.subtext}>Choose one or more available positions. Booked positions show the author name and department/college.</div><div className={tw.positionGrid}>{Array.from({length:selectedArticle.totalPOS},(_,i)=>i+1).map((position)=>{const booking=selectedArticle.bookingsByPosition?.[position];const selected=form.positions.some((p)=>p.position===position);return <button type="button" key={position} disabled={Boolean(booking)} onClick={()=>choosePosition(position)} className={booking?tw.positionBooked:`${tw.positionAvailable} ${selected?tw.positionSelected:""}`}><b className="text-[11px]">POS {position}</b><div className="text-[10px] mt-1">{booking?<><strong>{booking.authorName}</strong><br/>{[booking.department,booking.college].filter(Boolean).join(" · ")||"Already booked"}</>:selected?"Selected":"Available"}</div></button>;})}</div></>}
          </div>
          <div className={tw.formCard}><h3 className={tw.formCardH3}>3. Vendor Details</h3><div className={tw.formGrid}>
            <Field label="Select Vendor" required><Select value={form.vendor} onChange={(e)=>set("vendor",e.target.value)}><option value="">Select assigned vendor</option>{catalog.vendors.map((v)=><option key={v._id} value={v._id}>{v.vendorName}</option>)}</Select></Field>
            <Field label="Contact Person"><Input readOnly value={vendor?.contactPerson||""}/></Field>
          </div></div>
          <div className={tw.formCard}><h3 className={tw.formCardH3}>4. Author Details by Position</h3>
            {!form.positions.length?<div className={tw.empty}>Select at least one available position above.</div>:form.positions.map((p)=><div key={p.position} className="mb-3 rounded-[8px] border border-[#eceef5] p-3"><div className="text-[11px] font-bold text-[#6b48e8] mb-2">Position {p.position}</div><div className={tw.formGridThree}><Field label="Author Name" required><Input required value={p.authorName} onChange={(e)=>updatePosition(p.position,"authorName",e.target.value)}/></Field><Field label="Department"><Input value={p.department} onChange={(e)=>updatePosition(p.position,"department",e.target.value)}/></Field><Field label="College / Institution"><Input value={p.college} onChange={(e)=>updatePosition(p.position,"college",e.target.value)}/></Field></div></div>)}
          </div>
          <div className={tw.formCard}><h3 className={tw.formCardH3}>5. Remarks</h3><Field label="Remarks / Notes"><Textarea value={form.remarks} onChange={(e)=>set("remarks",e.target.value)}/></Field><div className={tw.formActions}><Button type="button" kind="secondary" onClick={()=>setForm((x)=>({...x,article:"",vendor:"",positions:[],remarks:""}))}>Reset</Button><Button type="submit" icon={Save} disabled={busy||!form.positions.length}>{busy?"Booking…":"Book Selected Positions"}</Button></div></div>
        </form>
        <aside className={tw.sideInfo}>
          <div className={tw.infoCard.purple}><h4 className={tw.infoCardH4}>Booking Summary</h4><div className={tw.summaryList}><div className={tw.summaryLine}><span className={tw.summaryLineSpan}>Journal</span><strong className={tw.summaryLineStrong}>{catalog.journals.find((j)=>j._id===form.journal)?.name||"—"}</strong></div><div className={tw.summaryLine}><span className={tw.summaryLineSpan}>Article</span><strong className={tw.summaryLineStrong}>{selectedArticle?.title||"—"}</strong></div><div className={tw.summaryLine}><span className={tw.summaryLineSpan}>Available POS</span><strong className={tw.summaryLineStrong}>{selectedArticle?.availablePOS??"—"}</strong></div><div className={tw.summaryLine}><span className={tw.summaryLineSpan}>Selected POS</span><strong className={tw.summaryTotal}>{form.positions.map((p)=>p.position).join(", ")||"—"}</strong></div></div></div>
          <div className={tw.infoCard.blue}><div className={tw.infoRow}><div className={tw.infoIcon}><Info/></div><div><b className={tw.infoRowB}>Duplicate Booking Protection</b><p className={tw.infoRowP}>The backend checks positions again while saving. A position already booked by another user cannot be sold twice.</p></div></div></div>
        </aside>
      </div>
      <Toast toast={toast} onClose={()=>setToast(null)}/>
    </>
  );
}

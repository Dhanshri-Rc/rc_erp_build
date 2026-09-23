import { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { api } from "../../services/api";
import { Button, Field, Input, Select, Toast } from "../../components/UI";
import * as tw from "../../styles/tw";

export default function AuthorshipInventory() {
  const [journals,setJournals] = useState([]);
  const [articles,setArticles] = useState([]);
  const [journal,setJournal] = useState("");
  const [articleId,setArticleId] = useState("");
  const [totalPOS,setTotalPOS] = useState("");
  const [toast,setToast] = useState(null);
  const [busy,setBusy] = useState(false);
  const article = useMemo(()=>articles.find((x)=>x._id===articleId),[articles,articleId]);
  useEffect(()=>{api.get("/catalog/journals").then((r)=>setJournals(r.data.data));},[]);
  const loadArticles = (journalId) => {
    setJournal(journalId); setArticleId(""); setTotalPOS("");
    if (!journalId) return setArticles([]);
    api.get("/catalog/articles",{params:{journal:journalId,all:true}}).then((r)=>setArticles(r.data.data));
  };
  useEffect(()=>{ if(article) setTotalPOS(article.totalPOS); },[articleId]);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const r=await api.patch(`/catalog/articles/${articleId}/positions`,{totalPOS:Number(totalPOS)});
      setArticles((xs)=>xs.map((x)=>x._id===articleId?r.data.data:x));
      setToast({type:"success",message:"Authorship position range updated"});
    } catch(error){setToast({type:"error",message:error.message});}
    finally{setBusy(false);}
  };
  return (
    <>
      <div className={tw.pageHead}><div><h1 className={tw.pageTitleH1}>Authorship Position Setup</h1><p className={tw.pageTitleP}>Select a journal and article, then control its total position range.</p></div></div>
      <form className={tw.formCard} onSubmit={submit}>
        <h3 className={tw.formCardH3}>Authorship Form</h3>
        <div className={tw.formGridThree}>
          <Field label="Select Journal Title" required><Select value={journal} onChange={(e)=>loadArticles(e.target.value)}><option value="">Select journal</option>{journals.map((j)=><option key={j._id} value={j._id}>{j.name}</option>)}</Select></Field>
          <Field label="Select Article" required><Select value={articleId} onChange={(e)=>setArticleId(e.target.value)} disabled={!journal}><option value="">Select article</option>{articles.map((a)=><option key={a._id} value={a._id}>{a.title}</option>)}</Select></Field>
          <Field label="Total No. of Positions" required help="Example: 6 creates POS 1–6; 8 creates POS 1–8."><Input type="number" min="1" max="100" value={totalPOS} onChange={(e)=>setTotalPOS(e.target.value)} disabled={!articleId} /></Field>
        </div>
        <div className={tw.formActions}><Button type="submit" icon={Save} disabled={busy||!articleId}>{busy?"Saving…":"Save Position Range"}</Button></div>
      </form>
      {article && <div className={tw.formCard}><h3 className={tw.formCardH3}>Current Position Status · {article.title}</h3><div className={tw.subtext}>{article.availablePOS} of {article.totalPOS} positions are available. A booked position shows the author and affiliation and cannot be selected by Sales.</div>
        <div className={tw.positionGrid}>{Array.from({length:article.totalPOS},(_,i)=>i+1).map((pos)=>{const b=article.bookingsByPosition?.[pos];return <div key={pos} className={b?tw.positionBooked:tw.positionAvailable}><b className="text-[11px]">POS {pos}</b><div className="text-[10px] mt-1">{b?<><strong>{b.authorName}</strong><br/>{[b.department,b.college].filter(Boolean).join(" · ")||"Booked"}</>:"Available"}</div></div>;})}</div>
      </div>}
      <Toast toast={toast} onClose={()=>setToast(null)} />
    </>
  );
}

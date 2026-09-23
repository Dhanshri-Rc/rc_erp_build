import { useEffect, useState } from "react";
import {
  CalendarClock,
  CircleCheckBig,
  CircleX,
  Download,
  Plus,
  Store,
} from "lucide-react";
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
  StatCard,
  Textarea,
  Toast,
  dateFmt,
} from "../../components/UI";
import * as tw from "../../styles/tw";

export default function AdminVendors({ byEmployee = false }) {
  const [items, setItems] = useState([]),
    [meta, setMeta] = useState(null),
    [q, setQ] = useState(""),
    [status, setStatus] = useState(""),
    [employee, setEmployee] = useState(""),
    [users, setUsers] = useState([]),
    [page, setPage] = useState(1),
    [selected, setSelected] = useState(null),
    [editing, setEditing] = useState(null),
    [removing, setRemoving] = useState(null),
    [toast, setToast] = useState(null),
    [busy, setBusy] = useState(false);
  const load = () =>
    api
      .get("/vendors", {
        params: {
          page,
          limit: 10,
          search: q,
          status,
          employee: byEmployee ? employee : "",
        },
      })
      .then((r) => {
        setItems(r.data.data.items);
        setMeta(r.data.data.pagination);
      });
  useEffect(() => {
    load();
  }, [page, status, employee]);
  useEffect(() => {
    api
      .get("/users", { params: { role: "sales", limit: 100 } })
      .then((r) => setUsers(r.data.data.items));
  }, []);
  const active = items.filter((x) => x.status === "active").length,
    inactive = items.filter((x) => x.status === "inactive").length;
  const saveEdit=async(e)=>{e.preventDefault();setBusy(true);try{await api.put(`/vendors/${editing._id}`,{...editing,assignedTo:editing.assignedTo?._id||editing.assignedTo,creditLimit:Number(editing.creditLimit||0)});setEditing(null);await load();setToast({type:"success",message:"Vendor updated successfully"});}catch(error){setToast({type:"error",message:error.message});}finally{setBusy(false);}};
  const remove=async()=>{setBusy(true);try{await api.delete(`/vendors/${removing._id}`);setRemoving(null);await load();setToast({type:"success",message:"Vendor deleted successfully"});}catch(error){setToast({type:"error",message:error.message});}finally{setBusy(false);}};
  return (
    <>
      <div className={tw.pageHead}>
        <div>
          <h1 className={tw.pageTitleH1}>
            {byEmployee ? "Vendors by Employee" : "All Vendors"}
          </h1>
          <p className={tw.pageTitleP}>
            {byEmployee
              ? "View and manage vendors assigned to individual employees"
              : "View and manage all vendors across RC ERP"}
          </p>
        </div>
        <div className={tw.headActions}>
          <Link to="/admin/vendors/create"><Button icon={Plus}>Add Vendor</Button></Link>
          <Button
            kind="secondary"
            icon={Download}
            onClick={() => window.open(`${api.defaults.baseURL}/reports/vendors`, "_blank")}
          >
            Export Report
          </Button>
        </div>
      </div>
      {byEmployee && (
        <div className={tw.toolbar}>
          <select
            className={tw.compactSelect}
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
          >
            <option value="">All Marketing Employees</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.fullName}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className={tw.summaryStrip}>
        <StatCard label="Total Vendors" value={meta?.total || 0} icon={Store} />
        <StatCard
          label="Active Vendors"
          value={active}
          icon={CircleCheckBig}
          tone="green"
        />
        <StatCard
          label="Inactive Vendors"
          value={inactive}
          icon={CircleX}
          tone="red"
        />
        <StatCard
          label="Employees Shown"
          value={byEmployee ? (employee ? 1 : users.length) : users.length}
          icon={Store}
          tone="cyan"
        />
        <StatCard
          label="Last Updated"
          value={new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          })}
          icon={CalendarClock}
          tone="blue"
        />
      </div>
      <div className={tw.toolbar}>
        <SearchBox
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search vendor by name, email or contact"
        />
        <select
          className={tw.compactSelect}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
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
                <th className={tw.th}>#</th>
                <th className={tw.th}>Vendor Name</th>
                <th className={tw.th}>Vendor Type</th>
                <th className={tw.th}>Contact Person</th>
                <th className={tw.th}>Email</th>
                <th className={tw.th}>Contact Number</th>
                <th className={tw.th}>Status</th>
                <th className={tw.th}>Added On</th>
                <th className={tw.th}>Added By</th>
                <th className={tw.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((v, i) => (
                <tr key={v._id} className={tw.tr}>
                  <td className={tw.td}>{(meta?.page - 1) * meta?.limit + i + 1}</td>
                  <td className={tw.td}>
                    <strong className={tw.tdStrong}>{v.vendorName}</strong>
                  </td>
                  <td className={tw.td}>{v.businessType}</td>
                  <td className={tw.td}>{v.contactPerson || "—"}</td>
                  <td className={tw.td}>{v.email}</td>
                  <td className={tw.td}>{v.mobile}</td>
                  <td className={tw.td}>
                    <Badge>{v.status}</Badge>
                  </td>
                  <td className={tw.td}>{dateFmt(v.createdAt)}</td>
                  <td className={tw.td}>{v.assignedTo?.fullName || "—"}</td>
                  <td className={tw.td}>
                    <RecordActions onView={()=>setSelected(v)} onEdit={()=>setEditing({...v,assignedTo:v.assignedTo?._id||v.assignedTo})} onDelete={()=>setRemoving(v)}/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={meta} onPage={setPage} />
      </div>
      {selected && (
        <Modal title="Vendor Details" onClose={() => setSelected(null)} wide>
          <div className={tw.detailGrid}>
            {[
              ["Vendor Name", selected.vendorName],
              ["Business Type", selected.businessType],
              ["Category", selected.vendorCategory || "—"],
              ["Assigned Sales User", selected.assignedTo?.fullName || "—"],
              ["Contact Person", selected.contactPerson || "—"],
              ["Designation", selected.designation || "—"],
              ["Email", selected.email],
              ["Mobile", selected.mobile],
              ["Address", [selected.address, selected.city, selected.state, selected.country, selected.postalCode].filter(Boolean).join(", ")],
              ["Website", selected.website || "—"],
              ["Payment Terms", selected.paymentTerms || "—"],
              ["Status", selected.status],
              ["Added On", dateFmt(selected.createdAt)],
              ["Notes", selected.notes || "—"],
            ].map(([label,value]) => (
              <div className={tw.detailItem} key={label}>
                <span className={tw.detailLabel}>{label}</span>
                <div className={tw.detailValue}>{value}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}
      {editing&&<Modal title="Edit Vendor" onClose={()=>setEditing(null)} wide><form onSubmit={saveEdit}><div className={tw.formGridThree}>
        <Field label="Vendor Name" required><Input value={editing.vendorName||""} onChange={(e)=>setEditing({...editing,vendorName:e.target.value})}/></Field>
        <Field label="Business Type" required><Select value={editing.businessType||"Supplier"} onChange={(e)=>setEditing({...editing,businessType:e.target.value})}><option>Supplier</option><option>Service Provider</option><option>Publisher</option><option>Others</option></Select></Field>
        <Field label="Assigned Sales User" required><Select value={editing.assignedTo||""} onChange={(e)=>setEditing({...editing,assignedTo:e.target.value})}>{users.filter((u)=>u.status==="active").map((u)=><option key={u._id} value={u._id}>{u.fullName}</option>)}</Select></Field>
        <Field label="Address" required className="full"><Textarea value={editing.address||""} onChange={(e)=>setEditing({...editing,address:e.target.value})}/></Field>
        <Field label="City" required><Input value={editing.city||""} onChange={(e)=>setEditing({...editing,city:e.target.value})}/></Field>
        <Field label="State" required><Input value={editing.state||""} onChange={(e)=>setEditing({...editing,state:e.target.value})}/></Field>
        <Field label="Country" required><Input value={editing.country||""} onChange={(e)=>setEditing({...editing,country:e.target.value})}/></Field>
        <Field label="Postal Code" required><Input value={editing.postalCode||""} onChange={(e)=>setEditing({...editing,postalCode:e.target.value})}/></Field>
        <Field label="Contact Person"><Input value={editing.contactPerson||""} onChange={(e)=>setEditing({...editing,contactPerson:e.target.value})}/></Field>
        <Field label="Email" required><Input type="email" value={editing.email||""} onChange={(e)=>setEditing({...editing,email:e.target.value})}/></Field>
        <Field label="Mobile" required><Input value={editing.mobile||""} onChange={(e)=>setEditing({...editing,mobile:e.target.value})}/></Field>
        <Field label="Status"><Select value={editing.status||"active"} onChange={(e)=>setEditing({...editing,status:e.target.value})}><option value="active">Active</option><option value="inactive">Inactive</option></Select></Field>
        <Field label="Notes" className="full"><Textarea value={editing.notes||""} onChange={(e)=>setEditing({...editing,notes:e.target.value})}/></Field>
      </div><div className={tw.formActions}><Button kind="secondary" onClick={()=>setEditing(null)}>Cancel</Button><Button type="submit" disabled={busy}>{busy?"Saving…":"Save Changes"}</Button></div></form></Modal>}
      {removing&&<ConfirmDialog title="Delete vendor?" message={`Delete “${removing.vendorName}”? Vendors linked to sales or payments must be made inactive instead.`} onClose={()=>setRemoving(null)} onConfirm={remove} busy={busy}/>} 
      <Toast toast={toast} onClose={()=>setToast(null)}/>
    </>
  );
}

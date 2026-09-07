import { BarChart3, CheckCircle2, Download, Settings2 } from "lucide-react";
import { Button, StatCard } from "../../components/UI";
export default function Placeholder({
  title = "Module",
  description = "This module uses the same RC ERP role-protected workspace.",
}) {
  return (
    <>
      <div className="page-head">
        <div className="page-title">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
      <div className="stats-grid">
        <StatCard
          label="Module Status"
          value="Active"
          note="Role protected"
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          label="Data Source"
          value="Backend"
          note="MongoDB / API"
          icon={BarChart3}
        />
        <StatCard
          label="Access"
          value="Secured"
          note="JWT + role rules"
          icon={Settings2}
          tone="cyan"
        />
      </div>
      <div className="panel panel-pad">
        <h3 style={{ fontSize: 11 }}>RC ERP {title}</h3>
        <p className="muted small" style={{ lineHeight: 1.7 }}>
          This workspace is included in the navigation and protected by the same
          authenticated role layout. Core operational data entry and
          verification workflows are implemented in the dedicated Vendor,
          Authorship, Publication, Lead, Payment, Receipt and Dashboard modules.
        </p>
      </div>
    </>
  );
}

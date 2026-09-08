import { BarChart3, CheckCircle2, Download, Settings2 } from "lucide-react";
import { Button, StatCard } from "../../components/UI";
import * as tw from "../../styles/tw";

export default function Placeholder({
  title = "Module",
  description = "This module uses the same RC ERP role-protected workspace.",
}) {
  return (
    <>
      <div className={tw.pageHead}>
        <div>
          <h1 className={tw.pageTitleH1}>{title}</h1>
          <p className={tw.pageTitleP}>{description}</p>
        </div>
      </div>
      <div className={tw.statsGrid}>
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
      <div className={`${tw.panel} ${tw.panelPad}`}>
        <h3 className="text-[11px] m-0 mb-2 font-semibold">RC ERP {title}</h3>
        <p className={`${tw.text.muted} ${tw.text.small} leading-[1.7]`}>
          This workspace is included in the navigation and protected by the same
          authenticated role layout. Core operational data entry and
          verification workflows are implemented in the dedicated Vendor,
          Authorship, Publication, Lead, Payment, Receipt and Dashboard modules.
        </p>
      </div>
    </>
  );
}

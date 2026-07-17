import Layout from "../components/layout/Layout";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import ProgressSteps from "../components/ui/ProgressSteps";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";
import StatusCard from "../components/StatusCard";

function Dashboard(){
    const navigate = useNavigate();

return (
<Layout>
<div className="page-transition">

<SectionHeader
eyebrow="Workspace"
title="Welcome to DigiStamp"
description="Create, secure, download, and verify digital agreements from a single professional workspace."
actions={
<>
<Button onClick={() => navigate("/create-deal")}>
Create Deal
</Button>
<Button onClick={()=>navigate("/verify")} variant="secondary">
Verify Agreement
</Button>
</>
}
>
<div className="mt-4 flex flex-wrap gap-2">
<StatusBadge variant="success">Firebase secured</StatusBadge>
<StatusBadge variant="primary">SHA-256 enabled</StatusBadge>
<StatusBadge variant="warning">Identity check recommended</StatusBadge>
</div>
</SectionHeader>

<div className="grid gap-4 md:grid-cols-3">
<StatusCard label="Agreements" value="0" description="Created in this workspace" />
<StatusCard label="Verification" value="Ready" description="Identity and document checks" tone="emerald" />
<StatusCard label="Security" value="SHA-256" description="Document hash protection" tone="amber" />
</div>

<div className="mt-8">
<ProgressSteps
current={1}
steps={["Login", "Identity", "Deal", "Agreement"]}
/>
</div>

<div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
<Card className="p-6">
<div className="mb-5 flex items-center justify-between gap-4">
<div>
<h2 className="text-xl font-bold text-slate-950">
My Agreements
</h2>
<p className="mt-1 text-sm text-slate-500">
Saved agreements will appear here after generation and storage.
</p>
</div>
<StatusBadge>Empty</StatusBadge>
</div>

<EmptyState
title="No agreements created yet"
description="Start by creating a deal, generate the AI agreement, save it securely, then download the PDF."
action={<Button onClick={() => navigate("/create-deal")}>Create First Deal</Button>}
/>
</Card>

<Card className="p-6">
<h2 className="text-xl font-bold text-slate-950">
Recommended next step
</h2>
<p className="mt-2 text-sm leading-6 text-slate-500">
Complete identity verification before creating production agreements.
</p>
<Button
onClick={()=>navigate("/profile")}
variant="secondary"
className="mt-5 w-full"
>
Complete Verification
</Button>
</Card>
</div>
</div>
</Layout>

)

}


export default Dashboard;

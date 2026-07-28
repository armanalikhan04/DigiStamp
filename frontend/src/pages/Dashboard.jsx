import Layout from "../components/layout/Layout";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import ProgressSteps from "../components/ui/ProgressSteps";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";
import StatusCard from "../components/StatusCard";
import { AGREEMENT_STATUS, PARTY_STATUS } from "../constants/status";
import { useAgreements } from "../hooks/useAgreements";
import {
getAgreementStatusLabel,
getAgreementStatusVariant,
} from "../utils/agreement";

function Dashboard(){
    const navigate = useNavigate();
    const { agreements, loading, error } = useAgreements();
    const createdAgreements = agreements.length;
    const pendingInvitations = agreements.filter(
      (agreement) => agreement.partyBStatus === PARTY_STATUS.PENDING,
    ).length;
    const waitingForPartyB = agreements.filter(
      (agreement) => agreement.agreementStatus === AGREEMENT_STATUS.WAITING_FOR_PARTY_B,
    ).length;
    const rejectedAgreements = agreements.filter(
      (agreement) => agreement.agreementStatus === AGREEMENT_STATUS.REJECTED,
    ).length;
    const completedAgreements = agreements.filter(
      (agreement) =>
        agreement.agreementStatus === AGREEMENT_STATUS.COMPLETED ||
        agreement.agreementStatus === AGREEMENT_STATUS.LEGACY_COMPLETED,
    ).length;

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

<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
<StatusCard label="Created Agreements" value={loading ? "..." : createdAgreements} description="Created in this workspace" />
<StatusCard label="Pending Invitations" value={loading ? "..." : pendingInvitations} description="Awaiting Party B action" tone="amber" />
<StatusCard label="Waiting For Party B" value={loading ? "..." : waitingForPartyB} description="Party A signed and shared" tone="amber" />
<StatusCard label="Rejected Agreements" value={loading ? "..." : rejectedAgreements} description="Rejected by Party B" tone="red" />
<StatusCard label="Completed Agreements" value={loading ? "..." : completedAgreements} description="Both parties signed" tone="emerald" />
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
<StatusBadge>{loading ? "Loading" : `${agreements.length} total`}</StatusBadge>
</div>

{error && (
<div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
{error}
</div>
)}

{!loading && agreements.length === 0 && (
<EmptyState
title="No agreements created yet"
description="Start by creating a deal, generate the AI agreement, save it securely, then download the PDF."
action={<Button onClick={() => navigate("/create-deal")}>Create First Deal</Button>}
/>
)}

{agreements.length > 0 && (
<div className="space-y-4">
{agreements.slice(0, 6).map((agreement) => (
<div key={agreement.id || agreement.agreementId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
<div>
<p className="break-words text-sm font-bold text-slate-950">
{agreement.agreementId}
</p>
<p className="mt-1 text-sm text-slate-600">
{agreement.partyA || "Party A"} → {agreement.partyB || "Party B"}
</p>
</div>
<div className="flex flex-wrap gap-2">
<StatusBadge variant={getAgreementStatusVariant(agreement.agreementStatus)}>
{getAgreementStatusLabel(agreement.agreementStatus)}
</StatusBadge>
<StatusBadge variant={agreement.partyAStatus === PARTY_STATUS.SIGNED ? "success" : "warning"}>
{agreement.partyAStatus === PARTY_STATUS.SIGNED ? "Signed by Party A" : "Party A Pending"}
</StatusBadge>
<StatusBadge variant={agreement.partyBStatus === PARTY_STATUS.SIGNED ? "success" : "warning"}>
{agreement.partyBStatus === PARTY_STATUS.SIGNED ? "Signed by Party B" : `Party B ${agreement.partyBStatus || PARTY_STATUS.PENDING}`}
</StatusBadge>
</div>
</div>
<div className="mt-4 flex flex-wrap gap-3">
<Button
onClick={() => navigate(`/agreement/${agreement.agreementId}`)}
variant="secondary"
>
Open Agreement
</Button>
{agreement.certificateId && (
<Button onClick={() => navigate(`/certificate/${agreement.certificateId}`)}>
View Certificate
</Button>
)}
</div>
</div>
))}
</div>
)}
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

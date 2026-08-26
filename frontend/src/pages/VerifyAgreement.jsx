import { useState } from "react";

import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import InputField from "../components/ui/InputField";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";
import { AGREEMENT_STATUS, PARTY_STATUS } from "../constants/status";
import { getAgreementById } from "../services/agreementService";
import { generateHash } from "../services/security";
import {
buildSignedAgreementDocumentFromAgreement,
getAgreementStatusLabel,
} from "../utils/agreement";
import { getAgreementSha256 } from "../utils/certificate";


function VerifyAgreement(){


const [id,setId] = useState("");

const [agreement,setAgreement] = useState(null);
const [result,setResult] = useState(null);
const [loading,setLoading] = useState(false);
const [message,setMessage] = useState("");


const verify = async()=>{

if (!id.trim()) {
setAgreement(null);
setResult(null);
setMessage("Enter an agreement ID to verify.");
return;
}

try {
setLoading(true);
setAgreement(null);
setResult(null);
setMessage("");

const agreementData = await getAgreementById(id.trim());

if(!agreementData){

setMessage("Agreement not found.");
setResult("not-found");
return;

}

const isCompleted =
agreementData.agreementStatus === AGREEMENT_STATUS.COMPLETED ||
agreementData.agreementStatus === AGREEMENT_STATUS.LEGACY_COMPLETED;
const hasRequiredSignatures =
agreementData.partyAStatus === PARTY_STATUS.SIGNED &&
agreementData.partyBStatus === PARTY_STATUS.SIGNED &&
agreementData.signatures?.partyA?.value &&
agreementData.signatures?.partyB?.value;
const persistedHash = getAgreementSha256(agreementData);

if (!isCompleted || !hasRequiredSignatures || !persistedHash) {

setAgreement(agreementData);
setMessage("Agreement exists but is not a completed signed record.");
setResult("tampered");
return;

}

const recomputedHash = generateHash(
buildSignedAgreementDocumentFromAgreement({
agreement: agreementData,
})
);

setAgreement({
...agreementData,
recomputedHash,
});

if (recomputedHash === persistedHash) {
setMessage("Agreement hash matches the completed signed document.");
setResult("verified");
return;

}

setMessage("Agreement hash does not match the completed signed document.");
setResult("tampered");
} catch {
setAgreement(null);
setMessage("Unable to verify agreement due to a permission or connectivity error.");
setResult("error");
} finally {
setLoading(false);
}

};

const statusVariant =
result === "verified" ? "success" : result === "tampered" ? "danger" : "warning";
const statusLabel =
result === "verified"
? "Verified"
: result === "tampered"
? "Tampered"
: result === "not-found"
? "Not Found"
: result === "error"
? "Connectivity Error"
: "Ready";



return(

<Layout>
<div className="page-transition">


<SectionHeader
eyebrow="Document Verification"
title="Verify agreement"
description="Enter a DigiStamp agreement ID to retrieve and validate the saved document record."
>
<div className="mt-4 flex flex-wrap gap-2">
<StatusBadge variant="primary">Firestore lookup</StatusBadge>
<StatusBadge variant="success">Hash visibility</StatusBadge>
</div>
</SectionHeader>


<Card className="max-w-3xl p-6">
<div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">

<InputField

label="Agreement ID"
placeholder="Enter Agreement ID"
value={id}

onChange={(e)=>setId(e.target.value)}

/>


<Button

onClick={verify}
disabled={loading}

className="sm:min-w-32"

>

{loading ? "Verifying..." : "Verify"}

</Button>
</div>
</Card>

{
message &&

<Card className="mt-6 max-w-4xl p-5">
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
<p className="text-sm font-semibold text-slate-700">
{message}
</p>
<StatusBadge variant={statusVariant}>{statusLabel}</StatusBadge>
</div>
</Card>

}



{

agreement &&


<Card className={`mt-8 max-w-4xl p-6 ${result === "verified" ? "border-emerald-100" : "border-red-100"}`}>


<div className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
<div>
<h2 className={`text-xl font-bold ${result === "verified" ? "text-emerald-700" : "text-red-700"}`}>

{result === "verified" ? "Verified DigiStamp Document" : "Agreement Needs Attention"}

</h2>
<p className="mt-1 text-sm text-slate-500">
{result === "verified"
? "The stored hash matches the completed signed agreement."
: "The agreement could not be verified as a completed signed record."}
</p>
</div>
<StatusBadge variant={statusVariant}>{statusLabel}</StatusBadge>
</div>

<div className="grid gap-4 md:grid-cols-2">
<div className="rounded-2xl bg-slate-50 p-4">
<p className="text-xs font-bold uppercase tracking-wide text-slate-500">Agreement ID</p>
<p className="mt-1 break-all text-sm font-semibold text-slate-900">
ID: {agreement.agreementId}
</p>
</div>

<div className="rounded-2xl bg-slate-50 p-4">
<p className="text-xs font-bold uppercase tracking-wide text-slate-500">Status</p>
<p className="mt-1 text-sm font-semibold text-slate-900">
{agreement.status}
</p>
</div>

<div className="rounded-2xl bg-slate-50 p-4">
<p className="text-xs font-bold uppercase tracking-wide text-slate-500">Agreement Status</p>
<p className="mt-1 text-sm font-semibold text-slate-900">
{getAgreementStatusLabel(agreement.agreementStatus)}
</p>
</div>

<div className="rounded-2xl bg-slate-50 p-4">
<p className="text-xs font-bold uppercase tracking-wide text-slate-500">Party A</p>
<p className="mt-1 text-sm font-semibold text-slate-900">
Party A: {agreement.partyA}
</p>
</div>

<div className="rounded-2xl bg-slate-50 p-4">
<p className="text-xs font-bold uppercase tracking-wide text-slate-500">Party B</p>
<p className="mt-1 text-sm font-semibold text-slate-900">
Party B: {agreement.partyB}
</p>
</div>
</div>

<div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
<p className="text-xs font-bold uppercase tracking-wide text-[#1E3A8A]">
SHA-256 Hash
</p>
<p className="mt-2 break-all text-sm leading-6 text-slate-700">


{agreement.securityHash}

</p>
</div>

{agreement.recomputedHash && (
<div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
<p className="text-xs font-bold uppercase tracking-wide text-slate-500">
Recomputed SHA-256
</p>
<p className="mt-2 break-all text-sm leading-6 text-slate-700">
{agreement.recomputedHash}
</p>
</div>
)}


</Card>


}


</div>
</Layout>

)


}


export default VerifyAgreement;

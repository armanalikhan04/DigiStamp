import { useState } from "react";

import { db } from "../services/firebase";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import InputField from "../components/ui/InputField";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";

import {
collection,
query,
where,
getDocs
} from "firebase/firestore";


function VerifyAgreement(){


const [id,setId] = useState("");

const [agreement,setAgreement] = useState(null);


const verify = async()=>{


const q = query(

collection(db,"agreements"),

where(
"agreementId",
"==",
id
)

);


const result = await getDocs(q);


if(result.empty){

alert("Invalid Agreement ❌");

setAgreement(null);

return;

}


result.forEach((doc)=>{

setAgreement(doc.data());

});


};



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

onChange={(e)=>setId(e.target.value)}

/>


<Button

onClick={verify}

className="sm:min-w-32"

>

Verify

</Button>
</div>
</Card>



{

agreement &&


<Card className="mt-8 max-w-4xl border-emerald-100 p-6">


<div className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
<div>
<h2 className="text-xl font-bold text-emerald-700">

Verified DigiStamp Document

</h2>
<p className="mt-1 text-sm text-slate-500">
This agreement ID exists in Firestore.
</p>
</div>
<StatusBadge variant="success">Verified</StatusBadge>
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


</Card>


}


</div>
</Layout>

)


}


export default VerifyAgreement;

import { generateHash } from "../services/security";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { useState } from "react";
import { createAgreement } from "../services/agreementService";
import { createCertificate } from "../services/certificateService";
import { generateAgreement } from "../services/gemini";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import InputField from "../components/ui/InputField";
import ProgressSteps from "../components/ui/ProgressSteps";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";
import {
  buildSignedAgreementDocument,
  generateAgreementId,
} from "../utils/agreement";
import {
  buildVerificationUrl,
  generateCertificateId,
} from "../utils/certificate";
import {
  formatSignedAt,
  getSignatureRecord,
} from "../utils/signature";

import { Timestamp } from "firebase/firestore";

const toFirestoreSignature = (signatureRecord) => {
  if (!signatureRecord?.signature) {
    return null;
  }

  return {
    method: signatureRecord.signature.method,
    value: signatureRecord.signature.value,
    signedAt: Timestamp.fromDate(new Date(signatureRecord.signedAt)),
  };
};

const renderSignaturePreview = (signatureRecord) => {
  if (!signatureRecord?.signature) {
    return (
      <p className="text-sm font-semibold text-slate-500">
        Signature not captured
      </p>
    );
  }

  const { method, value, fontFamily } = signatureRecord.signature;

  if (method === "type") {
    return (
      <p
        className="break-words text-3xl text-[#1E3A8A] sm:text-4xl"
        style={{ fontFamily }}
      >
        {value}
      </p>
    );
  }

  return (
    <img
      src={value}
      alt={`${signatureRecord.signerRole} signature preview`}
      className="max-h-28 max-w-full object-contain"
    />
  );
};


function CreateAgreement(){

        const location = useLocation();
        const navigate = useNavigate();

const deal = location.state;

const [form, setForm] = useState({

partyA: deal?.partyA || deal?.partyAName || "",

partyB: deal?.partyB || deal?.partyBName || "",

amount: deal?.amount || "",

terms: deal?.terms || deal?.description || ""

});

const [aiText,setAiText] = useState(deal?.aiText || "");
const isReviewed = Boolean(deal?.reviewed);
const isFinalReview = Boolean(deal?.signatures?.["Party A"] && deal?.signatures?.["Party B"]);
const partyASignature = getSignatureRecord(deal?.signatures, "Party A");
const partyBSignature = getSignatureRecord(deal?.signatures, "Party B");
const [isSaved,setIsSaved] = useState(false);
const [loading,setLoading] = useState(false);
const handleChange=(e)=>{

setForm({

...form,

[e.target.name]:e.target.value

});

};

   const handleGenerateAI = async()=>{

try{

setLoading(true);

const result = await generateAgreement(form);

setAiText(result);
setIsSaved(false);

navigate("/review-agreement", {
state: {
...deal,
partyA: form.partyA,
partyB: form.partyB,
amount: form.amount,
terms: form.terms,
aiText: result,
createdAt: new Date().toISOString(),
agreementStatus: "AI Generated"
}
});

}

catch(error){

alert("AI limit reached. Try again after some time.");

}

finally{

setLoading(false);

}

};

const saveAgreement = async()=>{

try{


const agreementId = generateAgreementId();
const signatures = {
partyA: toFirestoreSignature(partyASignature),
partyB: toFirestoreSignature(partyBSignature)
};
const finalSignedDocument = buildSignedAgreementDocument({
aiText,
form,
partyASignature,
partyBSignature
});
const securityHash = generateHash(
finalSignedDocument
);


await createAgreement({

agreementId: agreementId,

partyA: form.partyA,

partyB: form.partyB,

amount: form.amount,

userTerms: form.terms,

aiAgreement: aiText,

securityHash: securityHash,

status:"created",

securityStatus:"pending",

createdAt:new Date(),

signatures: signatures

});

const certificateId = generateCertificateId();
const issuedAt = new Date();
const verificationUrl = buildVerificationUrl(window.location.origin, certificateId);

await createCertificate(certificateId, {

certificateId: certificateId,

agreementId: agreementId,

partyA: form.partyA,

partyB: form.partyB,

agreementType: deal?.dealType || "Digital Agreement",

issuedAt: Timestamp.fromDate(issuedAt),

sha256: securityHash,

status:"Verified",

verificationUrl: verificationUrl

});

setIsSaved(true);
alert("Agreement Saved Successfully");
navigate(`/certificate/${certificateId}`);


}

catch(error){

alert(error.message);

}

};

const generatePDF = () => {


const doc = new jsPDF();


doc.setFontSize(20);


doc.text(
"DigiStamp Agreement",
20,
20
);


doc.setFontSize(12);


doc.text(
`Party A: ${form.partyA}`,
20,
40
);


doc.text(
`Party B: ${form.partyB}`,
20,
50
);


doc.text(
`Amount: ${form.amount}`,
20,
60
);



const agreementLines = doc.splitTextToSize(
aiText,
170
);


doc.text(
agreementLines,
20,
80
);

let signatureY = 90 + agreementLines.length * 7;

if (signatureY > 230) {
doc.addPage();
signatureY = 20;
}

doc.setFontSize(16);
doc.text(
"Digital Signatures",
20,
signatureY
);

const addSignatureToPDF = (label, signatureRecord, yPosition) => {
doc.setFontSize(12);
doc.text(
label,
20,
yPosition
);

if (signatureRecord?.signature?.method === "type") {
doc.setFontSize(18);
doc.text(
signatureRecord.signature.value,
20,
yPosition + 12
);
} else if (signatureRecord?.signature?.value) {
try {
const imageFormat = signatureRecord.signature.value.startsWith("data:image/jpeg")
? "JPEG"
: "PNG";
doc.addImage(
signatureRecord.signature.value,
imageFormat,
20,
yPosition + 6,
55,
22
);
} catch {
doc.text(
"Signature image attached",
20,
yPosition + 12
);
}
} else {
doc.text(
"Signature not captured",
20,
yPosition + 12
);
}

doc.setFontSize(10);
doc.text(
`Method: ${signatureRecord?.signature?.method || "Pending"}`,
20,
yPosition + 36
);
doc.text(
`Timestamp: ${formatSignedAt(signatureRecord?.signedAt)}`,
20,
yPosition + 44
);
};

addSignatureToPDF("Party A", partyASignature, signatureY + 14);
addSignatureToPDF("Party B", partyBSignature, signatureY + 72);

doc.save(
"DigiStamp_Agreement.pdf"
);


};

return(

<Layout>
<div className="page-transition">

<SectionHeader
eyebrow={isFinalReview ? "Final Review" : "AI Agreement"}
title={isFinalReview ? "Final review and save" : "Generate and review agreement"}
description={isFinalReview ? "Both parties have signed. Review the final agreement state before saving." : "Review deal details, generate an agreement draft, save it securely, and download the PDF."}
>
<div className="mt-4 flex flex-wrap gap-2">
<StatusBadge variant="primary">Gemini AI drafting</StatusBadge>
<StatusBadge variant="success">SHA-256 hash on save</StatusBadge>
{isFinalReview && <StatusBadge variant="success">Party A and Party B signed</StatusBadge>}
</div>
</SectionHeader>

<ProgressSteps
current={isFinalReview ? 5 : isReviewed ? 3 : 1}
steps={["Create Deal", "AI Generated", "Review", "Party A", "Party B", "Final Review"]}
/>

<div className="mt-8 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
<Card className="p-6">
<h2 className="text-xl font-bold text-slate-950">
Agreement inputs
</h2>
<p className="mt-2 text-sm leading-6 text-slate-500">
These values are sent to the existing AI agreement generator.
</p>

<div className="mt-6 space-y-4">
<InputField
name="partyA"
label="Party A"
placeholder="Party A Name"
value={form.partyA}
onChange={handleChange}
/>

<InputField
name="partyB"
label="Party B"
placeholder="Party B Name"
value={form.partyB}
onChange={handleChange}
/>

<InputField
name="amount"
label="Amount"
placeholder="Amount"
value={form.amount}
onChange={handleChange}
/>

<InputField
as="textarea"
name="terms"
label="Agreement Terms"
placeholder="Agreement Terms"
value={form.terms}
onChange={handleChange}
rows="5"
/>
</div>

<Button

onClick={handleGenerateAI}

variant="success"
className="mt-6 w-full"

>

{loading ? "Generating..." : "Generate Using AI"}

</Button>
</Card>

<div className="space-y-6">

        {
aiText &&

<Card className="p-6">

<div className="mb-4 flex items-center justify-between gap-4">
<h2 className="text-xl font-bold text-slate-950">

AI Generated Agreement


</h2>
<StatusBadge variant="primary">Review draft</StatusBadge>
</div>


<p className="whitespace-pre-line rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">

{aiText}

</p>

</Card>

}

{
isSaved &&

<Card className="border-emerald-100 bg-emerald-50 p-5">

<h2 className="text-lg font-bold text-emerald-800">

Security Hash

</h2>


<p className="mt-2 break-all text-sm text-emerald-700">

Document secured with SHA-256

</p>


</Card>

}

{
isReviewed &&

<>

{
isFinalReview &&

<Card className="p-6">
<div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
<div>
<h2 className="text-xl font-bold text-slate-950">
Final Review
</h2>
<p className="mt-1 text-sm text-slate-500">
Confirm the signed agreement details before saving to Firestore.
</p>
</div>
<StatusBadge variant="success">Ready to Save</StatusBadge>
</div>

<div className="grid gap-4 sm:grid-cols-3">
<div className="rounded-2xl bg-slate-50 p-4">
<p className="text-xs font-bold uppercase tracking-wide text-slate-500">
Party A
</p>
<p className="mt-1 break-words text-sm font-semibold text-slate-900">
{form.partyA || "Not provided"}
</p>
</div>
<div className="rounded-2xl bg-slate-50 p-4">
<p className="text-xs font-bold uppercase tracking-wide text-slate-500">
Party B
</p>
<p className="mt-1 break-words text-sm font-semibold text-slate-900">
{form.partyB || "Not provided"}
</p>
</div>
<div className="rounded-2xl bg-slate-50 p-4">
<p className="text-xs font-bold uppercase tracking-wide text-slate-500">
Amount
</p>
<p className="mt-1 break-words text-sm font-semibold text-slate-900">
{form.amount || "Not provided"}
</p>
</div>
</div>

<div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
<div>
<p className="text-sm font-bold text-[#1E3A8A]">
SHA-256 Status
</p>
<p className="mt-1 text-sm leading-6 text-slate-600">
Hash will be generated from the assembled signed agreement when saved.
</p>
</div>
<StatusBadge variant="primary">Pending Save</StatusBadge>
</div>
</div>

<div className="mt-6 grid gap-4 lg:grid-cols-2">
{[
{ label: "Party A", record: partyASignature },
{ label: "Party B", record: partyBSignature }
].map(({ label, record }) => (
<div key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
<div className="mb-4 flex items-center justify-between gap-3">
<h3 className="text-base font-bold text-slate-950">
{label} Signature
</h3>
<StatusBadge variant="success">Signed</StatusBadge>
</div>
<div className="flex min-h-32 items-center justify-center rounded-2xl bg-slate-50 p-4">
{renderSignaturePreview(record)}
</div>
<div className="mt-4 space-y-2 text-sm">
<p className="text-slate-600">
<span className="font-semibold text-slate-900">Method:</span> {record?.signature?.method || "Pending"}
</p>
<p className="text-slate-600">
<span className="font-semibold text-slate-900">Timestamp:</span> {formatSignedAt(record?.signedAt)}
</p>
</div>
</div>
))}
</div>
</Card>

}

<Card className="p-6">
<h2 className="text-xl font-bold text-slate-950">
Finalize agreement
</h2>
<p className="mt-2 text-sm leading-6 text-slate-500">
Review is complete. Save the generated agreement to Firestore before downloading the PDF.
</p>

{isFinalReview && (
<div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
Party A and Party B signatures are captured in React state for this session.
</div>
)}

<div className="mt-5 flex flex-wrap gap-3">
<Button

onClick={saveAgreement}

>

Save Agreement

</Button>

{

isSaved &&

<Button

onClick={generatePDF}

variant="secondary"

>

Download PDF

</Button>

}
</div>
</Card>

</>

}

{
aiText && !isReviewed &&

<Card className="border-amber-100 bg-amber-50 p-6">
<h2 className="text-xl font-bold text-amber-800">
Review required before saving
</h2>
<p className="mt-2 text-sm leading-6 text-amber-700">
This generated agreement must be reviewed before the save action is available.
</p>
<Button
onClick={() => navigate("/review-agreement", {
state: {
...deal,
partyA: form.partyA,
partyB: form.partyB,
amount: form.amount,
terms: form.terms,
aiText,
createdAt: deal?.createdAt || new Date().toISOString(),
agreementStatus: "AI Generated"
}
})}
variant="warning"
className="mt-5"
>
Review Agreement
</Button>
</Card>

}
</div>
</div>


</div>
</Layout>


)


}


export default CreateAgreement;

import { generateHash } from "../services/security";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { useState } from "react";
import { db } from "../services/firebase";
import { generateAgreement } from "../services/gemini";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import InputField from "../components/ui/InputField";
import ProgressSteps from "../components/ui/ProgressSteps";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";

import {
 collection,
 addDoc
} from "firebase/firestore";


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
const [isSaved,setIsSaved] = useState(false);
const generateAgreementId = () => {

return "DS-" + Date.now();

};
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
const securityHash = generateHash(
aiText
);


await addDoc(

collection(db,"agreements"),

{

agreementId: agreementId,

partyA: form.partyA,

partyB: form.partyB,

amount: form.amount,

userTerms: form.terms,

aiAgreement: aiText,

securityHash: securityHash,

status:"created",

securityStatus:"pending",

createdAt:new Date()

}

);

setIsSaved(true);
alert("Agreement Saved Successfully");


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


doc.save(
"DigiStamp_Agreement.pdf"
);


};

return(

<Layout>
<div className="page-transition">

<SectionHeader
eyebrow="AI Agreement"
title="Generate and review agreement"
description="Review deal details, generate an agreement draft, save it securely, and download the PDF."
>
<div className="mt-4 flex flex-wrap gap-2">
<StatusBadge variant="primary">Gemini AI drafting</StatusBadge>
<StatusBadge variant="success">SHA-256 hash on save</StatusBadge>
</div>
</SectionHeader>

<ProgressSteps
current={isReviewed ? 3 : 1}
steps={["Create Deal", "✓ AI Generated", "Review", "Signature", "Save"]}
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

<Card className="p-6">
<h2 className="text-xl font-bold text-slate-950">
Finalize agreement
</h2>
<p className="mt-2 text-sm leading-6 text-slate-500">
Review is complete. Save the generated agreement to Firestore before downloading the PDF.
</p>

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

import { useState } from "react";

import { db } from "../services/firebase";

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

<div className="min-h-screen bg-gray-900 text-white p-10">


<h1 className="text-3xl font-bold">

Verify Agreement 🔍

</h1>


<input

placeholder="Enter Agreement ID"

onChange={(e)=>setId(e.target.value)}

className="text-black p-3 mt-6"

/>


<button

onClick={verify}

className="bg-blue-600 px-6 py-3 ml-3 rounded"

>

Verify

</button>



{

agreement &&


<div className="bg-gray-800 p-5 mt-8 rounded">


<h2 className="text-green-400 text-xl">

Verified DigiStamp Document ✅

</h2>


<p>
ID: {agreement.agreementId}
</p>


<p>
Party A: {agreement.partyA}
</p>


<p>
Party B: {agreement.partyB}
</p>


<p>
Status: {agreement.status}
</p>


<p className="break-all">

SHA-256:

{agreement.securityHash}

</p>


</div>


}


</div>

)


}


export default VerifyAgreement;
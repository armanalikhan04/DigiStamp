import { useState } from "react";
import { db } from "../services/firebase";
import { generateAgreement } from "../services/gemini";

import {
 collection,
 addDoc
} from "firebase/firestore";


function CreateAgreement(){


const [form,setForm] = useState({

partyA:"",
partyB:"",
amount:"",
terms:""

});

const [aiText,setAiText] = useState("");
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

alert("AI Agreement Generated");

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

await addDoc(
collection(db,"agreements"),
{
...form,
createdAt:new Date()
}
);


alert("Agreement Created Successfully");


}

catch(error){

alert(error.message);

}

};



return(

<div className="min-h-screen bg-gray-900 text-white p-10">


<h1 className="text-3xl font-bold mb-8">

Create Agreement 📄

</h1>



<input

name="partyA"

placeholder="Party A Name"

onChange={handleChange}

className="p-3 text-black block mb-4 w-96"

/>


<input

name="partyB"

placeholder="Party B Name"

onChange={handleChange}

className="p-3 text-black block mb-4 w-96"

/>



<input

name="amount"

placeholder="Amount"

onChange={handleChange}

className="p-3 text-black block mb-4 w-96"

/>


<textarea

name="terms"

placeholder="Agreement Terms"

onChange={handleChange}

className="p-3 text-black block mb-4 w-96"

/>

        <button

onClick={handleGenerateAI}

className="bg-green-600 px-6 py-3 rounded mr-3"

>

{loading ? "Generating..." : "Generate Using AI 🤖"}

</button>

        {
aiText &&

<div className="mt-6 bg-gray-800 p-5 rounded">

<h2 className="text-xl mb-3">

AI Generated Agreement

</h2>


<p className="whitespace-pre-line">

{aiText}

</p>

</div>

}

<button

onClick={saveAgreement}

className="bg-blue-600 px-6 py-3 rounded"

>

Save Agreement

</button>


</div>


)


}


export default CreateAgreement;
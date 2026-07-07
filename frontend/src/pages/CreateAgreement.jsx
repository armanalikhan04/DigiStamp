import { useState } from "react";
import { db } from "../services/firebase";

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


const handleChange=(e)=>{

setForm({

...form,

[e.target.name]:e.target.value

});

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

onClick={saveAgreement}

className="bg-blue-600 px-6 py-3 rounded"

>

Save Agreement

</button>


</div>


)


}


export default CreateAgreement;
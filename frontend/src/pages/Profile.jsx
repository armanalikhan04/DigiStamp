import { useState } from "react";

import { db } from "../services/firebase";

import { uploadImage } from "../services/cloudinary";

import {
doc,
setDoc
} from "firebase/firestore";


function Profile(){


const [profile,setProfile]=useState({

name:"",
phone:"",
idType:"",
idNumber:""

});


const [idImage,setIdImage]=useState(null);

const [faceImage,setFaceImage]=useState(null);



const handleChange=(e)=>{

setProfile({

...profile,

[e.target.name]:e.target.value

});

};



const saveProfile=async()=>{


try{


const idURL = await uploadImage(idImage);


const faceURL = await uploadImage(faceImage);



await setDoc(

doc(db,"users",profile.phone),

{

...profile,

idProof:idURL,

facePhoto:faceURL,

verificationStatus:"verified",

createdAt:new Date()

}

);



alert("Identity Verification Completed ✅");


}

catch(error){

alert(error.message);

}


};



return(

<div className="min-h-screen bg-gray-900 text-white p-10">


<h1 className="text-3xl font-bold">

Identity Verification 🔐

</h1>


<input

name="name"

placeholder="Full Name"

onChange={handleChange}

className="text-black p-3 block mt-5"

/>


<input

name="phone"

placeholder="Phone Number"

onChange={handleChange}

className="text-black p-3 block mt-5"

/>


<input

name="idType"

placeholder="ID Type"

onChange={handleChange}

className="text-black p-3 block mt-5"

/>


<input

name="idNumber"

placeholder="ID Number"

onChange={handleChange}

className="text-black p-3 block mt-5"

/>


<p className="mt-5">

Upload Government ID 📄

</p>


<input

type="file"

onChange={(e)=>setIdImage(e.target.files[0])}

/>


<p className="mt-5">

Upload Face Photo 📷

</p>


<input

type="file"

onChange={(e)=>setFaceImage(e.target.files[0])}

/>


<button

onClick={saveProfile}

className="bg-green-600 px-6 py-3 mt-6 rounded"

>

Verify Identity

</button>


</div>

)

}


export default Profile;
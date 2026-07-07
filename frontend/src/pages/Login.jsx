import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { auth } from "../services/firebase";

import {
 createUserWithEmailAndPassword,
 signInWithEmailAndPassword
} from "firebase/auth";


function Login(){

const navigate = useNavigate();
const [email,setEmail] = useState("");
const [password,setPassword] = useState("");


const signup = async()=>{

try{

await createUserWithEmailAndPassword(
auth,
email,
password
);

alert("Account Created Successfully");

}

catch(error){

alert(error.message);

}

};


const login = async()=>{

try{

await signInWithEmailAndPassword(
auth,
email,
password
);

navigate("/dashboard");

}

catch(error){

alert(error.message);

}

};


return(

<div className="min-h-screen flex items-center justify-center bg-gray-900">

<div className="bg-white p-8 rounded-xl w-96">

<h1 className="text-3xl font-bold mb-5">
DigiStamp 🔐
</h1>


<input

className="border p-2 w-full mb-3"

placeholder="Email"

onChange={(e)=>setEmail(e.target.value)}

/>


<input

className="border p-2 w-full mb-3"

placeholder="Password"

type="password"

onChange={(e)=>setPassword(e.target.value)}

/>


<button 
onClick={login}
className="bg-blue-600 text-white p-2 w-full mb-3"
>

Login

</button>


<button 
onClick={signup}
className="bg-green-600 text-white p-2 w-full"
>

Create Account

</button>


</div>

</div>

)

}


export default Login;
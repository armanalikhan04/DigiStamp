import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { auth } from "../services/firebase";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import InputField from "../components/ui/InputField";
import StatusBadge from "../components/ui/StatusBadge";

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

<div className="min-h-screen bg-[#F8FAFC] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">

<div className="page-transition mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">

<div className="hidden lg:block">
<StatusBadge variant="primary">AI-powered legal workflow</StatusBadge>
<h1 className="mt-6 max-w-2xl text-5xl font-bold tracking-tight text-slate-950">
DigiStamp
</h1>
<p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
Create agreements, verify identities, secure documents with SHA-256, and generate professional PDFs from one trusted workspace.
</p>

<div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
<div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
<p className="text-2xl font-bold text-[#1E3A8A]">AI</p>
<p className="mt-1 text-xs font-semibold text-slate-500">Agreement drafting</p>
</div>
<div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
<p className="text-2xl font-bold text-emerald-600">256</p>
<p className="mt-1 text-xs font-semibold text-slate-500">Hash security</p>
</div>
<div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
<p className="text-2xl font-bold text-[#2563EB]">ID</p>
<p className="mt-1 text-xs font-semibold text-slate-500">Verification ready</p>
</div>
</div>
</div>

<Card className="mx-auto w-full max-w-md p-8 sm:p-10">

<div className="mb-8">
<StatusBadge variant="success">Secure access</StatusBadge>
<h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
Welcome to DigiStamp
</h2>
<p className="mt-2 text-sm leading-6 text-slate-500">
Sign in to manage secure digital agreements and verification records.
</p>
</div>

<div className="space-y-4">
<InputField
label="Email address"
placeholder="you@example.com"
type="email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
/>

<InputField
label="Password"
placeholder="Enter your password"
type="password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
/>

<Button 
onClick={login}
className="w-full"
>
Login
</Button>

<Button 
onClick={signup}
variant="success"
className="w-full"
>
Create Account
</Button>
</div>

<p className="mt-6 text-center text-xs leading-5 text-slate-500">
Protected by Firebase Authentication and secure document verification workflows.
</p>
</Card>

</div>
</div>

)

}


export default Login;

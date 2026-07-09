import { useNavigate } from "react-router-dom";
function Dashboard(){
    const navigate = useNavigate();

return (

<div className="min-h-screen bg-gray-900 text-white p-10">

<h1 className="text-4xl font-bold">
Welcome to DigiStamp 🔐
</h1>


<p className="mt-3 text-gray-300">
Create and manage secure digital agreements
</p>


<div className="mt-10">

<button
onClick={()=>navigate("/create")}

className="bg-blue-600 px-6 py-3 rounded-lg"

>
+ Create Agreement

</button>

<button

onClick={()=>navigate("/verify")}

className="bg-green-600 px-6 py-3 rounded-lg ml-3"

>

Verify Agreement 🔍

</button>

<button

onClick={()=>navigate("/profile")}

className="bg-purple-600 px-6 py-3 rounded-lg"

>

Complete Verification 🔐

</button>

</div>


<div className="mt-10 bg-gray-800 p-5 rounded-xl">

<h2 className="text-xl">
My Agreements
</h2>


<p className="text-gray-400 mt-3">

No agreements created yet.

</p>

</div>


</div>

)

}


export default Dashboard;
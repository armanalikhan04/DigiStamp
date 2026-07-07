import CreateAgreement from "./pages/CreateAgreement";
import React from "react";
import ReactDOM from "react-dom/client";

import {
BrowserRouter,
Routes,
Route
} from "react-router-dom";


import "./index.css";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";


ReactDOM.createRoot(
document.getElementById("root")
).render(

<BrowserRouter>

<Routes>

<Route 
path="/" 
element={<Login/>}
/>


<Route 
path="/dashboard" 
element={<Dashboard/>}
/>

<Route
path="/create"
element={<CreateAgreement/>}
/>

</Routes>

</BrowserRouter>

);
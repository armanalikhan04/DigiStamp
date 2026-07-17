import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateDeal from "./pages/CreateDeal";
import CreateAgreement from "./pages/CreateAgreement";
import VerifyAgreement from "./pages/VerifyAgreement";
import Verification from "./pages/Verification";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/create-deal" element={<CreateDeal />} />
      <Route path="/create" element={<CreateAgreement />} />
      <Route path="/create-agreement" element={<CreateAgreement />} />
      <Route path="/verify" element={<VerifyAgreement />} />
      <Route path="/verification" element={<Verification />} />
      <Route path="/profile" element={<Verification />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

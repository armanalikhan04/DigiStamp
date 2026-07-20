import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateDeal from "./pages/CreateDeal";
import CreateAgreement from "./pages/CreateAgreement";
import CertificatePage from "./pages/CertificatePage";
import ReviewAgreement from "./pages/ReviewAgreement";
import SignaturePage from "./pages/SignaturePage";
import VerifyAgreement from "./pages/VerifyAgreement";
import VerifyCertificatePage from "./pages/VerifyCertificatePage";
import Verification from "./pages/Verification";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/certificate/:certificateId" element={<CertificatePage />} />
      <Route path="/verify/:certificateId" element={<VerifyCertificatePage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-deal"
        element={
          <ProtectedRoute>
            <CreateDeal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <CreateAgreement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-agreement"
        element={
          <ProtectedRoute>
            <CreateAgreement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/review-agreement"
        element={
          <ProtectedRoute>
            <ReviewAgreement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/signature"
        element={
          <ProtectedRoute>
            <SignaturePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verify"
        element={
          <ProtectedRoute>
            <VerifyAgreement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verification"
        element={
          <ProtectedRoute>
            <Verification />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Verification />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

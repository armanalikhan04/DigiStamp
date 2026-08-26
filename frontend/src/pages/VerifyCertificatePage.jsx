import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";
import { useAuth } from "../context/useAuth";
import { useAgreement } from "../hooks/useAgreement";
import { useCertificate } from "../hooks/useCertificate";
import {
  formatCertificateDate,
  getCertificateVerificationResult,
  getAgreementSha256,
  getVerificationStatusCardClass,
  getVerificationStatusTextClass,
  getVerificationStatusTitle,
  getVerificationStatusVariant,
} from "../utils/certificate";

function VerifyCertificatePage() {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [result, setResult] = useState("not-found");
  const [verifiedAt, setVerifiedAt] = useState("");
  const {
    certificate,
    loading: certificateLoading,
    error: certificateError,
  } = useCertificate(certificateId);
  const {
    agreement,
    loading: agreementLoading,
    error: agreementError,
  } = useAgreement(certificate?.agreementId);
  const agreementPending = Boolean(certificate?.agreementId) && !agreement && !agreementError;
  const loading = certificateLoading || agreementLoading || agreementPending;

  useEffect(() => {
    setVerifiedAt(new Date().toLocaleString());
  }, [certificateId]);

  useEffect(() => {
    if (certificateLoading) {
      return;
    }

    if (certificateError && certificateError !== "Certificate not found.") {
      setResult("error");
      return;
    }

    if (certificateError || !certificate) {
      setResult("not-found");
      return;
    }

    if (agreementLoading || agreementPending) {
      return;
    }

    if (agreementError && agreementError !== "Agreement not found.") {
      setResult("error");
      return;
    }

    if (agreementError || !agreement) {
      setResult(getCertificateVerificationResult(certificate, null));
      return;
    }

    setResult(getCertificateVerificationResult(certificate, agreement));
  }, [
    agreement,
    agreementError,
    agreementLoading,
    agreementPending,
    certificate,
    certificateError,
    certificateLoading,
  ]);

  const downloadCertificatePDF = () => {
    if (!certificate) {
      return;
    }

    const pdf = new jsPDF();

    pdf.setFontSize(22);
    pdf.text("DigiStamp Certificate Verification", 20, 24);

    pdf.setFontSize(12);
    pdf.text(`Certificate ID: ${certificate.certificateId}`, 20, 44);
    pdf.text(`Agreement ID: ${certificate.agreementId}`, 20, 54);
    pdf.text(`Party A: ${certificate.partyA}`, 20, 64);
    pdf.text(`Party B: ${certificate.partyB}`, 20, 74);
    pdf.text(`Agreement Type: ${certificate.agreementType}`, 20, 84);
    pdf.text(`Issue Date: ${formatCertificateDate(certificate.issuedAt)}`, 20, 94);
    pdf.text(`Certificate Status: ${statusTitle}`, 20, 104);
    pdf.text(`Verification Timestamp: ${verifiedAt}`, 20, 114);

    pdf.setFontSize(14);
    pdf.text("SHA-256", 20, 134);
    pdf.setFontSize(10);
    pdf.text(pdf.splitTextToSize(certificate.sha256, 170), 20, 144);

    pdf.save(`${certificate.certificateId}_Verification.pdf`);
  };

  const statusCardClass = getVerificationStatusCardClass(result);
  const statusTextClass = getVerificationStatusTextClass(result);
  const statusTitle = getVerificationStatusTitle(result);
  const statusVariant = getVerificationStatusVariant(result);

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="page-transition mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Public Verification"
          title="Verify DigiStamp certificate"
          description="Public certificate verification is available without login."
          actions={
            <Button onClick={() => navigate(user ? "/dashboard" : "/")} variant="secondary">
              Back to Home
            </Button>
          }
        >
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge variant="primary">DigiStamp</StatusBadge>
            <StatusBadge variant={statusVariant}>
              {loading ? "Checking" : result}
            </StatusBadge>
          </div>
        </SectionHeader>

        <Card className={`p-6 sm:p-8 ${statusCardClass}`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className={`text-2xl font-bold ${statusTextClass}`}>
                {loading ? "Verifying certificate..." : statusTitle}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Verification Timestamp: {verifiedAt || "Checking..."}
              </p>
            </div>
            <StatusBadge variant={statusVariant}>
              {result === "verified" ? "Verified" : result === "tampered" ? "Tampered" : result === "error" ? "Error" : "Not Found"}
            </StatusBadge>
          </div>
        </Card>

        {result === "not-found" && !loading && (
          <Card className="mt-6 border-slate-200 bg-slate-50 p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-800">
              Certificate Not Found
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              No DigiStamp certificate exists for ID {certificateId}.
            </p>
          </Card>
        )}

        {result === "tampered" && certificate && (
          <Card className="mt-6 border-red-100 bg-red-50 p-6">
            <h2 className="text-xl font-bold text-red-700">
              Tamper Warning
            </h2>
            <p className="mt-2 text-sm leading-6 text-red-700">
              The certificate SHA-256 does not match the linked agreement hash, or the agreement record could not be found.
            </p>
          </Card>
        )}

        {result === "error" && !loading && (
          <Card className="mt-6 border-amber-100 bg-amber-50 p-6">
            <h2 className="text-xl font-bold text-amber-700">
              Verification could not be completed
            </h2>
            <p className="mt-2 text-sm leading-6 text-amber-700">
              DigiStamp could not access the required certificate or agreement
              record. Check connectivity and Firestore read permissions.
            </p>
          </Card>
        )}

        {certificate && (
          <Card className="mt-6 p-6 sm:p-8">
            <div className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Certificate Details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Platform: DigiStamp
                </p>
              </div>
              <StatusBadge variant={statusVariant}>
                {statusTitle}
              </StatusBadge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[
                ["Certificate ID", certificate.certificateId],
                ["Agreement ID", certificate.agreementId],
                ["Party A", certificate.partyA],
                ["Party B", certificate.partyB],
                ["Agreement Type", certificate.agreementType],
                ["Issue Date", formatCertificateDate(certificate.issuedAt)],
                ["Status", certificate.status],
                ["Platform", "DigiStamp"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {label}
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold text-slate-950">
                    {value || "Not available"}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-[#1E3A8A]">
                SHA-256
              </p>
              <p className="mt-2 break-all text-sm leading-6 text-slate-700">
                {certificate.sha256}
              </p>
            </div>

            {agreement && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Agreement Hash
                </p>
                <p className="mt-2 break-all text-sm leading-6 text-slate-700">
                  {getAgreementSha256(agreement)}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => navigate(`/certificate/${certificate.certificateId}`)}>
                View Certificate
              </Button>
              <Button onClick={downloadCertificatePDF} variant="secondary">
                Download Certificate PDF
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default VerifyCertificatePage;

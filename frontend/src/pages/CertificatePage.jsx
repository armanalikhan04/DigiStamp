import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import { QRCodeCanvas } from "qrcode.react";
import { getCertificateById } from "../services/certificateService";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";
import {
  buildVerificationUrl,
  formatCertificateDate,
} from "../utils/certificate";

function CertificatePage() {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAgreement, setShowAgreement] = useState(false);
  const qrRef = useRef(null);
  const certificateUrl = certificate
    ? buildVerificationUrl(window.location.origin, certificate.certificateId)
    : "";

  useEffect(() => {
    const loadCertificate = async () => {
      try {
        const certificateData = await getCertificateById(certificateId);

        if (!certificateData) {
          setError("Certificate not found.");
          return;
        }

        setCertificate(certificateData);
      } catch (loadError) {
        console.error(loadError);
        setError("Unable to load certificate.");
      } finally {
        setLoading(false);
      }
    };

    loadCertificate();
  }, [certificateId]);

  const verifyCertificate = async () => {
    navigate(`/verify/${certificateId}`);
  };

  const downloadCertificatePDF = () => {
    if (!certificate) {
      return;
    }

    const pdf = new jsPDF();

    pdf.setFontSize(22);
    pdf.text("DigiStamp Digital Certificate", 20, 24);

    pdf.setFontSize(12);
    pdf.text(`Certificate ID: ${certificate.certificateId}`, 20, 44);
    pdf.text(`Agreement ID: ${certificate.agreementId}`, 20, 54);
    pdf.text(`Party A: ${certificate.partyA}`, 20, 64);
    pdf.text(`Party B: ${certificate.partyB}`, 20, 74);
    pdf.text(`Agreement Type: ${certificate.agreementType}`, 20, 84);
    pdf.text(`Issue Date: ${formatCertificateDate(certificate.issuedAt)}`, 20, 94);
    pdf.text(`Status: ${certificate.status}`, 20, 104);

    pdf.setFontSize(14);
    pdf.text("SHA-256", 20, 124);
    pdf.setFontSize(10);
    pdf.text(pdf.splitTextToSize(certificate.sha256, 170), 20, 134);

    pdf.setFontSize(14);
    pdf.text("Verification URL", 20, 164);
    pdf.setFontSize(10);
    pdf.text(pdf.splitTextToSize(certificate.verificationUrl, 170), 20, 174);

    const qrCanvas = qrRef.current?.querySelector("canvas");

    if (qrCanvas) {
      pdf.setFontSize(14);
      pdf.text("Certificate QR Code", 20, 194);
      pdf.addImage(qrCanvas.toDataURL("image/png"), "PNG", 20, 202, 42, 42);
    }

    pdf.save(`${certificate.certificateId}_Certificate.pdf`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="page-transition">
          <Card className="p-8 text-center">
            <p className="text-sm font-semibold text-slate-600">
              Loading certificate...
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="page-transition">
          <Card className="p-8 text-center">
            <StatusBadge variant="danger">Not Found</StatusBadge>
            <h1 className="mt-4 text-2xl font-bold text-slate-950">
              Certificate unavailable
            </h1>
            <p className="mt-2 text-sm text-slate-500">{error}</p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-transition">
        <SectionHeader
          eyebrow="Digital Certificate"
          title="Tamper-evident certificate"
          description="This certificate confirms that DigiStamp issued a verified record for the signed agreement."
          actions={
            <>
              <Button onClick={downloadCertificatePDF}>
                Download Certificate PDF
              </Button>
              <Button onClick={() => setShowAgreement(!showAgreement)} variant="secondary">
                View Agreement
              </Button>
            <Button onClick={verifyCertificate} variant="success">
                Verify Certificate
              </Button>
            </>
          }
        >
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge variant="success">{certificate.status}</StatusBadge>
            <StatusBadge variant="primary">DigiStamp</StatusBadge>
          </div>
        </SectionHeader>

        <Card className="overflow-hidden">
          <div className="bg-[#1E3A8A] px-6 py-8 text-white sm:px-10">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-100">
              DigiStamp Legal-Tech Platform
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Digital Certificate of Verification
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-100">
              Issued for a signed digital agreement secured with SHA-256.
            </p>
          </div>

          <div className="p-6 sm:p-10">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Certificate ID
                </p>
                <p className="mt-1 break-words text-sm font-semibold text-slate-950">
                  {certificate.certificateId}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Agreement ID
                </p>
                <p className="mt-1 break-words text-sm font-semibold text-slate-950">
                  {certificate.agreementId}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Status
                </p>
                <div className="mt-1">
                  <StatusBadge variant="success">{certificate.status}</StatusBadge>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Party A
                </p>
                <p className="mt-1 break-words text-sm font-semibold text-slate-950">
                  {certificate.partyA}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Party B
                </p>
                <p className="mt-1 break-words text-sm font-semibold text-slate-950">
                  {certificate.partyB}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Issue Date
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {formatCertificateDate(certificate.issuedAt)}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-[#1E3A8A]">
                SHA-256
              </p>
              <p className="mt-2 break-all text-sm leading-6 text-slate-700">
                {certificate.sha256}
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Verification URL
              </p>
              <p className="mt-2 break-all text-sm font-semibold text-[#1E3A8A]">
                {certificate.verificationUrl}
              </p>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
              <div ref={qrRef} className="mx-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:mx-0">
                <QRCodeCanvas
                  value={certificateUrl}
                  size={160}
                  level="H"
                  includeMargin
                />
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-bold text-slate-950">
                  Scan to view certificate
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  The QR code opens the public certificate URL for this DigiStamp record.
                </p>
              </div>
            </div>

            {showAgreement && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-lg font-bold text-slate-950">
                  Agreement Summary
                </h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-950">Agreement Type:</span> {certificate.agreementType}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-950">Agreement ID:</span> {certificate.agreementId}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-950">Party A:</span> {certificate.partyA}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-950">Party B:</span> {certificate.partyB}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => navigate("/dashboard")} variant="secondary">
            Back to Dashboard
          </Button>
        </div>
      </div>
    </Layout>
  );
}

export default CertificatePage;

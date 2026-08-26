import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import SignaturePad from "../components/signature/SignaturePad";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";
import { AGREEMENT_STATUS, PARTY_STATUS } from "../constants/status";
import { useAuth } from "../context/useAuth";
import { useAgreement } from "../hooks/useAgreement";
import {
  completeAgreementWithPartyBSignature,
  markPartyBReviewed,
  rejectAgreementByPartyB,
} from "../services/agreementService";
import { generateHash } from "../services/security";
import {
  buildSignedAgreementDocumentFromAgreement,
  getAgreementStatusLabel,
  getAgreementStatusVariant,
} from "../utils/agreement";
import {
  buildVerificationUrl,
  formatCertificateDate,
  generateCertificateIdForAgreement,
  getAgreementSha256,
} from "../utils/certificate";

const normalizeEmail = (email = "") => email.trim().toLowerCase();

function AgreementInvitePage() {
  const { agreementId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { agreement, loading, error, refetch } = useAgreement(agreementId);
  const [currentSignature, setCurrentSignature] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [completionNotice, setCompletionNotice] = useState(null);
  const completionInProgressRef = useRef(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/", {
        replace: true,
        state: { redirectTo: `/agreement/${agreementId}` },
      });
    }
  }, [agreementId, authLoading, navigate, user]);

  useEffect(() => {
    if (!completionNotice?.certificateId) {
      return undefined;
    }

    const timer = setTimeout(() => {
      navigate(`/certificate/${completionNotice.certificateId}`);
    }, 2000);

    return () => clearTimeout(timer);
  }, [completionNotice, navigate]);

  const acceptAgreement = async () => {
    if (actionLoading) {
      return;
    }

    try {
      setActionLoading(true);
      await markPartyBReviewed(agreementId, user?.email);
      await refetch();
    } catch (acceptError) {
      alert(acceptError.message);
    } finally {
      setActionLoading(false);
    }
  };

  const rejectAgreement = async () => {
    if (actionLoading) {
      return;
    }

    try {
      setActionLoading(true);
      await rejectAgreementByPartyB(agreementId, user?.email);
      await refetch();
    } catch (rejectError) {
      alert(rejectError.message);
    } finally {
      setActionLoading(false);
    }
  };

  const completeAgreement = async () => {
    const isAlreadyCompleted =
      agreement?.agreementStatus === AGREEMENT_STATUS.COMPLETED ||
      agreement?.agreementStatus === AGREEMENT_STATUS.LEGACY_COMPLETED;

    if (
      !currentSignature ||
      !agreement ||
      actionLoading ||
      completionInProgressRef.current ||
      isAlreadyCompleted ||
      agreement.agreementStatus === AGREEMENT_STATUS.REJECTED ||
      agreement.partyBStatus === PARTY_STATUS.SIGNED
    ) {
      return;
    }

    try {
      completionInProgressRef.current = true;
      setActionLoading(true);

      const partyBSignature = {
        ...currentSignature,
        signedAt: new Date().toISOString(),
      };
      const finalSignedDocument = buildSignedAgreementDocumentFromAgreement({
        agreement,
        partyBSignature,
      });
      const securityHash = generateHash(finalSignedDocument);
      const certificateId =
        agreement.certificateId ||
        generateCertificateIdForAgreement(agreement.agreementId);
      const verificationUrl = buildVerificationUrl(window.location.origin, certificateId);

      const completion = await completeAgreementWithPartyBSignature({
        agreementId,
        userEmail: user?.email,
        signature: partyBSignature,
        securityHash,
        certificateData: {
          certificateId,
          agreementId: agreement.agreementId,
          partyA: agreement.partyA,
          partyB: agreement.partyB,
          agreementType: agreement.agreementType || "Digital Agreement",
          issuedAt: new Date(),
          sha256: securityHash,
          status: "Verified",
          verificationUrl,
        },
      });

      setCompletionNotice({
        certificateId: completion.certificateId,
        agreementId: agreement.agreementId,
        sha256: completion.securityHash || securityHash,
      });
      await refetch();
    } catch (completeError) {
      alert(completeError.message);
    } finally {
      completionInProgressRef.current = false;
      setActionLoading(false);
    }
  };

  const downloadAgreementPDF = () => {
    if (!agreement) {
      return;
    }

    const pdf = new jsPDF();

    pdf.setFontSize(20);
    pdf.text("DigiStamp Agreement", 20, 20);
    pdf.setFontSize(12);
    pdf.text(`Agreement ID: ${agreement.agreementId}`, 20, 38);
    pdf.text(`Party A: ${agreement.partyA}`, 20, 48);
    pdf.text(`Party B: ${agreement.partyB}`, 20, 58);
    pdf.text(`Amount: ${agreement.amount || "Not provided"}`, 20, 68);
    pdf.text(`Certificate ID: ${agreement.certificateId || "Pending"}`, 20, 78);
    pdf.text(`SHA-256: ${getAgreementSha256(agreement) || "Pending"}`, 20, 88);

    const agreementLines = pdf.splitTextToSize(agreement.aiAgreement || "", 170);
    pdf.text(agreementLines, 20, 106);

    let signatureY = 116 + agreementLines.length * 7;

    if (signatureY > 230) {
      pdf.addPage();
      signatureY = 20;
    }

    const addSignatureToPDF = (label, signature, yPosition) => {
      pdf.setFontSize(12);
      pdf.text(label, 20, yPosition);

      if (signature?.method === "type") {
        pdf.setFontSize(18);
        pdf.text(signature.value || "Signature captured", 20, yPosition + 12);
      } else if (signature?.value) {
        try {
          const imageFormat = signature.value.startsWith("data:image/jpeg")
            ? "JPEG"
            : "PNG";
          pdf.addImage(signature.value, imageFormat, 20, yPosition + 6, 55, 22);
        } catch {
          pdf.text("Signature image attached", 20, yPosition + 12);
        }
      } else {
        pdf.text("Signature not available", 20, yPosition + 12);
      }

      pdf.setFontSize(10);
      pdf.text(`Method: ${signature?.method || "Pending"}`, 20, yPosition + 36);
      pdf.text(
        `Timestamp: ${formatCertificateDate(signature?.signedAt)}`,
        20,
        yPosition + 44,
      );
    };

    pdf.setFontSize(16);
    pdf.text("Digital Signatures", 20, signatureY);
    addSignatureToPDF("Party A", agreement.signatures?.partyA, signatureY + 14);
    addSignatureToPDF("Party B", agreement.signatures?.partyB, signatureY + 72);
    pdf.save(`${agreement.agreementId}_Agreement.pdf`);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-8">
        <Card className="mx-auto max-w-3xl p-8 text-center">
          <p className="text-sm font-semibold text-slate-600">
            Loading agreement invitation...
          </p>
        </Card>
      </div>
    );
  }

  if (error === "Access denied.") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-8">
        <Card className="mx-auto max-w-3xl p-8 text-center">
          <StatusBadge variant="danger">Access Denied</StatusBadge>
          <h1 className="mt-4 text-2xl font-bold text-slate-950">
            You do not have access to this invitation
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            This agreement can only be opened by Party A or the invited Party B
            account.
          </p>
          <Button onClick={() => navigate(user ? "/dashboard" : "/")} variant="secondary" className="mt-6">
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  if (error || !agreement) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-8">
        <Card className="mx-auto max-w-3xl p-8 text-center">
          <StatusBadge variant="danger">Not Found</StatusBadge>
          <h1 className="mt-4 text-2xl font-bold text-slate-950">
            Agreement unavailable
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            We could not find this DigiStamp agreement invitation.
          </p>
          <Button onClick={() => navigate(user ? "/dashboard" : "/")} variant="secondary" className="mt-6">
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  const isCompleted =
    agreement.agreementStatus === AGREEMENT_STATUS.COMPLETED ||
    agreement.agreementStatus === AGREEMENT_STATUS.LEGACY_COMPLETED;
  const isRejected = agreement.agreementStatus === AGREEMENT_STATUS.REJECTED;
  const currentEmail = normalizeEmail(user?.email);
  const partyBEmail = normalizeEmail(agreement.partyBEmail);
  const createdByEmail = normalizeEmail(agreement.createdByEmail);
  const isPartyB = Boolean(partyBEmail && currentEmail === partyBEmail);
  const isPartyA = Boolean(
    currentEmail && currentEmail === createdByEmail,
  ) || Boolean(user?.uid && agreement.createdBy === user.uid);
  const hasAgreementAccess = isPartyA || isPartyB;
  const canReview =
    isPartyB &&
    agreement.partyBStatus === PARTY_STATUS.PENDING &&
    !isCompleted &&
    !isRejected;
  const canSign =
    isPartyB &&
    agreement.partyBStatus === PARTY_STATUS.REVIEWED &&
    agreement.partyAStatus === PARTY_STATUS.SIGNED &&
    !isCompleted &&
    !isRejected;
  const certificateId = completionNotice?.certificateId || agreement.certificateId;

  if (!hasAgreementAccess) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-8">
        <Card className="mx-auto max-w-3xl p-8 text-center">
          <StatusBadge variant="danger">Access Denied</StatusBadge>
          <h1 className="mt-4 text-2xl font-bold text-slate-950">
            This invitation belongs to another account
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sign in with the Party B email assigned to this agreement, or return
            to your dashboard.
          </p>
          <Button onClick={() => navigate("/dashboard")} variant="secondary" className="mt-6">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="page-transition mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Agreement Invitation"
          title="Review DigiStamp agreement"
          description="Party B can review, accept, reject, and sign this agreement from a secure shared link."
          actions={
            <Button onClick={() => navigate(user ? "/dashboard" : "/")} variant="secondary">
              Back to Home
            </Button>
          }
        >
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge variant={getAgreementStatusVariant(agreement.agreementStatus)}>
              {getAgreementStatusLabel(agreement.agreementStatus)}
            </StatusBadge>
            <StatusBadge variant={agreement.partyAStatus === PARTY_STATUS.SIGNED ? "success" : "warning"}>
              {agreement.partyAStatus === PARTY_STATUS.SIGNED ? "Signed by Party A" : "Party A Pending"}
            </StatusBadge>
            <StatusBadge variant={agreement.partyBStatus === PARTY_STATUS.SIGNED ? "success" : "warning"}>
              Party B {agreement.partyBStatus || PARTY_STATUS.PENDING}
            </StatusBadge>
          </div>
        </SectionHeader>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-950">
                Agreement Summary
              </h2>
              <div className="mt-5 space-y-3">
                {[
                  ["Agreement ID", agreement.agreementId],
                  ["Party A", agreement.partyA],
                  ["Party B", agreement.partyB],
                  ["Amount", agreement.amount || "Not provided"],
                  ["Created", formatCertificateDate(agreement.createdAt)],
                  ["Hash", getAgreementSha256(agreement) || "Pending final signature"],
                  ["Certificate", agreement.certificateStatus || "Pending"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {label}
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-950">
                Party Controls
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {isPartyB
                  ? "Party B may only update their own review and signature fields."
                  : "Party A can monitor this agreement, but only Party B can accept, reject, or sign."}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {canReview && (
                  <>
                    <Button onClick={acceptAgreement} disabled={actionLoading} variant="success">
                      {actionLoading ? "Processing..." : "Accept Agreement"}
                    </Button>
                    <Button onClick={rejectAgreement} disabled={actionLoading} variant="danger">
                      {actionLoading ? "Processing..." : "Reject Agreement"}
                    </Button>
                  </>
                )}
                {isCompleted && (
                  <>
                    <Button onClick={downloadAgreementPDF} variant="secondary">
                      Download Agreement PDF
                    </Button>
                    {certificateId && (
                      <Button onClick={() => navigate(`/certificate/${certificateId}`)}>
                        View Certificate
                      </Button>
                    )}
                    {certificateId && (
                      <Button onClick={() => navigate(`/verify/${certificateId}`)} variant="success">
                        Verify Certificate
                      </Button>
                    )}
                  </>
                )}
                {isRejected && (
                  <StatusBadge variant="danger">Agreement rejected</StatusBadge>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    Agreement Document
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Read-only agreement text for Party B review.
                  </p>
                </div>
                <StatusBadge variant="primary">Read only</StatusBadge>
              </div>
              <div className="max-h-[520px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5">
                <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
                  {agreement.aiAgreement || "Agreement text not available."}
                </p>
              </div>
            </Card>

            {canSign && (
              <>
                <SignaturePad
                  signerName={agreement.partyB}
                  signerRole="Party B"
                  onChange={setCurrentSignature}
                />

                <Card className="p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <StatusBadge variant="success">Party B accepted</StatusBadge>
                    <Button
                      onClick={completeAgreement}
                      disabled={!currentSignature || actionLoading}
                    >
                      {actionLoading ? "Completing Agreement..." : "Sign and Complete Agreement"}
                    </Button>
                  </div>
                </Card>
              </>
            )}

            {(isCompleted || completionNotice) && (
              <Card className="border-emerald-100 bg-emerald-50 p-6">
                <h2 className="text-xl font-bold text-emerald-800">
                  ✓ Agreement Completed
                </h2>
                <p className="mt-2 text-sm leading-6 text-emerald-700">
                  ✓ Certificate Generated
                </p>
                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Certificate ID
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold text-slate-950">
                      {certificateId || "Preparing certificate..."}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Agreement ID
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold text-slate-950">
                      {agreement.agreementId}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      SHA-256
                    </p>
                    <p className="mt-1 break-all text-sm font-semibold text-slate-950">
                      {completionNotice?.sha256 || getAgreementSha256(agreement) || "Finalizing hash..."}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button onClick={downloadAgreementPDF} variant="secondary">
                    Download PDF
                  </Button>
                  {certificateId && (
                    <>
                      <Button onClick={() => navigate(`/certificate/${certificateId}`)}>
                        View Certificate
                      </Button>
                      <Button onClick={() => navigate(`/verify/${certificateId}`)} variant="success">
                        Verify Certificate
                      </Button>
                    </>
                  )}
                  <Button onClick={() => navigate("/dashboard")} variant="secondary">
                    Dashboard
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgreementInvitePage;

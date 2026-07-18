import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SignaturePad from "../components/signature/SignaturePad";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ProgressSteps from "../components/ui/ProgressSteps";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";

function SignaturePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const signingData = location.state || {};
  const signerRole = signingData.signerRole || "Party A";
  const signatures = signingData.signatures || {};
  const [currentSignature, setCurrentSignature] = useState(null);

  const agreementId = useMemo(() => {
    if (signingData.agreementId) {
      return signingData.agreementId;
    }

    const sourceDate = signingData.createdAt || new Date().toISOString();
    return `DRAFT-${new Date(sourceDate).getTime()}`;
  }, [signingData.agreementId, signingData.createdAt]);

  const currentSignerName =
    signerRole === "Party A"
      ? signingData.partyA || "Party A"
      : signingData.partyB || "Party B";

  const currentStep = signerRole === "Party A" ? 3 : 4;

  const goBack = () => {
    navigate("/review-agreement", {
      state: signingData,
    });
  };

  const continueSigning = () => {
    const nextSignatures = {
      ...signatures,
      [signerRole]: {
        signerName: currentSignerName,
        signerRole,
        signedAt: new Date().toISOString(),
        signature: currentSignature,
      },
    };

    if (signerRole === "Party A") {
      navigate("/signature", {
        state: {
          ...signingData,
          agreementId,
          signerRole: "Party B",
          signatures: nextSignatures,
          agreementStatus: "Party A Signed",
        },
      });
      return;
    }

    navigate("/create-agreement", {
      state: {
        ...signingData,
        agreementId,
        reviewed: true,
        signatures: nextSignatures,
        agreementStatus: "Signed - Final Review",
      },
    });
  };

  return (
    <Layout>
      <div className="page-transition">
        <SectionHeader
          eyebrow="Digital Signature"
          title={`${signerRole} signature`}
          description="Capture the current party's digital signature before moving to the next signer."
        >
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge variant="primary">Agreement {agreementId}</StatusBadge>
            <StatusBadge variant="success">React state only</StatusBadge>
          </div>
        </SectionHeader>

        <ProgressSteps
          current={currentStep}
          steps={["Create Deal", "AI Generated", "Review", "Party A", "Party B", "Final Review"]}
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
          <div className="space-y-6">
            <Card className="p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    Agreement Summary
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Confirm the current agreement context before signing.
                  </p>
                </div>
                <StatusBadge variant="warning">
                  {signingData.agreementStatus || "Reviewed"}
                </StatusBadge>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Agreement ID
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                    {agreementId}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Amount
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                    {signingData.amount || "Not provided"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Parties
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                    {signingData.partyA || "Party A"} → {signingData.partyB || "Party B"}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-950">
                Current Signer
              </h2>
              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-[#1E3A8A]">
                  {signerRole}
                </p>
                <p className="mt-2 break-words text-lg font-bold text-slate-950">
                  {currentSignerName}
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-950">
                Signing Progress
              </h2>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Party A</p>
                    <p className="text-xs text-slate-500">
                      {signingData.partyA || "Party A"}
                    </p>
                  </div>
                  <StatusBadge variant={signatures["Party A"] ? "success" : signerRole === "Party A" ? "primary" : "default"}>
                    {signatures["Party A"] ? "Signed" : signerRole === "Party A" ? "Signing" : "Pending"}
                  </StatusBadge>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Party B</p>
                    <p className="text-xs text-slate-500">
                      {signingData.partyB || "Party B"}
                    </p>
                  </div>
                  <StatusBadge variant={signatures["Party B"] ? "success" : signerRole === "Party B" ? "primary" : "default"}>
                    {signatures["Party B"] ? "Signed" : signerRole === "Party B" ? "Signing" : "Pending"}
                  </StatusBadge>
                </div>
              </div>
            </Card>

            <Card className="border-emerald-100 bg-emerald-50 p-6">
              <h2 className="text-xl font-bold text-emerald-800">
                Security Notice
              </h2>
              <p className="mt-2 text-sm leading-6 text-emerald-700">
                This signature is held temporarily in React state for the current workflow.
                It is not saved to Firestore until a later feature explicitly adds persistence.
              </p>
            </Card>
          </div>

          <div className="space-y-6">
            <SignaturePad
              signerName={currentSignerName}
              signerRole={signerRole}
              onChange={setCurrentSignature}
            />

            <Card className="p-6">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button onClick={goBack} variant="secondary">
                  ← Back to Review
                </Button>
                <Button onClick={continueSigning} disabled={!currentSignature}>
                  {signerRole === "Party A"
                    ? "Continue to Party B →"
                    : "Continue to Final Review →"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default SignaturePage;

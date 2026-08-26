import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ProgressSteps from "../components/ui/ProgressSteps";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";

function ReviewAgreement() {
  const navigate = useNavigate();
  const location = useLocation();
  const reviewData = location.state || {};
  const [isReviewed, setIsReviewed] = useState(false);

  const creationDate = useMemo(() => {
    if (reviewData.createdAt) {
      return new Date(reviewData.createdAt).toLocaleString();
    }

    return new Date().toLocaleString();
  }, [reviewData.createdAt]);

  const hasReviewData = Boolean(
    reviewData.partyA &&
    reviewData.partyB &&
    reviewData.amount &&
    reviewData.aiText,
  );

  const goBack = () => {
    navigate("/create-agreement", {
      state: {
        ...reviewData,
        aiText: reviewData.aiText,
      },
    });
  };

  const continueToSignature = () => {
    navigate("/signature", {
      state: {
        ...reviewData,
        agreementId: reviewData.agreementId || `DRAFT-${Date.now()}`,
        reviewed: true,
        signerRole: "Party A",
        agreementStatus: "Ready for Party A Signature",
      },
    });
  };

  if (!hasReviewData) {
    return (
      <Layout>
        <div className="page-transition">
          <Card className="mx-auto max-w-3xl p-8 text-center">
            <StatusBadge variant="warning">Draft Missing</StatusBadge>
            <h1 className="mt-4 text-2xl font-bold text-slate-950">
              Agreement review cannot be restored
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              This review step depends on the current draft session. Start from
              Create Deal to regenerate the agreement safely.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={() => navigate("/create-deal")}>
                Create Deal
              </Button>
              <Button onClick={() => navigate("/dashboard")} variant="secondary">
                Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-transition">
        <SectionHeader
          eyebrow="Agreement Review"
          title="Review agreement"
          description="Confirm the deal details and agreement text before moving into the signature phase."
        >
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge variant="success">AI Generated</StatusBadge>
            <StatusBadge variant="primary">Review Required</StatusBadge>
          </div>
        </SectionHeader>

        <ProgressSteps
          current={2}
          steps={["Create Deal", "AI Generated", "► Review", "Party A", "Party B", "Final Review"]}
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-6">
            <Card className="p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    Deal Summary
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Review these values before continuing.
                  </p>
                </div>
                <StatusBadge variant="warning">
                  {reviewData.agreementStatus || "Pending Review"}
                </StatusBadge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Amount
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                    {reviewData.amount || "Not provided"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Creation Date
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {creationDate}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Agreement Status
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {reviewData.agreementStatus || "AI Generated"}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-950">
                Parties
              </h2>

              <div className="mt-5 grid gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#1E3A8A]">
                    Party A
                  </p>
                  <p className="mt-2 break-words text-sm font-semibold text-slate-900">
                    {reviewData.partyA || "Not provided"}
                  </p>
                  {reviewData.partyAEmail && (
                    <p className="mt-1 break-words text-sm text-slate-500">
                      {reviewData.partyAEmail}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#1E3A8A]">
                    Party B
                  </p>
                  <p className="mt-2 break-words text-sm font-semibold text-slate-900">
                    {reviewData.partyB || "Not provided"}
                  </p>
                  {reviewData.partyBEmail && (
                    <p className="mt-1 break-words text-sm text-slate-500">
                      {reviewData.partyBEmail}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Agreement Text
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Read-only generated document viewer.
                </p>
              </div>
              <StatusBadge variant="primary">Read-only</StatusBadge>
            </div>

            <div className="max-h-[60vh] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <article className="mx-auto min-h-[480px] max-w-3xl rounded-xl bg-white p-6 text-sm leading-7 text-slate-800 shadow-sm sm:p-8">
                <h3 className="mb-6 text-center text-2xl font-bold text-slate-950">
                  DigiStamp Agreement
                </h3>
                <p className="whitespace-pre-line break-words">
                  {reviewData.aiText || "No agreement text was provided for review."}
                </p>
              </article>
            </div>

            <label className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <input
                type="checkbox"
                checked={isReviewed}
                onChange={(e) => setIsReviewed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#1E3A8A]"
              />
              <span className="text-sm font-semibold leading-6 text-slate-700">
                I have reviewed this agreement and confirm the details are ready
                for the signature step.
              </span>
            </label>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button onClick={goBack} variant="secondary">
                ← Back
              </Button>
              <Button onClick={continueToSignature} disabled={!isReviewed}>
                Continue to Signature →
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

export default ReviewAgreement;

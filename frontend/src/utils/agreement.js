import { AGREEMENT_STATUS } from "../constants/status";

export const generateAgreementId = () => "DS-" + Date.now();

export const buildAgreementInvitationUrl = (origin, agreementId) =>
  `${origin}/agreement/${agreementId}`;

export const buildInvitationMessage = ({ agreementId, partyA, partyB, invitationUrl }) =>
  `DigiStamp agreement invitation\n\nAgreement ID: ${agreementId}\nFrom: ${partyA || "Party A"}\nTo: ${partyB || "Party B"}\n\nReview and sign here: ${invitationUrl}`;

export const buildSignedAgreementDocument = ({
  aiText,
  form,
  partyASignature,
  partyBSignature,
}) =>
  JSON.stringify({
    agreementText: aiText,
    partyA: form.partyA,
    partyB: form.partyB,
    amount: form.amount,
    terms: form.terms,
    signatures: {
      partyA: {
        method: partyASignature?.signature?.method || "",
        value: partyASignature?.signature?.value || "",
        signedAt: partyASignature?.signedAt || "",
      },
      partyB: {
        method: partyBSignature?.signature?.method || "",
        value: partyBSignature?.signature?.value || "",
        signedAt: partyBSignature?.signedAt || "",
      },
    },
  });

export const buildSignedAgreementDocumentFromAgreement = ({
  agreement,
  partyBSignature,
}) =>
  JSON.stringify({
    agreementText: agreement.aiAgreement || "",
    partyA: agreement.partyA || "",
    partyB: agreement.partyB || "",
    amount: agreement.amount || "",
    terms: agreement.userTerms || agreement.terms || "",
    signatures: {
      partyA: {
        method: agreement.signatures?.partyA?.method || "",
        value: agreement.signatures?.partyA?.value || "",
        signedAt: agreement.signatures?.partyA?.signedAt || "",
      },
      partyB: {
        method: partyBSignature?.method || "",
        value: partyBSignature?.value || "",
        signedAt: partyBSignature?.signedAt || "",
      },
    },
  });

export const getAgreementStatusLabel = (status) => {
  if (status === AGREEMENT_STATUS.WAITING_FOR_PARTY_B) {
    return "Waiting for Party B";
  }

  if (status === AGREEMENT_STATUS.REJECTED) {
    return "Rejected";
  }

  if (
    status === AGREEMENT_STATUS.COMPLETED ||
    status === AGREEMENT_STATUS.LEGACY_COMPLETED
  ) {
    return "Completed";
  }

  if (status === AGREEMENT_STATUS.PENDING) {
    return "Pending";
  }

  return status || "Pending";
};

export const getAgreementStatusVariant = (status) => {
  if (
    status === AGREEMENT_STATUS.COMPLETED ||
    status === AGREEMENT_STATUS.LEGACY_COMPLETED
  ) {
    return "success";
  }

  if (status === AGREEMENT_STATUS.REJECTED) {
    return "danger";
  }

  if (status === AGREEMENT_STATUS.WAITING_FOR_PARTY_B) {
    return "warning";
  }

  return "primary";
};

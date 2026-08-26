import { AGREEMENT_STATUS } from "../constants/status";

export const generateAgreementId = () => "DS-" + Date.now();

export const buildAgreementInvitationUrl = (origin, agreementId) =>
  `${origin}/agreement/${agreementId}`;

export const buildInvitationMessage = ({ agreementId, partyA, partyB, invitationUrl }) =>
  `DigiStamp agreement invitation\n\nAgreement ID: ${agreementId}\nFrom: ${partyA || "Party A"}\nTo: ${partyB || "Party B"}\n\nReview and sign here: ${invitationUrl}`;

const normalizeString = (value) =>
  typeof value === "string" ? value.trim() : value ? String(value).trim() : "";

export const normalizeTimestamp = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (typeof value.seconds === "number") {
    return new Date(
      value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1000000),
    ).toISOString();
  }

  return normalizeString(value);
};

const normalizeSignature = (signatureRecord = {}) => ({
  method: normalizeString(signatureRecord.method),
  value: normalizeString(signatureRecord.value),
  signedAt: normalizeTimestamp(signatureRecord.signedAt),
});

const normalizeRouteSignature = (signatureRecord) =>
  normalizeSignature({
    method: signatureRecord?.signature?.method,
    value: signatureRecord?.signature?.value,
    signedAt: signatureRecord?.signedAt,
  });

export const stableStringify = (value) => {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
};

export const buildSignedAgreementDocument = ({
  aiText,
  form,
  partyASignature,
  partyBSignature,
}) =>
  stableStringify({
    agreementText: normalizeString(aiText),
    partyA: normalizeString(form.partyA),
    partyB: normalizeString(form.partyB),
    amount: normalizeString(form.amount),
    terms: normalizeString(form.terms),
    signatures: {
      partyA: normalizeRouteSignature(partyASignature),
      partyB: normalizeRouteSignature(partyBSignature),
    },
  });

export const buildSignedAgreementDocumentFromAgreement = ({
  agreement,
  partyBSignature,
}) =>
  stableStringify({
    agreementText: normalizeString(agreement.aiAgreement),
    partyA: normalizeString(agreement.partyA),
    partyB: normalizeString(agreement.partyB),
    amount: normalizeString(agreement.amount),
    terms: normalizeString(agreement.userTerms || agreement.terms),
    signatures: {
      partyA: normalizeSignature(agreement.signatures?.partyA),
      partyB: normalizeSignature(partyBSignature || agreement.signatures?.partyB),
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

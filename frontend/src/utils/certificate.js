export const generateCertificateId = () => {
  const year = new Date().getFullYear();
  const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  return `DS-${year}-${randomPart}`;
};

const hashString = (value) => {
  let hash = 0;
  const input = String(value || "");

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(16).padStart(8, "0").slice(0, 8).toUpperCase();
};

export const generateCertificateIdForAgreement = (agreementId, issuedAt = new Date()) =>
  `DS-${new Date(issuedAt).getFullYear()}-${hashString(agreementId)}`;

export const buildVerificationUrl = (origin, certificateId) =>
  `${origin}/verify/${certificateId}`;

export const getAgreementSha256 = (agreement) =>
  agreement?.sha256 || agreement?.securityHash || "";

export const getCertificateVerificationResult = (certificate, agreement) => {
  if (!certificate) {
    return "not-found";
  }

  if (!agreement) {
    return "tampered";
  }

  const certificateHash = certificate.sha256 || "";
  const agreementHash = getAgreementSha256(agreement);

  if (!certificateHash || !agreementHash) {
    return "tampered";
  }

  return certificateHash === agreementHash ? "verified" : "tampered";
};

export const formatCertificateDate = (issuedAt) => {
  if (!issuedAt) {
    return "Not available";
  }

  if (issuedAt.toDate) {
    return issuedAt.toDate().toLocaleString();
  }

  return new Date(issuedAt).toLocaleString();
};

export const getVerificationStatusTitle = (result) => {
  if (result === "verified") {
    return "✓ VERIFIED";
  }

  if (result === "tampered") {
    return "Certificate Tampered";
  }

  if (result === "error") {
    return "Verification Error";
  }

  return "Certificate Not Found";
};

export const getVerificationStatusCardClass = (result) => {
  if (result === "verified") {
    return "border-emerald-100 bg-emerald-50";
  }

  if (result === "tampered") {
    return "border-red-100 bg-red-50";
  }

  if (result === "error") {
    return "border-amber-100 bg-amber-50";
  }

  return "border-slate-200 bg-slate-50";
};

export const getVerificationStatusTextClass = (result) => {
  if (result === "verified") {
    return "text-emerald-700";
  }

  if (result === "tampered") {
    return "text-red-700";
  }

  if (result === "error") {
    return "text-amber-700";
  }

  return "text-slate-700";
};

export const getVerificationStatusVariant = (result) => {
  if (result === "verified") {
    return "success";
  }

  if (result === "tampered") {
    return "danger";
  }

  if (result === "error") {
    return "warning";
  }

  return "default";
};

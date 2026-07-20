export const generateCertificateId = () => {
  const year = new Date().getFullYear();
  const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  return `DS-${year}-${randomPart}`;
};

export const buildVerificationUrl = (origin, certificateId) =>
  `${origin}/certificate/${certificateId}`;

export const getAgreementSha256 = (agreement) =>
  agreement?.sha256 || agreement?.securityHash || "";

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

  return "Certificate Not Found";
};

export const getVerificationStatusCardClass = (result) => {
  if (result === "verified") {
    return "border-emerald-100 bg-emerald-50";
  }

  if (result === "tampered") {
    return "border-red-100 bg-red-50";
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

  return "text-slate-700";
};

export const getVerificationStatusVariant = (result) => {
  if (result === "verified") {
    return "success";
  }

  if (result === "tampered") {
    return "danger";
  }

  return "default";
};

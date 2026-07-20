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

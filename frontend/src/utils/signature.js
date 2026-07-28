export const getSignatureRecord = (signatures, role) =>
  signatures?.[role] || null;

export const formatSignedAt = (signedAt) => {
  if (!signedAt) {
    return "Pending";
  }

  if (signedAt.toDate) {
    return signedAt.toDate().toLocaleString();
  }

  return new Date(signedAt).toLocaleString();
};

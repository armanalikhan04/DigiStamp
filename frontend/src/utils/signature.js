export const getSignatureRecord = (signatures, role) =>
  signatures?.[role] || null;

export const formatSignedAt = (signedAt) => {
  if (!signedAt) {
    return "Pending";
  }

  return new Date(signedAt).toLocaleString();
};

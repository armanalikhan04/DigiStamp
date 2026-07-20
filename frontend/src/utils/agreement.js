export const generateAgreementId = () => "DS-" + Date.now();

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

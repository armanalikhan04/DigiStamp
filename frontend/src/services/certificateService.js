import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { generateCertificateIdForAgreement } from "../utils/certificate";
import { db } from "./firebase";

export const createCertificate = (certificateId, certificateData) =>
  setDoc(doc(db, "certificates", certificateId), certificateData);

export const getCertificateById = async (certificateId) => {
  const certificateSnapshot = await getDoc(doc(db, "certificates", certificateId));

  if (!certificateSnapshot.exists()) {
    return null;
  }

  return {
    id: certificateSnapshot.id,
    ...certificateSnapshot.data(),
  };
};

export const subscribeCertificateById = (certificateId, onChange, onError) => {
  if (!certificateId) {
    onChange(null);
    return () => {};
  }

  return onSnapshot(
    doc(db, "certificates", certificateId),
    (certificateSnapshot) => {
      if (!certificateSnapshot.exists()) {
        onChange(null);
        return;
      }

      onChange({
        id: certificateSnapshot.id,
        ...certificateSnapshot.data(),
      });
    },
    onError,
  );
};

export const getCertificateByAgreementId = async (agreementId) => {
  const certificateQuery = query(
    collection(db, "certificates"),
    where("agreementId", "==", agreementId),
  );
  const certificateSnapshot = await getDocs(certificateQuery);

  if (certificateSnapshot.empty) {
    return null;
  }

  const certificateDoc = certificateSnapshot.docs[0];

  return {
    id: certificateDoc.id,
    ...certificateDoc.data(),
  };
};

export const createCertificateIfMissing = async (certificateId, certificateData) => {
  const idempotentCertificateId =
    certificateData.certificateId ||
    certificateId ||
    generateCertificateIdForAgreement(certificateData.agreementId, certificateData.issuedAt);
  const certificateSnapshot = await getDoc(doc(db, "certificates", idempotentCertificateId));

  if (certificateSnapshot.exists()) {
    return {
      id: certificateSnapshot.id,
      ...certificateSnapshot.data(),
    };
  }

  let existingCertificate = null;

  try {
    existingCertificate = await getCertificateByAgreementId(certificateData.agreementId);
  } catch (error) {
    if (error.code !== "permission-denied") {
      throw error;
    }
  }

  if (existingCertificate) {
    return existingCertificate;
  }

  await createCertificate(idempotentCertificateId, {
    ...certificateData,
    certificateId: idempotentCertificateId,
  });

  return {
    id: idempotentCertificateId,
    ...certificateData,
    certificateId: idempotentCertificateId,
  };
};

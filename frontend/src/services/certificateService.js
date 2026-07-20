import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export const createCertificate = (certificateId, certificateData) =>
  setDoc(doc(db, "certificates", certificateId), certificateData);

export const getCertificateById = async (certificateId) => {
  const certificateSnapshot = await getDoc(doc(db, "certificates", certificateId));

  if (!certificateSnapshot.exists()) {
    return null;
  }

  return certificateSnapshot.data();
};

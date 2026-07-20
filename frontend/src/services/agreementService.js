import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export const createAgreement = (agreementData) =>
  addDoc(collection(db, "agreements"), agreementData);

export const getAgreementById = async (agreementId) => {
  const agreementQuery = query(
    collection(db, "agreements"),
    where("agreementId", "==", agreementId),
  );
  const agreementSnapshot = await getDocs(agreementQuery);

  if (agreementSnapshot.empty) {
    return null;
  }

  return agreementSnapshot.docs[0].data();
};

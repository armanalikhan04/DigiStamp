import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { AGREEMENT_STATUS, PARTY_STATUS } from "../constants/status";
import { db } from "./firebase";

export const createAgreement = (agreementData) =>
  addDoc(collection(db, "agreements"), agreementData);

const getAgreementSnapshotById = async (agreementId) => {
  const agreementQuery = query(
    collection(db, "agreements"),
    where("agreementId", "==", agreementId),
  );
  const agreementSnapshot = await getDocs(agreementQuery);

  if (agreementSnapshot.empty) {
    return null;
  }

  return agreementSnapshot.docs[0];
};

export const getAgreementById = async (agreementId) => {
  const agreementDoc = await getAgreementSnapshotById(agreementId);

  if (!agreementDoc) {
    return null;
  }

  return {
    id: agreementDoc.id,
    ...agreementDoc.data(),
  };
};

export const getAgreements = async () => {
  let agreementsSnapshot;

  try {
    const agreementsQuery = query(
      collection(db, "agreements"),
      orderBy("createdAt", "desc"),
    );
    agreementsSnapshot = await getDocs(agreementsQuery);
  } catch {
    agreementsSnapshot = await getDocs(collection(db, "agreements"));
  }

  return agreementsSnapshot.docs.map((agreementDoc) => ({
    id: agreementDoc.id,
    ...agreementDoc.data(),
  }));
};

export const subscribeAgreementById = (agreementId, onChange, onError) => {
  if (!agreementId) {
    onChange(null);
    return () => {};
  }

  const agreementQuery = query(
    collection(db, "agreements"),
    where("agreementId", "==", agreementId),
  );

  return onSnapshot(
    agreementQuery,
    (agreementSnapshot) => {
      if (agreementSnapshot.empty) {
        onChange(null);
        return;
      }

      const agreementDoc = agreementSnapshot.docs[0];
      onChange({
        id: agreementDoc.id,
        ...agreementDoc.data(),
      });
    },
    onError,
  );
};

export const subscribeAgreements = (onChange, onError) => {
  let fallbackUnsubscribe = null;
  const handleSnapshot = (agreementsSnapshot) => {
    onChange(
      agreementsSnapshot.docs.map((agreementDoc) => ({
        id: agreementDoc.id,
        ...agreementDoc.data(),
      })),
    );
  };

  const unsubscribe = onSnapshot(
    query(collection(db, "agreements"), orderBy("createdAt", "desc")),
    handleSnapshot,
    (subscriptionError) => {
      console.error(subscriptionError);
      fallbackUnsubscribe = onSnapshot(
        collection(db, "agreements"),
        handleSnapshot,
        onError,
      );
    },
  );

  return () => {
    unsubscribe();

    if (fallbackUnsubscribe) {
      fallbackUnsubscribe();
    }
  };
};

export const updateAgreementById = async (agreementId, updates) => {
  const agreementDoc = await getAgreementSnapshotById(agreementId);

  if (!agreementDoc) {
    throw new Error("Agreement not found.");
  }

  await updateDoc(agreementDoc.ref, updates);
};

const ensurePartyBCanUpdate = (agreementData) => {
  if (
    agreementData.agreementStatus === AGREEMENT_STATUS.COMPLETED ||
    agreementData.agreementStatus === AGREEMENT_STATUS.LEGACY_COMPLETED
  ) {
    throw new Error("Agreement is already completed.");
  }

  if (agreementData.agreementStatus === AGREEMENT_STATUS.REJECTED) {
    throw new Error("Agreement is already rejected.");
  }
};

export const markPartyBReviewed = async (agreementId) => {
  const agreementDoc = await getAgreementSnapshotById(agreementId);

  if (!agreementDoc) {
    throw new Error("Agreement not found.");
  }

  ensurePartyBCanUpdate(agreementDoc.data());

  await updateDoc(agreementDoc.ref, {
    partyBStatus: PARTY_STATUS.REVIEWED,
  });
};

export const rejectAgreementByPartyB = async (agreementId) => {
  const agreementDoc = await getAgreementSnapshotById(agreementId);

  if (!agreementDoc) {
    throw new Error("Agreement not found.");
  }

  ensurePartyBCanUpdate(agreementDoc.data());

  await updateDoc(agreementDoc.ref, {
    partyBStatus: PARTY_STATUS.REJECTED,
    agreementStatus: AGREEMENT_STATUS.REJECTED,
  });
};

export const signPartyBAgreement = async ({ agreementId, signature, securityHash }) => {
  const agreementDoc = await getAgreementSnapshotById(agreementId);

  if (!agreementDoc) {
    throw new Error("Agreement not found.");
  }

  const agreementData = agreementDoc.data();
  ensurePartyBCanUpdate(agreementData);

  if (agreementData.partyBStatus === PARTY_STATUS.SIGNED) {
    throw new Error("Party B has already signed this agreement.");
  }

  await updateDoc(agreementDoc.ref, {
    partyBStatus: PARTY_STATUS.SIGNED,
    securityHash,
    "signatures.partyB": {
      method: signature.method,
      value: signature.value,
      signedAt: Timestamp.fromDate(new Date(signature.signedAt)),
    },
  });
};

export const markAgreementCompleted = ({
  agreementId,
  certificateId,
  securityHash,
}) =>
  updateAgreementById(agreementId, {
    agreementStatus: AGREEMENT_STATUS.COMPLETED,
    certificateId,
    certificateStatus: "Verified",
    securityHash,
  });

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { AGREEMENT_STATUS, PARTY_STATUS } from "../constants/status";
import { generateCertificateIdForAgreement } from "../utils/certificate";
import { db } from "./firebase";

export const createAgreement = async (agreementData) => {
  if (!agreementData.agreementId) {
    return addDoc(collection(db, "agreements"), agreementData);
  }

  const agreementRef = doc(db, "agreements", agreementData.agreementId);
  await setDoc(agreementRef, agreementData);

  return agreementRef;
};

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const buildScopedAgreementQueries = (agreementId, viewer = {}) => {
  const normalizedEmail = normalizeEmail(viewer.email);
  const scopedQueries = [];

  if (viewer.uid) {
    scopedQueries.push(
      query(
        collection(db, "agreements"),
        where("agreementId", "==", agreementId),
        where("createdBy", "==", viewer.uid),
      ),
    );
  }

  if (normalizedEmail) {
    scopedQueries.push(
      query(
        collection(db, "agreements"),
        where("agreementId", "==", agreementId),
        where("createdByEmail", "==", normalizedEmail),
      ),
    );
    scopedQueries.push(
      query(
        collection(db, "agreements"),
        where("agreementId", "==", agreementId),
        where("partyBEmail", "==", normalizedEmail),
      ),
    );
  }

  return scopedQueries;
};

const getAgreementSnapshotById = async (agreementId, viewer = {}) => {
  const agreementRef = doc(db, "agreements", agreementId);
  const directAgreementSnapshot = await getDoc(agreementRef);

  if (directAgreementSnapshot.exists()) {
    return directAgreementSnapshot;
  }

  const legacyQueries = buildScopedAgreementQueries(agreementId, viewer);

  for (const legacyQuery of legacyQueries) {
    const agreementSnapshot = await getDocs(legacyQuery);

    if (!agreementSnapshot.empty) {
      return agreementSnapshot.docs[0];
    }
  }

  return null;
};

const sortAgreementsByCreatedAt = (agreements) =>
  [...agreements].sort((firstAgreement, secondAgreement) => {
    const firstCreatedAt = firstAgreement.createdAt?.toMillis?.() || 0;
    const secondCreatedAt = secondAgreement.createdAt?.toMillis?.() || 0;
    return secondCreatedAt - firstCreatedAt;
  });

const mergeAgreementSnapshots = (snapshots) => {
  const agreementMap = new Map();

  snapshots.forEach((agreementSnapshot) => {
    agreementSnapshot.docs.forEach((agreementDoc) => {
      agreementMap.set(agreementDoc.id, {
        id: agreementDoc.id,
        ...agreementDoc.data(),
      });
    });
  });

  return sortAgreementsByCreatedAt(Array.from(agreementMap.values()));
};

export const getAgreementById = async (agreementId, viewer = {}) => {
  const agreementDoc = await getAgreementSnapshotById(agreementId, viewer);

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

export const subscribeAgreementById = (agreementId, onChange, onError, viewer = {}) => {
  if (!agreementId) {
    onChange(null);
    return () => {};
  }

  let isActive = true;
  let fallbackUnsubscribe = null;
  const agreementRef = doc(db, "agreements", agreementId);

  const unsubscribe = onSnapshot(
    agreementRef,
    (agreementSnapshot) => {
      if (!isActive) {
        return;
      }

      if (!agreementSnapshot.exists()) {
        const legacyQueries = buildScopedAgreementQueries(agreementId, viewer);

        if (fallbackUnsubscribe || legacyQueries.length === 0) {
          onChange(null);
          return;
        }

        let hasLegacyMatch = false;
        const legacyUnsubscribers = legacyQueries.map((legacyQuery) =>
          onSnapshot(
            legacyQuery,
            (legacySnapshot) => {
              if (!isActive) {
                return;
              }

              if (legacySnapshot.empty) {
                if (!hasLegacyMatch) {
                  onChange(null);
                }
                return;
              }

              hasLegacyMatch = true;
              const agreementDoc = legacySnapshot.docs[0];
              onChange({
                id: agreementDoc.id,
                ...agreementDoc.data(),
              });
            },
            onError,
          ),
        );

        fallbackUnsubscribe = () => {
          legacyUnsubscribers.forEach((unsubscribeLegacy) => unsubscribeLegacy());
        };
        onChange(null);
        return;
      }

      onChange({
        id: agreementSnapshot.id,
        ...agreementSnapshot.data(),
      });
    },
    onError,
  );

  return () => {
    isActive = false;
    unsubscribe();

    if (fallbackUnsubscribe) {
      fallbackUnsubscribe();
    }
  };
};

export const subscribeAgreements = (onChange, onError) => {
  let fallbackUnsubscribe = null;
  let isActive = true;
  const handleSnapshot = (agreementsSnapshot) => {
    if (!isActive) {
      return;
    }

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
    () => {
      if (!isActive) {
        return;
      }

      fallbackUnsubscribe = onSnapshot(
        collection(db, "agreements"),
        handleSnapshot,
        onError,
      );
    },
  );

  return () => {
    isActive = false;
    unsubscribe();

    if (fallbackUnsubscribe) {
      fallbackUnsubscribe();
    }
  };
};

export const subscribeAgreementsForUser = ({ uid, email }, onChange, onError) => {
  const normalizedEmail = normalizeEmail(email);

  if (!uid && !normalizedEmail) {
    onChange([]);
    return () => {};
  }

  let isActive = true;
  const snapshotsByQuery = new Map();
  const unsubscribers = [];

  const publish = () => {
    if (!isActive) {
      return;
    }

    onChange(mergeAgreementSnapshots(Array.from(snapshotsByQuery.values())));
  };

  const queries = [];

  if (normalizedEmail) {
    queries.push([
      "createdByEmail",
      query(collection(db, "agreements"), where("createdByEmail", "==", normalizedEmail)),
    ]);
    queries.push([
      "partyBEmail",
      query(collection(db, "agreements"), where("partyBEmail", "==", normalizedEmail)),
    ]);
  }

  if (uid) {
    queries.push([
      "createdBy",
      query(collection(db, "agreements"), where("createdBy", "==", uid)),
    ]);
  }

  queries.forEach(([key, agreementQuery]) => {
    const unsubscribe = onSnapshot(
      agreementQuery,
      (agreementSnapshot) => {
        snapshotsByQuery.set(key, agreementSnapshot);
        publish();
      },
      (subscriptionError) => {
        if (isActive) {
          onError(subscriptionError);
        }
      },
    );
    unsubscribers.push(unsubscribe);
  });

  return () => {
    isActive = false;
    unsubscribers.forEach((unsubscribe) => unsubscribe());
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

const ensurePartyBAuthorized = (agreementData, userEmail) => {
  const expectedEmail = normalizeEmail(agreementData.partyBEmail);
  const currentEmail = normalizeEmail(userEmail);

  if (!expectedEmail) {
    throw new Error("Party B email is missing from this agreement.");
  }

  if (!currentEmail || currentEmail !== expectedEmail) {
    throw new Error("Access denied. This invitation is assigned to a different Party B email.");
  }
};

export const markPartyBReviewed = async (agreementId, userEmail) => {
  const agreementDoc = await getAgreementSnapshotById(agreementId, {
    email: userEmail,
  });

  if (!agreementDoc) {
    throw new Error("Agreement not found.");
  }

  const agreementData = agreementDoc.data();
  ensurePartyBAuthorized(agreementData, userEmail);
  ensurePartyBCanUpdate(agreementData);

  if (agreementData.partyBStatus === PARTY_STATUS.REVIEWED) {
    return;
  }

  if (agreementData.partyBStatus === PARTY_STATUS.SIGNED) {
    throw new Error("Party B has already signed this agreement.");
  }

  await updateDoc(agreementDoc.ref, {
    partyBStatus: PARTY_STATUS.REVIEWED,
  });
};

export const rejectAgreementByPartyB = async (agreementId, userEmail) => {
  const agreementDoc = await getAgreementSnapshotById(agreementId, {
    email: userEmail,
  });

  if (!agreementDoc) {
    throw new Error("Agreement not found.");
  }

  const agreementData = agreementDoc.data();
  ensurePartyBAuthorized(agreementData, userEmail);
  ensurePartyBCanUpdate(agreementData);

  if (agreementData.partyBStatus === PARTY_STATUS.SIGNED) {
    throw new Error("Signed agreements cannot be rejected.");
  }

  await updateDoc(agreementDoc.ref, {
    partyBStatus: PARTY_STATUS.REJECTED,
    agreementStatus: AGREEMENT_STATUS.REJECTED,
  });
};

export const signPartyBAgreement = async ({ agreementId, signature, securityHash, userEmail }) => {
  const agreementDoc = await getAgreementSnapshotById(agreementId, {
    email: userEmail,
  });

  if (!agreementDoc) {
    throw new Error("Agreement not found.");
  }

  const agreementData = agreementDoc.data();
  ensurePartyBAuthorized(agreementData, userEmail);
  ensurePartyBCanUpdate(agreementData);

  if (agreementData.partyAStatus !== PARTY_STATUS.SIGNED) {
    throw new Error("Party A must sign before Party B can sign.");
  }

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

export const completeAgreementWithPartyBSignature = async ({
  agreementId,
  userEmail,
  signature,
  securityHash,
  certificateData,
}) => {
  const agreementDoc = await getAgreementSnapshotById(agreementId, {
    email: userEmail,
  });

  if (!agreementDoc) {
    throw new Error("Agreement not found.");
  }

  return runTransaction(db, async (transaction) => {
    const agreementSnapshot = await transaction.get(agreementDoc.ref);

    if (!agreementSnapshot.exists()) {
      throw new Error("Agreement not found.");
    }

    const agreementData = agreementSnapshot.data();
    ensurePartyBAuthorized(agreementData, userEmail);

    const isCompleted =
      agreementData.agreementStatus === AGREEMENT_STATUS.COMPLETED ||
      agreementData.agreementStatus === AGREEMENT_STATUS.LEGACY_COMPLETED;

    if (isCompleted) {
      if (!agreementData.certificateId) {
        throw new Error("Agreement is completed but the certificate is missing.");
      }

      return {
        alreadyCompleted: true,
        certificateId: agreementData.certificateId,
        securityHash: agreementData.securityHash,
      };
    }

    ensurePartyBCanUpdate(agreementData);

    if (agreementData.partyAStatus !== PARTY_STATUS.SIGNED) {
      throw new Error("Party A must sign before Party B can sign.");
    }

    if (agreementData.partyBStatus === PARTY_STATUS.SIGNED) {
      throw new Error("Party B has already signed this agreement.");
    }

    if (!signature?.method || !signature?.value || !signature?.signedAt) {
      throw new Error("A complete Party B signature is required.");
    }

    const certificateId =
      agreementData.certificateId ||
      certificateData?.certificateId ||
      generateCertificateIdForAgreement(agreementId, certificateData?.issuedAt);
    const certificateRef = doc(db, "certificates", certificateId);
    const certificateSnapshot = await transaction.get(certificateRef);
    const certificatePayload = {
      ...certificateData,
      agreementId,
      certificateId,
      sha256: securityHash,
      status: "Verified",
    };

    if (certificateSnapshot.exists()) {
      const existingCertificate = certificateSnapshot.data();

      if (existingCertificate.agreementId !== agreementId) {
        throw new Error("Certificate ID conflict detected.");
      }

      if (existingCertificate.sha256 && existingCertificate.sha256 !== securityHash) {
        throw new Error("Existing certificate hash does not match this signed agreement.");
      }
    } else {
      transaction.set(certificateRef, certificatePayload);
    }

    transaction.update(agreementDoc.ref, {
      agreementStatus: AGREEMENT_STATUS.COMPLETED,
      partyBStatus: PARTY_STATUS.SIGNED,
      certificateId,
      certificateStatus: "Verified",
      securityHash,
      "signatures.partyB": {
        method: signature.method,
        value: signature.value,
        signedAt: Timestamp.fromDate(new Date(signature.signedAt)),
      },
    });

    return {
      alreadyCompleted: false,
      certificateId,
      securityHash,
    };
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

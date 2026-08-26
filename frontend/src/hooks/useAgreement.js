import { useCallback, useEffect, useState } from "react";
import {
  getAgreementById,
  subscribeAgreementById,
} from "../services/agreementService";
import { useAuth } from "../context/useAuth";

export const useAgreement = (agreementId) => {
  const { user } = useAuth();
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(Boolean(agreementId));
  const [error, setError] = useState("");

  const loadAgreement = useCallback(async () => {
    if (!agreementId) {
      setAgreement(null);
      setError("");
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);
      setError("");

      const agreementData = await getAgreementById(agreementId, {
        uid: user?.uid,
        email: user?.email,
      });

      if (!agreementData) {
        setAgreement(null);
        setError("Agreement not found.");
        return null;
      }

      setAgreement(agreementData);
      return agreementData;
    } catch (loadError) {
      console.error(loadError);
      setAgreement(null);
      setError(
        loadError.code === "permission-denied"
          ? "Access denied."
          : "Unable to load agreement.",
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, [agreementId, user]);

  useEffect(() => {
    if (!agreementId) {
      setAgreement(null);
      setError("");
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError("");

    return subscribeAgreementById(
      agreementId,
      (agreementData) => {
        if (!agreementData) {
          setAgreement(null);
          setError("Agreement not found.");
        } else {
          setAgreement(agreementData);
          setError("");
        }

        setLoading(false);
      },
      (subscriptionError) => {
        console.error(subscriptionError);
        setAgreement(null);
        setError(
          subscriptionError.code === "permission-denied"
            ? "Access denied."
            : "Unable to load agreement.",
        );
        setLoading(false);
      },
      {
        uid: user?.uid,
        email: user?.email,
      },
    );
  }, [agreementId, user]);

  return { agreement, loading, error, refetch: loadAgreement, setAgreement };
};

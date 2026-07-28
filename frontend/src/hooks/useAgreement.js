import { useCallback, useEffect, useState } from "react";
import {
  getAgreementById,
  subscribeAgreementById,
} from "../services/agreementService";

export const useAgreement = (agreementId) => {
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

      const agreementData = await getAgreementById(agreementId);

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
      setError("Unable to load agreement.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [agreementId]);

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
        setError("Unable to load agreement.");
        setLoading(false);
      },
    );
  }, [agreementId]);

  return { agreement, loading, error, refetch: loadAgreement, setAgreement };
};

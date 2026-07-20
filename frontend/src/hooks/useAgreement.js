import { useEffect, useState } from "react";
import { getAgreementById } from "../services/agreementService";

export const useAgreement = (agreementId) => {
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(Boolean(agreementId));
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadAgreement = async () => {
      if (!agreementId) {
        setAgreement(null);
        setError("");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const agreementData = await getAgreementById(agreementId);

        if (!isMounted) {
          return;
        }

        if (!agreementData) {
          setAgreement(null);
          setError("Agreement not found.");
          return;
        }

        setAgreement(agreementData);
      } catch (loadError) {
        console.error(loadError);

        if (isMounted) {
          setAgreement(null);
          setError("Unable to load agreement.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAgreement();

    return () => {
      isMounted = false;
    };
  }, [agreementId]);

  return { agreement, loading, error };
};

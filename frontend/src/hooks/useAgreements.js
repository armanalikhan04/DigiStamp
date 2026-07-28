import { useEffect, useState } from "react";
import { subscribeAgreements } from "../services/agreementService";

export const useAgreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    return subscribeAgreements(
      (agreementList) => {
        setAgreements(agreementList);
        setLoading(false);
      },
      (loadError) => {
        console.error(loadError);
        setError("Unable to load agreements.");
        setLoading(false);
      },
    );
  }, []);

  return { agreements, loading, error };
};

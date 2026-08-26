import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { subscribeAgreementsForUser } from "../services/agreementService";

export const useAgreements = () => {
  const { user, loading: authLoading } = useAuth();
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) {
      return undefined;
    }

    if (!user) {
      setAgreements([]);
      setLoading(false);
      setError("");
      return undefined;
    }

    setLoading(true);
    setError("");

    return subscribeAgreementsForUser(
      {
        uid: user.uid,
        email: user.email,
      },
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
  }, [authLoading, user]);

  return { agreements, loading, error };
};

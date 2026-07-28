import { useEffect, useState } from "react";
import { subscribeCertificateById } from "../services/certificateService";

export const useCertificate = (certificateId) => {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(Boolean(certificateId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!certificateId) {
      setCertificate(null);
      setError("Certificate not found.");
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError("");

    return subscribeCertificateById(
      certificateId,
      (certificateData) => {
        if (!certificateData) {
          setCertificate(null);
          setError("Certificate not found.");
        } else {
          setCertificate(certificateData);
          setError("");
        }

        setLoading(false);
      },
      (loadError) => {
        console.error(loadError);
        setCertificate(null);
        setError("Unable to load certificate.");
        setLoading(false);
      },
    );
  }, [certificateId]);

  return { certificate, loading, error };
};

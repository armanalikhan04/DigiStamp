import { useEffect, useState } from "react";
import { getCertificateById } from "../services/certificateService";

export const useCertificate = (certificateId) => {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(Boolean(certificateId));
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCertificate = async () => {
      if (!certificateId) {
        setCertificate(null);
        setError("Certificate not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const certificateData = await getCertificateById(certificateId);

        if (!isMounted) {
          return;
        }

        if (!certificateData) {
          setCertificate(null);
          setError("Certificate not found.");
          return;
        }

        setCertificate(certificateData);
      } catch (loadError) {
        console.error(loadError);

        if (isMounted) {
          setCertificate(null);
          setError("Unable to load certificate.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCertificate();

    return () => {
      isMounted = false;
    };
  }, [certificateId]);

  return { certificate, loading, error };
};

import { useState } from "react";
import { db } from "../services/firebase";
import { uploadImage } from "../services/cloudinary";
import { doc, setDoc } from "firebase/firestore";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import InputField from "../components/ui/InputField";
import ProgressSteps from "../components/ui/ProgressSteps";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";

function Verification() {
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    idType: "",
    idNumber: "",
  });

  const [idImage, setIdImage] = useState(null);
  const [faceImage, setFaceImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const saveProfile = async () => {
    if (!profile.name || !profile.phone || !profile.idType || !profile.idNumber) {
      alert("Please fill all fields.");
      return;
    }

    if (!idImage || !faceImage) {
      alert("Please upload both Government ID and Face Photo.");
      return;
    }

    try {
      setLoading(true);

      const idURL = await uploadImage(idImage);
      const faceURL = await uploadImage(faceImage);

      await setDoc(doc(db, "users", profile.phone), {
        ...profile,
        idProof: idURL,
        facePhoto: faceURL,
        verificationStatus: "Verified",
        createdAt: new Date(),
      });

      alert("✅ Identity Verification Completed Successfully");

      setProfile({
        name: "",
        phone: "",
        idType: "",
        idNumber: "",
      });

      setIdImage(null);
      setFaceImage(null);
    } catch (error) {
      console.error(error);
      alert("Verification Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
    <div className="page-transition">
      <SectionHeader
        eyebrow="Identity Verification"
        title="Complete your verification"
        description="Upload identity details and photos before creating high-trust digital agreements."
      >
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusBadge variant="primary">Cloudinary upload</StatusBadge>
          <StatusBadge variant="success">Firestore profile</StatusBadge>
        </div>
      </SectionHeader>

      <ProgressSteps
        current={1}
        steps={["Login", "Identity", "Deal", "Agreement"]}
      />

      <Card className="mt-8 max-w-3xl p-6 sm:p-8">
        <div className="mb-6 border-b border-slate-200 pb-5">
          <h2 className="text-xl font-bold text-slate-950">
            Government ID and face verification
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Keep the details accurate. These records support agreement trust and identity checks.
          </p>
        </div>

        <div className="mt-8 space-y-5">

          <InputField
            type="text"
            name="name"
            label="Full name"
            placeholder="Full Name"
            value={profile.name}
            onChange={handleChange}
          />

          <InputField
            type="text"
            name="phone"
            label="Phone number"
            placeholder="Phone Number"
            value={profile.phone}
            onChange={handleChange}
          />

          <InputField
            as="select"
            name="idType"
            label="Government ID type"
            value={profile.idType}
            onChange={handleChange}
          >
            <option value="">Select Government ID</option>
            <option>Aadhaar Card</option>
            <option>PAN Card</option>
            <option>Driving License</option>
            <option>Passport</option>
          </InputField>

          <InputField
            type="text"
            name="idNumber"
            label="Government ID number"
            placeholder="Government ID Number"
            value={profile.idNumber}
            onChange={handleChange}
          />

          <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
            <label className="block text-sm font-semibold text-slate-700">
              Upload Government ID
            </label>
            <p className="mt-1 text-xs text-slate-500">Image files only.</p>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setIdImage(e.target.files[0])}
              className="mt-4 block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-[#1E3A8A] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
            <label className="block text-sm font-semibold text-slate-700">
              Upload Face Photo
            </label>
            <p className="mt-1 text-xs text-slate-500">Use a clear front-facing image.</p>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFaceImage(e.target.files[0])}
              className="mt-4 block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-[#1E3A8A] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
          </div>
          </div>

          <Button
            onClick={saveProfile}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Verifying..." : "Verify Identity"}
          </Button>

        </div>
      </Card>
    </div>
    </Layout>
  );
}

export default Verification;

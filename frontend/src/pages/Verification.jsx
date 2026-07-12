import { useState } from "react";
import { db } from "../services/firebase";
import { uploadImage } from "../services/cloudinary";
import { doc, setDoc } from "firebase/firestore";

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
    <div className="min-h-screen bg-slate-100 flex justify-center items-center p-8">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-2xl p-8">

        <h1 className="text-3xl font-bold text-center text-blue-600">
          Identity Verification 🛡
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Complete your identity verification before creating digital agreements.
        </p>

        <div className="mt-8 space-y-5">

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={profile.name}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={profile.phone}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <select
            name="idType"
            value={profile.idType}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          >
            <option value="">Select Government ID</option>
            <option>Aadhaar Card</option>
            <option>PAN Card</option>
            <option>Driving License</option>
            <option>Passport</option>
          </select>

          <input
            type="text"
            name="idNumber"
            placeholder="Government ID Number"
            value={profile.idNumber}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <div>
            <label className="font-semibold block mb-2">
              Upload Government ID 📄
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setIdImage(e.target.files[0])}
            />
          </div>

          <div>
            <label className="font-semibold block mb-2">
              Upload Face Photo 📷
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFaceImage(e.target.files[0])}
            />
          </div>

          <button
            onClick={saveProfile}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Verifying..." : "Verify Identity"}
          </button>

        </div>
      </div>
    </div>
  );
}

export default Verification;
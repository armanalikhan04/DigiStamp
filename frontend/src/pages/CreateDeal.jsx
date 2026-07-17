import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateDeal() {
  const navigate = useNavigate();

  const [deal, setDeal] = useState({
    dealType: "Loan",
    partyAName: "",
    partyAEmail: "",
    partyBName: "",
    partyBEmail: "",
    amount: "",
    description: "",
  });

  const handleChange = (e) => {
    setDeal({
      ...deal,
      [e.target.name]: e.target.value,
    });
  };

  const continueToAgreement = () => {
    if (
      !deal.partyAName ||
      !deal.partyAEmail ||
      !deal.partyBName ||
      !deal.partyBEmail ||
      !deal.amount ||
      !deal.description
    ) {
      alert("Please fill all required fields.");
      return;
    }

    navigate("/create-agreement", {
      state: deal,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center p-10">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl">

        {/* Header */}
        <div className="bg-[#1E3A8A] text-white rounded-t-2xl p-8">
          <h1 className="text-4xl font-bold">
            Create New Deal 🤝
          </h1>

          <p className="mt-2 text-blue-100">
            Start a secure and legally verifiable digital agreement.
          </p>
        </div>

        <div className="p-10 space-y-8">

          {/* Deal Type */}

          <div>
            <label className="block font-semibold mb-2">
              Deal Type
            </label>

            <select
              name="dealType"
              value={deal.dealType}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            >
              <option>Loan</option>
              <option>Freelance Work</option>
              <option>Rent Agreement</option>
              <option>Business Partnership</option>
              <option>Service Agreement</option>
            </select>
          </div>

          {/* Party Information */}

          <div className="grid grid-cols-2 gap-8">

            <div>

              <h2 className="text-xl font-bold text-[#1E3A8A] mb-4">
                Party A
              </h2>

              <input
                name="partyAName"
                placeholder="Full Name"
                value={deal.partyAName}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 mb-4"
              />

              <input
                name="partyAEmail"
                placeholder="Email Address"
                value={deal.partyAEmail}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />

            </div>

            <div>

              <h2 className="text-xl font-bold text-[#1E3A8A] mb-4">
                Party B
              </h2>

              <input
                name="partyBName"
                placeholder="Full Name"
                value={deal.partyBName}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 mb-4"
              />

              <input
                name="partyBEmail"
                placeholder="Email Address"
                value={deal.partyBEmail}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />

            </div>

          </div>

          {/* Deal Details */}

          <div>

            <h2 className="text-xl font-bold text-[#1E3A8A] mb-4">
              Deal Details
            </h2>

            <input
              type="number"
              name="amount"
              placeholder="Amount (₹)"
              value={deal.amount}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 mb-4"
            />

            <textarea
              rows="6"
              name="description"
              placeholder="Describe the agreement..."
              value={deal.description}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            />

          </div>

          {/* Security Notice */}

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">

            <h3 className="font-bold text-[#1E3A8A]">
              🔐 DigiStamp Security
            </h3>

            <p className="text-gray-700 mt-2">
              Every agreement is protected using SHA-256 hashing,
              AI-generated legal drafting, secure cloud storage,
              and future certificate verification.
            </p>

          </div>

          {/* Button */}

          <button
            onClick={continueToAgreement}
            className="w-full bg-[#1E3A8A] hover:bg-blue-900 text-white py-4 rounded-xl text-lg font-semibold transition"
          >
            Continue → Generate AI Agreement
          </button>

        </div>
      </div>
    </div>
  );
}

export default CreateDeal;
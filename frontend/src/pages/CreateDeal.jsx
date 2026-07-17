import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import InputField from "../components/ui/InputField";
import ProgressSteps from "../components/ui/ProgressSteps";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";

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
    <Layout>
    <div className="page-transition">
      <SectionHeader
        eyebrow="Deal Intake"
        title="Create new deal"
        description="Capture the commercial details needed to generate a secure AI-assisted agreement."
      >
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusBadge variant="primary">AI drafting ready</StatusBadge>
          <StatusBadge variant="success">Secure workflow</StatusBadge>
        </div>
      </SectionHeader>

      <ProgressSteps
        current={2}
        steps={["Login", "Identity", "Deal", "Agreement"]}
      />

      <Card className="mt-8 overflow-hidden">
        <div className="border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
          <h2 className="text-xl font-bold text-slate-950">
            Deal information
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This information is passed into the agreement generator.
          </p>
        </div>

        <div className="space-y-8 p-6 sm:p-8">

          <div>
            <InputField
              as="select"
              name="dealType"
              label="Deal Type"
              value={deal.dealType}
              onChange={handleChange}
            >
              <option>Loan</option>
              <option>Freelance Work</option>
              <option>Rent Agreement</option>
              <option>Business Partnership</option>
              <option>Service Agreement</option>
            </InputField>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

              <h3 className="mb-4 text-lg font-bold text-[#1E3A8A]">
                Party A
              </h3>

              <InputField
                name="partyAName"
                label="Full name"
                placeholder="Full Name"
                value={deal.partyAName}
                onChange={handleChange}
                className="mb-4"
              />

              <InputField
                name="partyAEmail"
                label="Email address"
                placeholder="Email Address"
                value={deal.partyAEmail}
                onChange={handleChange}
              />

            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

              <h3 className="mb-4 text-lg font-bold text-[#1E3A8A]">
                Party B
              </h3>

              <InputField
                name="partyBName"
                label="Full name"
                placeholder="Full Name"
                value={deal.partyBName}
                onChange={handleChange}
                className="mb-4"
              />

              <InputField
                name="partyBEmail"
                label="Email address"
                placeholder="Email Address"
                value={deal.partyBEmail}
                onChange={handleChange}
              />

            </div>

          </div>

          <div>

            <h3 className="mb-4 text-lg font-bold text-[#1E3A8A]">
              Deal Details
            </h3>

            <InputField
              type="number"
              name="amount"
              label="Amount"
              placeholder="Amount (₹)"
              value={deal.amount}
              onChange={handleChange}
              className="mb-4"
            />

            <InputField
              as="textarea"
              rows="6"
              name="description"
              label="Agreement description"
              placeholder="Describe the agreement..."
              value={deal.description}
              onChange={handleChange}
            />

          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

            <h3 className="font-bold text-[#1E3A8A]">
              DigiStamp Security
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Every agreement is protected using SHA-256 hashing,
              AI-generated legal drafting, secure cloud storage,
              and future certificate verification.
            </p>

          </div>

          <Button
            onClick={continueToAgreement}
            className="w-full py-4 text-base"
          >
            Continue to AI Agreement
          </Button>

        </div>
      </Card>
    </div>
    </Layout>
  );
}

export default CreateDeal;

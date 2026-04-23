import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addGSTProfile } from "../services/gstService";
import { Alert, Button, InputField, SelectField, Card, SectionTitle } from "../components/UI";

const BUSINESS_TYPES = [
  { value: "", label: "-- Select Type --" },
  { value: "Proprietorship", label: "Proprietorship" },
  { value: "Partnership", label: "Partnership" },
  { value: "LLP", label: "LLP" },
  { value: "Private Ltd", label: "Private Ltd" },
  { value: "Public Ltd", label: "Public Ltd" },
  { value: "Others", label: "Others" },
];

const INITIAL = {
  gstin: "", tradeName: "", legalName: "", registrationDate: "",
  businessType: "", status: "Active",
  contact: { email: "", mobile: "", primaryContact: "" },
  primaryAddress: { buildingNo: "", street: "", locality: "", city: "", district: "", state: "", pincode: "" },
  natureOfBusiness: "",
  turnover: { currentFY: "", previousFY: "" },
};

const GSTForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (path, value) => {
    setForm((prev) => {
      const keys = path.split(".");
      if (keys.length === 1) return { ...prev, [keys[0]]: value };
      return { ...prev, [keys[0]]: { ...prev[keys[0]], [keys[1]]: value } };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        natureOfBusiness: form.natureOfBusiness.split(",").map((s) => s.trim()).filter(Boolean),
        turnover: {
          currentFY: Number(form.turnover.currentFY) || 0,
          previousFY: Number(form.turnover.previousFY) || 0,
        },
      };
      await addGSTProfile(payload);
      setSuccess("GST Profile created successfully!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create GST profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionTitle title="Add GST Profile" subtitle="Register a new business GSTIN with your account" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Alert type="error" message={error} />
        <Alert type="success" message={success} />

        {/* Business Identity */}
        <Card>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="text-indigo-400">01</span> Business Identity
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <InputField label="GSTIN *" id="gstin" placeholder="27AAPFU0939F1ZV"
              value={form.gstin} onChange={(e) => set("gstin", e.target.value.trim().toUpperCase())} required />
            <InputField label="Trade Name *" id="tradeName" placeholder="Ravi Traders"
              value={form.tradeName} onChange={(e) => set("tradeName", e.target.value)} required />
            <InputField label="Legal Name *" id="legalName" placeholder="Ravi Kumar Sharma"
              value={form.legalName} onChange={(e) => set("legalName", e.target.value)} required />
            <InputField label="Registration Date" id="regDate" type="date"
              value={form.registrationDate} onChange={(e) => set("registrationDate", e.target.value)} />
            <SelectField label="Business Type" id="businessType" options={BUSINESS_TYPES}
              value={form.businessType} onChange={(e) => set("businessType", e.target.value)} />
            <SelectField label="Status" id="status"
              options={[{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }]}
              value={form.status} onChange={(e) => set("status", e.target.value)} />
          </div>
        </Card>

        {/* Contact Details */}
        <Card>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="text-indigo-400">02</span> Contact Details
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <InputField label="Contact Person" id="contactName" placeholder="Ravi Sharma"
              value={form.contact.primaryContact}
              onChange={(e) => set("contact.primaryContact", e.target.value)} />
            <InputField label="Mobile" id="contactMobile" type="tel" placeholder="9876543210"
              value={form.contact.mobile}
              onChange={(e) => set("contact.mobile", e.target.value)} />
            <InputField label="Email" id="contactEmail" type="email" placeholder="contact@business.com"
              value={form.contact.email}
              onChange={(e) => set("contact.email", e.target.value)} />
          </div>
        </Card>

        {/* Primary Address */}
        <Card>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="text-indigo-400">03</span> Primary Address
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InputField label="Building No." id="buildingNo" placeholder="101"
              value={form.primaryAddress.buildingNo}
              onChange={(e) => set("primaryAddress.buildingNo", e.target.value)} />
            <InputField label="Street *" id="street" placeholder="MG Road"
              value={form.primaryAddress.street}
              onChange={(e) => set("primaryAddress.street", e.target.value)} required />
            <InputField label="Locality" id="locality" placeholder="Andheri East"
              value={form.primaryAddress.locality}
              onChange={(e) => set("primaryAddress.locality", e.target.value)} />
            <InputField label="City *" id="city" placeholder="Mumbai"
              value={form.primaryAddress.city}
              onChange={(e) => set("primaryAddress.city", e.target.value)} required />
            <InputField label="District" id="district" placeholder="Mumbai Suburban"
              value={form.primaryAddress.district}
              onChange={(e) => set("primaryAddress.district", e.target.value)} />
            <InputField label="State *" id="state" placeholder="Maharashtra"
              value={form.primaryAddress.state}
              onChange={(e) => set("primaryAddress.state", e.target.value)} required />
            <InputField label="Pincode *" id="pincode" placeholder="400069" maxLength={6}
              value={form.primaryAddress.pincode}
              onChange={(e) => set("primaryAddress.pincode", e.target.value)} required />
          </div>
        </Card>

        {/* Other Details */}
        <Card>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="text-indigo-400">04</span> Business Details
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <InputField label="Nature of Business (comma-separated)" id="nature"
              placeholder="Retail, Wholesale, Services"
              value={form.natureOfBusiness}
              onChange={(e) => set("natureOfBusiness", e.target.value)} />
            <div /> {/* spacer */}
            <InputField label="Current FY Turnover (₹)" id="currentFY" type="number"
              placeholder="8500000"
              value={form.turnover.currentFY}
              onChange={(e) => set("turnover.currentFY", e.target.value)} />
            <InputField label="Previous FY Turnover (₹)" id="previousFY" type="number"
              placeholder="6200000"
              value={form.turnover.previousFY}
              onChange={(e) => set("turnover.previousFY", e.target.value)} />
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={() => navigate("/dashboard")}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create GST Profile
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GSTForm;

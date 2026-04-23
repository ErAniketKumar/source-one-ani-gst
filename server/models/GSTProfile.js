const mongoose = require("mongoose");

// ── Reusable Sub-schemas ──────────────────────────────────────────────────────

const AddressSchema = new mongoose.Schema(
  {
    buildingNo: { type: String, trim: true },
    street: { type: String, trim: true },
    locality: { type: String, trim: true },
    city: { type: String, trim: true },
    district: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true, match: [/^\d{6}$/, "Invalid pincode"] },
    country: { type: String, default: "India" },
  },
  { _id: false }
);

const HSNSchema = new mongoose.Schema(
  {
    hsn: { type: String, trim: true },
    description: { type: String, trim: true },
    industry: { type: String, trim: true },
  },
  { _id: false }
);

const TurnoverSchema = new mongoose.Schema(
  {
    currentFY: { type: Number, default: 0 },
    previousFY: { type: Number, default: 0 },
    aggregateTurnover: { type: Number, default: 0 },
  },
  { _id: false }
);

// ── Main GST Profile Schema ───────────────────────────────────────────────────

const GSTProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    gstin: {
      type: String,
      required: [true, "GSTIN is required"],
      unique: true,
      uppercase: true,
      trim: true,
      match: [
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        "Invalid GSTIN format",
      ],
    },
    tradeName: { type: String, required: true, trim: true },
    legalName: { type: String, required: true, trim: true },

    contact: {
      email: { type: String, lowercase: true, trim: true },
      mobile: { type: String, trim: true },
      primaryContact: { type: String, trim: true },
    },

    businessType: {
      type: String,
      enum: ["Proprietorship", "Partnership", "LLP", "Private Ltd", "Public Ltd", "Others"],
      default: "Others",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended", "Cancelled"],
      default: "Active",
    },

    registrationDate: { type: Date },

    primaryAddress: { type: AddressSchema, required: true },
    additionalAddresses: { type: [AddressSchema], default: [] },

    natureOfBusiness: { type: [String], default: [] },

    hsnDetails: { type: [HSNSchema], default: [] },

    turnover: { type: TurnoverSchema, default: () => ({}) },

    // Compliance flags
    flags: {
      isAadhaarVerified: { type: Boolean, default: false },
      isEKYCDone: { type: Boolean, default: false },
      isCompositionScheme: { type: Boolean, default: false },
      isEInvoiceApplicable: { type: Boolean, default: false },
    },

    // Admin verification
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// gstin unique index is auto-created by unique:true — no need to repeat it
GSTProfileSchema.index({ user: 1 });
GSTProfileSchema.index({ status: 1 });

module.exports = mongoose.model("GSTProfile", GSTProfileSchema);

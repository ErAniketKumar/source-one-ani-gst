const mongoose = require("mongoose");

/**
 * DESIGN DECISION:
 * Rather than embedding all filings per-year in a single document per GSTIN,
 * we store one document per GSTIN with financial years as an embedded array
 * and each year's EFiledList FLATTENED for query efficiency.
 *
 * This avoids the 16MB MongoDB doc limit for heavy filers (10+ years × monthly × GSTR1+GSTR3B).
 * Index on { gstin, financialYear } enables fast filtered queries.
 */

// ── Sub-schema: One filing entry (flattened from EFiledList) ─────────────────
const FilingEntrySchema = new mongoose.Schema(
  {
    returnType: {
      type: String,
      enum: ["GSTR1", "GSTR3B", "GSTR9", "GSTR9C"],
      required: true,
    },
    returnPeriod: {
      type: String,
      required: true, // e.g., "032024" = March 2024
    },
    filingDate: {
      type: Date,
      required: true, // Converted from string (dd/MM/yyyy → Date)
    },
    arn: {
      type: String,
      trim: true,
    },
    mode: {
      type: String,
      enum: ["ONLINE", "GSP", "OFFLINE"],
      default: "ONLINE",
    },
    status: {
      type: String,
      enum: ["Filed", "Pending", "Late Filed", "Not Filed"],
      default: "Filed",
    },
    isDelay: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

// ── Sub-schema: One financial year block ──────────────────────────────────────
const FinancialYearSchema = new mongoose.Schema(
  {
    financialYear: {
      type: String,
      required: true, // e.g., "2023-24"
    },
    filingFrequency: {
      type: String,
      enum: ["Monthly", "Quarterly"],
      default: "Monthly",
    },
    filings: {
      type: [FilingEntrySchema],
      default: [],
    },
  },
  { _id: false }
);

// ── Main Filing History Schema ────────────────────────────────────────────────
const FilingHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gstin: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    complianceStatus: {
      isAnyDelay: { type: Boolean, default: false },
      isDefaulter: { type: Boolean, default: false },
    },
    financialYears: {
      type: [FinancialYearSchema],
      default: [],
    },
    isLocked: {
      type: Boolean,
      default: false, // Admin can lock a record after verification
    },
    verificationStatus: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
FilingHistorySchema.index({ gstin: 1 });           // Filter by GSTIN
FilingHistorySchema.index({ user: 1 });            // All filings for a user
FilingHistorySchema.index({ gstin: 1, "financialYears.financialYear": 1 }); // Year filter
FilingHistorySchema.index({ "complianceStatus.isDefaulter": 1 }); // Admin: find defaulters

module.exports = mongoose.model("FilingHistory", FilingHistorySchema);

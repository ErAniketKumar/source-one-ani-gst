const FilingHistory = require("../models/FilingHistory");
const GSTProfile = require("../models/GSTProfile");

/**
 * Helper: Convert "dd/MM/yyyy" → JS Date
 */
const parseDate = (str) => {
  if (!str) return null;
  const [day, month, year] = str.split("/");
  if (!day || !month || !year) return new Date(str); // Try native parse as fallback
  return new Date(`${year}-${month}-${day}`);
};

// ── POST /api/filing/add ──────────────────────────────────────────────────────
const addFilingHistory = async (req, res, next) => {
  try {
    const { gstin, complianceStatus, financialYears, isLocked } = req.body;

    if (!gstin) {
      return res.status(400).json({ success: false, message: "GSTIN is required." });
    }

    // Confirm the GST profile belongs to this user
    const profile = await GSTProfile.findOne({ gstin: gstin.toUpperCase() });
    if (!profile) {
      return res.status(404).json({ success: false, message: "GST Profile not found." });
    }
    if (profile.user.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    // Convert filing dates from string → Date
    const processedYears = (financialYears || []).map((fy) => ({
      ...fy,
      filings: (fy.filings || []).map((f) => ({
        ...f,
        filingDate: typeof f.filingDate === "string" ? parseDate(f.filingDate) : f.filingDate,
      })),
    }));

    // Upsert: one document per GSTIN
    const record = await FilingHistory.findOneAndUpdate(
      { gstin: gstin.toUpperCase() },
      {
        user: req.user._id,
        gstin: gstin.toUpperCase(),
        complianceStatus: complianceStatus || {},
        financialYears: processedYears,
        isLocked: isLocked || false,
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json({ success: true, message: "Filing history saved.", data: record });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/filing/:gstin ────────────────────────────────────────────────────
const getFilingByGSTIN = async (req, res, next) => {
  try {
    const record = await FilingHistory.findOne({
      gstin: req.params.gstin.toUpperCase(),
    });

    if (!record) {
      return res.status(404).json({ success: false, message: "Filing history not found." });
    }

    if (req.user.role !== "ADMIN" && record.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    // Optional: filter by financialYear query param
    const { year } = req.query;
    if (year) {
      const filtered = record.financialYears.filter((fy) => fy.financialYear === year);
      return res.json({
        success: true,
        data: { ...record.toObject(), financialYears: filtered },
      });
    }

    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/filing/my ────────────────────────────────────────────────────────
const getMyFilings = async (req, res, next) => {
  try {
    // Admin sees all filings, Users see only their own
    console.log(`[DEBUG] getMyFilings: User role is ${req.user.role}`);
    const filter = req.user.role === "ADMIN" ? {} : { user: req.user._id };
    console.log(`[DEBUG] getMyFilings: Using filter ${JSON.stringify(filter)}`);
    const records = await FilingHistory.find(filter).sort({ createdAt: -1 });
    console.log(`[DEBUG] getMyFilings: Found ${records.length} records`);
    res.json({ success: true, count: records.length, data: records });
  } catch (err) {
    next(err);
  }
};

// ── ADMIN: GET /api/admin/filings ─────────────────────────────────────────────
const getAllFilings = async (req, res, next) => {
  try {
    const { defaultersOnly } = req.query;

    const filter = defaultersOnly === "true"
      ? { "complianceStatus.isDefaulter": true }
      : {};

    const records = await FilingHistory.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: records.length, data: records });
  } catch (err) {
    next(err);
  }
};

// ── ADMIN: PATCH /api/admin/filing/:gstin/lock ────────────────────────────────
const toggleLockFiling = async (req, res, next) => {
  try {
    const record = await FilingHistory.findOne({ gstin: req.params.gstin.toUpperCase() });
    if (!record) {
      return res.status(404).json({ success: false, message: "Filing history not found." });
    }

    record.isLocked = !record.isLocked;
    await record.save();

    res.json({
      success: true,
      message: `Filing ${record.isLocked ? "locked" : "unlocked"}.`,
      isLocked: record.isLocked,
    });
  } catch (err) {
    next(err);
  }
};

// ── ADMIN: PATCH /api/admin/filing/:gstin/verify ──────────────────────────────
const verifyFiling = async (req, res, next) => {
  try {
    const { status } = req.body; // "Verified" or "Rejected"
    if (!["Verified", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }

    const record = await FilingHistory.findOne({ gstin: req.params.gstin.toUpperCase() });
    if (!record) {
      return res.status(404).json({ success: false, message: "Filing history not found." });
    }

    record.verificationStatus = status;
    // Auto-lock if verified
    if (status === "Verified") {
      record.isLocked = true;
    } else {
      record.isLocked = false;
    }
    
    await record.save();

    res.json({
      success: true,
      message: `Filing ${status.toLowerCase()} successfully.`,
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addFilingHistory,
  getFilingByGSTIN,
  getMyFilings,
  getAllFilings,
  toggleLockFiling,
  verifyFiling,
};

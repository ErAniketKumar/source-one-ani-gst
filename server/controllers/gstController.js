const GSTProfile = require("../models/GSTProfile");
const AdminAction = require("../models/AdminAction");

// ── POST /api/gst ─────────────────────────────────────────────────────────────
const addGSTProfile = async (req, res, next) => {
  try {
    const {
      gstin, tradeName, legalName, contact,
      businessType, status, registrationDate,
      primaryAddress, additionalAddresses,
      natureOfBusiness, hsnDetails, turnover, flags,
    } = req.body;

    if (!gstin || !tradeName || !legalName || !primaryAddress) {
      return res.status(400).json({ success: false, message: "GSTIN, trade name, legal name and primary address are required." });
    }

    const existing = await GSTProfile.findOne({ gstin: gstin.toUpperCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: "GST Profile with this GSTIN already exists." });
    }

    const profile = await GSTProfile.create({
      user: req.user._id,
      gstin, tradeName, legalName, contact,
      businessType, status, registrationDate,
      primaryAddress, additionalAddresses,
      natureOfBusiness, hsnDetails, turnover, flags,
    });

    res.status(201).json({ success: true, message: "GST Profile created.", data: profile });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/gst/my ───────────────────────────────────────────────────────────
const getMyProfiles = async (req, res, next) => {
  try {
    // Admin sees all profiles, Users see only their own
    console.log(`[DEBUG] getMyProfiles: User role is ${req.user.role}`);
    const filter = req.user.role === "ADMIN" ? {} : { user: req.user._id };
    console.log(`[DEBUG] getMyProfiles: Using filter ${JSON.stringify(filter)}`);
    const profiles = await GSTProfile.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: profiles.length, data: profiles });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/gst/:gstin ───────────────────────────────────────────────────────
const getProfileByGSTIN = async (req, res, next) => {
  try {
    const profile = await GSTProfile.findOne({
      gstin: req.params.gstin.toUpperCase(),
    }).populate("user", "name email");

    if (!profile) {
      return res.status(404).json({ success: false, message: "GST Profile not found." });
    }

    // Users can only view their own profiles; admins can view all
    if (
      req.user.role !== "ADMIN" &&
      profile.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/gst/:gstin ─────────────────────────────────────────────────────
const updateGSTProfile = async (req, res, next) => {
  try {
    const profile = await GSTProfile.findOne({ gstin: req.params.gstin.toUpperCase() });
    if (!profile) {
      return res.status(404).json({ success: false, message: "GST Profile not found." });
    }

    if (profile.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this profile." });
    }

    // Only allow these fields to be updated (guard against GSTIN tampering)
    const allowed = ["tradeName", "legalName", "contact", "businessType", "status",
      "primaryAddress", "additionalAddresses", "natureOfBusiness", "hsnDetails", "turnover", "flags"];

    allowed.forEach((key) => {
      if (req.body[key] !== undefined) profile[key] = req.body[key];
    });

    await profile.save();
    res.json({ success: true, message: "Profile updated.", data: profile });
  } catch (err) {
    next(err);
  }
};

// ── ADMIN: GET /api/admin/gst ─────────────────────────────────────────────────
const getAllProfiles = async (req, res, next) => {
  try {
    const profiles = await GSTProfile.find()
      .populate("user", "name email isBlocked")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: profiles.length, data: profiles });
  } catch (err) {
    next(err);
  }
};

// ── ADMIN: PATCH /api/admin/gst/:gstin/verify ─────────────────────────────────
const verifyGSTProfile = async (req, res, next) => {
  try {
    const profile = await GSTProfile.findOne({ gstin: req.params.gstin.toUpperCase() });
    if (!profile) {
      return res.status(404).json({ success: false, message: "GST Profile not found." });
    }

    profile.isVerified = true;
    profile.verifiedAt = new Date();
    await profile.save();

    await AdminAction.create({
      admin: req.user._id,
      actionType: "VERIFY_GST",
      targetUser: profile.user,
      targetGstin: profile.gstin,
      remarks: req.body.remarks || "Verified by admin",
    });

    res.json({ success: true, message: "GST Profile verified." });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addGSTProfile,
  getMyProfiles,
  getProfileByGSTIN,
  updateGSTProfile,
  getAllProfiles,
  verifyGSTProfile,
};

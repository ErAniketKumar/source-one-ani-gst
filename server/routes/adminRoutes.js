const express = require("express");
const { getAllUsers, toggleBlockUser, getAuditLog } = require("../controllers/adminController");
const { getAllProfiles, verifyGSTProfile } = require("../controllers/gstController");
const { getAllFilings, toggleLockFiling, verifyFiling } = require("../controllers/filingController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, adminOnly); // All admin routes are double-guarded

// User management
router.get("/users", getAllUsers);
router.patch("/users/:userId/block", toggleBlockUser);

// GST profile management
router.get("/gst", getAllProfiles);
router.patch("/gst/:gstin/verify", verifyGSTProfile);

// Filing management
router.get("/filings", getAllFilings);
router.patch("/filings/:gstin/lock", toggleLockFiling);
router.patch("/filings/:gstin/verify", verifyFiling);

// Audit log
router.get("/actions", getAuditLog);

module.exports = router;

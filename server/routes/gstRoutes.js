const express = require("express");
const {
  addGSTProfile,
  getMyProfiles,
  getProfileByGSTIN,
  updateGSTProfile,
} = require("../controllers/gstController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect); // All GST routes require auth

router.post("/", addGSTProfile);
router.get("/my", getMyProfiles);
router.get("/:gstin", getProfileByGSTIN);
router.patch("/:gstin", updateGSTProfile);

module.exports = router;

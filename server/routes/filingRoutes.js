const express = require("express");
const {
  addFilingHistory,
  getFilingByGSTIN,
  getMyFilings,
} = require("../controllers/filingController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/add", addFilingHistory);
router.get("/my", getMyFilings);
router.get("/:gstin", getFilingByGSTIN);

module.exports = router;

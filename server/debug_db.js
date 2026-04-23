const mongoose = require("mongoose");
const FilingHistory = require("./models/FilingHistory");
const User = require("./models/User");
require("dotenv").config();

const debug = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");
    
    const count = await FilingHistory.countDocuments();
    console.log(`Total FilingHistory records: ${count}`);
    
    const records = await FilingHistory.find({}).populate("user", "name email");
    records.forEach(r => {
      console.log(`GSTIN: ${r.gstin}, User: ${r.user?.name}, Status: ${r.verificationStatus}, Years: ${r.financialYears.length}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

debug();

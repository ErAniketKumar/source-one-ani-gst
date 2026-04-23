require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const FilingHistory = require("./models/FilingHistory");
const connectDataBase = require("./config/db");

const debug = async () => {
  await connectDataBase();
  
  const admins = await User.find({ role: "ADMIN" });
  console.log("Admins count:", admins.length);
  admins.forEach(a => console.log(`Admin: ${a.email}, ID: ${a._id}`));

  const allFilings = await FilingHistory.find({});
  console.log("Total Filing Records:", allFilings.length);
  
  allFilings.forEach(f => {
    console.log(`GSTIN: ${f.gstin}, UserID: ${f.user}, Years: ${f.financialYears.length}`);
  });

  await mongoose.connection.close();
};

debug();

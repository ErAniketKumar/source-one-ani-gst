require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectDataBase = require("./config/db");
const User = require("./models/User");
const GSTProfile = require("./models/GSTProfile");
const FilingHistory = require("./models/FilingHistory");
const AdminAction = require("./models/AdminAction");

const seed = async () => {
  await connectDataBase();
  console.log("🌱 Starting seed...");

  // ── 1. Clean up existing data ───────────────────────────────────────────────
  await Promise.all([
    User.deleteMany({}),
    GSTProfile.deleteMany({}),
    FilingHistory.deleteMany({}),
    AdminAction.deleteMany({}),
  ]);
  console.log("🗑️  Cleared existing data.");

  // ── 2. Hash helper ──────────────────────────────────────────────────────────
  const hash = (pw) => bcrypt.hash(pw, 12);

  // ── 3. Create Users ─────────────────────────────────────────────────────────
  const [adminUser, user1, user2] = await User.insertMany([
    {
      name: "Super Admin",
      email: "admin@gst.com",
      password: await hash("Admin@1234"),
      role: "ADMIN",
      isBlocked: false,
    },
    {
      name: "Ravi Sharma",
      email: "ravi@example.com",
      password: await hash("User@1234"),
      role: "USER",
      isBlocked: false,
    },
    {
      name: "Priya Mehta",
      email: "priya@example.com",
      password: await hash("User@1234"),
      role: "USER",
      isBlocked: false,
    },
  ]);
  console.log("👤 Users created.");

  // ── 4. Create GST Profiles ──────────────────────────────────────────────────
  const [profile1, profile2] = await GSTProfile.insertMany([
    {
      user: user1._id,
      gstin: "27AAPFU0939F1ZV",
      tradeName: "Ravi Traders",
      legalName: "Ravi Kumar Sharma",
      contact: { email: "ravi@example.com", mobile: "9876543210", primaryContact: "Ravi Sharma" },
      businessType: "Proprietorship",
      status: "Active",
      registrationDate: new Date("2018-07-01"),
      primaryAddress: {
        buildingNo: "101",
        street: "MG Road",
        locality: "Andheri East",
        city: "Mumbai",
        district: "Mumbai",
        state: "Maharashtra",
        pincode: "400069",
        country: "India",
      },
      additionalAddresses: [],
      natureOfBusiness: ["Retail", "Wholesale"],
      hsnDetails: [
        { hsn: "8471", description: "Computers", industry: "Electronics" },
        { hsn: "8473", description: "Computer Parts", industry: "Electronics" },
      ],
      turnover: { currentFY: 8500000, previousFY: 6200000, aggregateTurnover: 8500000 },
      flags: { isAadhaarVerified: true, isEKYCDone: true, isCompositionScheme: false, isEInvoiceApplicable: false },
      isVerified: true,
      verifiedAt: new Date(),
    },
    {
      user: user2._id,
      gstin: "29ABCDE1234F1Z5",
      tradeName: "Priya Enterprises",
      legalName: "Priya Mehta",
      contact: { email: "priya@example.com", mobile: "9123456780", primaryContact: "Priya Mehta" },
      businessType: "Partnership",
      status: "Active",
      registrationDate: new Date("2020-04-01"),
      primaryAddress: {
        buildingNo: "22",
        street: "Brigade Road",
        locality: "Jayanagar",
        city: "Bengaluru",
        district: "Bengaluru Urban",
        state: "Karnataka",
        pincode: "560011",
        country: "India",
      },
      additionalAddresses: [],
      natureOfBusiness: ["Services"],
      hsnDetails: [{ hsn: "9983", description: "IT Services", industry: "Technology" }],
      turnover: { currentFY: 2000000, previousFY: 1500000, aggregateTurnover: 2000000 },
      flags: { isAadhaarVerified: false, isEKYCDone: false, isCompositionScheme: true, isEInvoiceApplicable: false },
      isVerified: false,
    },
  ]);
  console.log("🏢 GST Profiles created.");

  // ── 5. Filing History for user1 (on-time filer) ─────────────────────────────
  await FilingHistory.create({
    user: user1._id,
    gstin: profile1.gstin,
    complianceStatus: { isAnyDelay: false, isDefaulter: false },
    isLocked: true,
    financialYears: [
      {
        financialYear: "2023-24",
        filingFrequency: "Monthly",
        filings: [
          { returnType: "GSTR1", returnPeriod: "032024", filingDate: new Date("2024-04-10"), arn: "AA010324123456B", mode: "ONLINE", status: "Filed", isDelay: false },
          { returnType: "GSTR3B", returnPeriod: "032024", filingDate: new Date("2024-04-20"), arn: "AA010324654321C", mode: "ONLINE", status: "Filed", isDelay: false },
          { returnType: "GSTR1", returnPeriod: "022024", filingDate: new Date("2024-03-11"), arn: "AA020224123456D", mode: "ONLINE", status: "Filed", isDelay: false },
          { returnType: "GSTR3B", returnPeriod: "022024", filingDate: new Date("2024-03-20"), arn: "AA020224654321E", mode: "GSP", status: "Filed", isDelay: false },
          { returnType: "GSTR1", returnPeriod: "012024", filingDate: new Date("2024-02-09"), arn: "AA010124112345F", mode: "ONLINE", status: "Filed", isDelay: false },
          { returnType: "GSTR3B", returnPeriod: "012024", filingDate: new Date("2024-02-20"), arn: "AA010124654312G", mode: "ONLINE", status: "Filed", isDelay: false },
        ],
      },
      {
        financialYear: "2022-23",
        filingFrequency: "Monthly",
        filings: [
          { returnType: "GSTR1", returnPeriod: "032023", filingDate: new Date("2023-04-08"), arn: "AB010323111111H", mode: "ONLINE", status: "Filed", isDelay: false },
          { returnType: "GSTR3B", returnPeriod: "032023", filingDate: new Date("2023-04-19"), arn: "AB010323222222I", mode: "ONLINE", status: "Filed", isDelay: false },
        ],
      },
    ],
  });

  // ── 6. Filing History for user2 (delayed filer / defaulter) ─────────────────
  await FilingHistory.create({
    user: user2._id,
    gstin: profile2.gstin,
    complianceStatus: { isAnyDelay: true, isDefaulter: true },
    isLocked: false,
    financialYears: [
      {
        financialYear: "2023-24",
        filingFrequency: "Quarterly",
        filings: [
          { returnType: "GSTR1", returnPeriod: "Q4-2024", filingDate: new Date("2024-05-25"), arn: "BA010324888881J", mode: "ONLINE", status: "Late Filed", isDelay: true },
          { returnType: "GSTR3B", returnPeriod: "Q4-2024", filingDate: new Date("2024-06-05"), arn: "BA010324888882K", mode: "GSP", status: "Late Filed", isDelay: true },
          { returnType: "GSTR1", returnPeriod: "Q3-2024", filingDate: new Date("2024-02-28"), arn: "BA010324000001L", mode: "ONLINE", status: "Filed", isDelay: false },
          { returnType: "GSTR3B", returnPeriod: "Q3-2024", filingDate: new Date("2024-03-25"), arn: "BA010324000002M", mode: "ONLINE", status: "Filed", isDelay: false },
        ],
      },
    ],
  });
  console.log("📁 Filing histories created.");

  // ── 7. Seed an audit action ──────────────────────────────────────────────────
  await AdminAction.create({
    admin: adminUser._id,
    actionType: "VERIFY_GST",
    targetUser: user1._id,
    targetGstin: profile1.gstin,
    remarks: "Initial verification during seeding.",
  });
  console.log("📋 Admin action logged.");

  console.log("\n✅ Seed complete!\n");
  console.log("─────────────────────────────────────────");
  console.log("🔑 Admin Login:  admin@gst.com  / Admin@1234");
  console.log("👤 User 1 Login: ravi@example.com / User@1234");
  console.log("👤 User 2 Login: priya@example.com / User@1234");
  console.log("─────────────────────────────────────────");

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});

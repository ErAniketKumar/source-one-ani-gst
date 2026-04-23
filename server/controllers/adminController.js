const User = require("../models/User");
const AdminAction = require("../models/AdminAction");

// ── GET /api/admin/users ──────────────────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: "USER" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/admin/users/:userId/block ──────────────────────────────────────
const toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.role === "ADMIN") {
      return res.status(400).json({ success: false, message: "Cannot block an admin." });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    await AdminAction.create({
      admin: req.user._id,
      actionType: user.isBlocked ? "BLOCK_USER" : "UNBLOCK_USER",
      targetUser: user._id,
      remarks: req.body.remarks || "",
    });

    res.json({
      success: true,
      message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully.`,
      isBlocked: user.isBlocked,
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/actions ────────────────────────────────────────────────────
const getAuditLog = async (req, res, next) => {
  try {
    const actions = await AdminAction.find()
      .populate("admin", "name email")
      .populate("targetUser", "name email")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, data: actions });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, toggleBlockUser, getAuditLog };

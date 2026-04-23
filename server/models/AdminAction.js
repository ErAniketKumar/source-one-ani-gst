const mongoose = require("mongoose");

/**
 * AdminAction: Audit trail for all admin operations.
 * Kept separate for scalability — does NOT pollute User documents.
 */
const AdminActionSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actionType: {
      type: String,
      enum: ["VERIFY_GST", "BLOCK_USER", "UNBLOCK_USER", "LOCK_FILING", "UNLOCK_FILING"],
      required: true,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    targetGstin: {
      type: String,
      trim: true,
      uppercase: true,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

AdminActionSchema.index({ admin: 1 });
AdminActionSchema.index({ targetUser: 1 });
AdminActionSchema.index({ actionType: 1 });

module.exports = mongoose.model("AdminAction", AdminActionSchema);

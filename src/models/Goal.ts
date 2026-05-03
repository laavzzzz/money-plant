import mongoose, { Schema, models, model } from "mongoose";

const GoalSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },

    deadline: { type: Date },
  },
  { timestamps: true }
);

export const Goal =
  models.Goal || model("Goal", GoalSchema);
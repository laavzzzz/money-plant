import mongoose, { Schema, models, model, Document } from "mongoose";

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { 
      type: String, 
      required: [true, "Goal title is required"], 
      trim: true 
    },
    targetAmount: { 
      type: Number, 
      required: [true, "Target amount is required"],
      min: [0, "Target cannot be negative"]
    },
    currentAmount: { 
      type: Number, 
      default: 0,
      min: [0, "Current progress cannot be negative"]
    },
    deadline: { 
      type: Date 
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Performance Indexing for lightning fast user goal retrieval
GoalSchema.index({ userId: 1 });
GoalSchema.index({ deadline: 1 });

export const Goal =
  models.Goal || model<IGoal>("Goal", GoalSchema);
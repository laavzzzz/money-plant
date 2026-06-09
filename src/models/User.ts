import mongoose, { Schema, Document, Model, models, model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  phone: string;
  isVerified: boolean;
  location?: string;
  accountType: string;
  bio: string;
  totalSaved: number;
  monthlyAverage: number;
  goalCompletion: string;
  totalIncome: number;
  totalExpense: number;
  streak: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    image: { type: String },
    phone: { type: String, required: true, unique: true, index: true },
    isVerified: { type: Boolean, default: false },
    location: { type: String },
    accountType: { type: String, default: "Standard Saver" },
    bio: { type: String, default: "Building better money habits one plant at a time." },
    totalSaved: { type: Number, default: 0 },
    monthlyAverage: { type: Number, default: 0 },
    goalCompletion: { type: String, default: "0 / 0" },

    totalIncome: { type: Number, default: 0 },
    totalExpense: { type: Number, default: 0 },

    streak: { type: Number, default: 0 },
  },
  { 
    timestamps: true,
    strict: true 
  }
);

export const User: Model<IUser> = models.User || model<IUser>("User", UserSchema);
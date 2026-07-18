import mongoose, { Schema, Document, Model, models, model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  phone?: string;
  provider: "credentials" | "google";
  providerId?: string;
  isVerified: boolean;
  location?: string;
  bio: string;
  monthlyAverage: number;
  goalCompletion: string;
  totalSaved: number;
  totalIncome: number;
  totalExpense: number;
  streak: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { 
      type: String, 
      required: [true, "Name is required"],
      trim: true 
    },
    email: { 
      type: String, 
      required: [true, "Email is required"], 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    password: { 
      type: String, 
      required: false, 
      select: false // Excludes password hashes from standard queries. Force fetch via: .select("+password")
    },
    image: { 
      type: String 
    },
    phone: { 
      type: String, 
      required: false,
      unique: true,
      sparse: true // Allows multiple OAuth profiles to lack a phone number without breaking unique constraints
    },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
      required: true
    },
    providerId: {
      type: String,
      required: false
    },
    isVerified: { 
      type: Boolean, 
      default: false 
    },
    location: { 
      type: String 
    },
    bio: { 
      type: String, 
      default: "Building better money habits one plant at a time." 
    },
    totalSaved: { 
      type: Number, 
      default: 0 
    },
    monthlyAverage: { 
      type: Number, 
      default: 0 
    },
    goalCompletion: { 
      type: String, 
      default: "0 / 0" 
    },
    totalIncome: { 
      type: Number, 
      default: 0 
    },
    totalExpense: { 
      type: Number, 
      default: 0 
    },
    streak: { 
      type: Number, 
      default: 0 
    },
  },
  { 
    timestamps: true,
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// High-speed index lookups for auth pipelines

UserSchema.index({ provider: 1, providerId: 1 });

export const User: Model<IUser> = models.User || model<IUser>("User", UserSchema);
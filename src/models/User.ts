/**
 * @file src/models/User.ts
 * @module Models/User
 * @description Enterprise-grade Mongoose schema and model for MoneyPlant Users.
 * Encapsulates core identity, authentication data, gamified financial tracking,
 * virtual aura computation, and multi-step onboarding profile information.
 *
 * @version 2.0.0
 * @author Senior Principal Data & Security Architecture Team
 */

import mongoose, { Schema, Document, Model, models, model } from "mongoose";

// ============================================================================
// CONSTANTS & ENUMS
// ============================================================================

export enum AuthProvider {
  CREDENTIALS = "credentials",
  GOOGLE = "google",
}

export const DEFAULT_PREFERRED_CATEGORIES = [
  "Food",
  "Shopping",
  "Rent",
  "Entertainment",
  "Travel",
  "Education",
  "Healthcare",
  "Bills",
  "Investments",
  "Others",
];

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface IUserNotifications {
  dailyReminder: boolean;
  weeklyReport: boolean;
  monthlySummary: boolean;
  goalProgress: boolean;
  budgetAlerts: boolean;
}

export interface IUserProfile {
  country: string;
  currency: string;
  occupation: string;
  monthlyIncome: number;
  hasVariableIncome: boolean;
  financialGoal?: string;
  customGoal?: string;
  targetAmount?: number;
  targetDate?: Date;
  preferredCategories: string[];
  aiPreferences: string[];
  notifications: IUserNotifications;
}

export interface IUser {
  name: string;
  email: string;
  password?: string;
  image?: string | null;
  phone?: string | null;
  provider: AuthProvider;
  providerId?: string | null;
  isVerified: boolean;
  location?: string;
  bio: string;
  totalSaved: number;
  monthlyAverage: number;
  goalCompletion: string;
  totalIncome: number;
  totalExpense: number;
  streak: number;
  onboardingCompleted: boolean;
  onboardingStep: number;
  profile: IUserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserVirtuals {
  savingsRate: number;
  globalAura: number;
}

export interface IUserMethods {
  /** Safely returns public user properties suitable for client responses */
  toPublicJSON(): Record<string, unknown>;
}

export interface IUserDocument
  extends IUser,
    IUserVirtuals,
    IUserMethods,
    Document {}

export interface IUserModel extends Model<IUserDocument> {
  /** Find user by normalized email address */
  findByEmail(email: string): Promise<IUserDocument | null>;
  /** Find or construct user document from OAuth provider payload */
  findOrCreateOAuthUser(payload: {
    email: string;
    name: string;
    image?: string;
    providerId: string;
  }): Promise<IUserDocument>;
}

// ============================================================================
// EMBEDDED SCHEMAS
// ============================================================================

const UserNotificationsSchema = new Schema<IUserNotifications>(
  {
    dailyReminder: { type: Boolean, default: true },
    weeklyReport: { type: Boolean, default: true },
    monthlySummary: { type: Boolean, default: true },
    goalProgress: { type: Boolean, default: true },
    budgetAlerts: { type: Boolean, default: true },
  },
  { _id: false }
);

const UserProfileSchema = new Schema<IUserProfile>(
  {
    country: { type: String, default: "IN", trim: true },
    currency: { type: String, default: "INR", trim: true },
    occupation: { type: String, default: "Working Professional", trim: true },
    monthlyIncome: { type: Number, default: 0, min: 0 },
    hasVariableIncome: { type: Boolean, default: false },
    financialGoal: { type: String, trim: true },
    customGoal: { type: String, trim: true },
    targetAmount: { type: Number, min: 0 },
    targetDate: { type: Date },
    preferredCategories: {
      type: [String],
      default: DEFAULT_PREFERRED_CATEGORIES,
    },
    aiPreferences: { type: [String], default: [] },
    notifications: {
      type: UserNotificationsSchema,
      default: () => ({}),
    },
  },
  { _id: false }
);

// ============================================================================
// MAIN USER SCHEMA DEFINITION
// ============================================================================

const UserSchema = new Schema<IUserDocument, IUserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters."],
    },
    email: {
      type: String,
      required: [true, "Email address is required."],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email address.",
      ],
    },
    password: {
      type: String,
      required: false,
      select: false, // Prevents sensitive password hash leakage in normal queries
    },
    image: {
      type: String,
      default: null,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      default: null,
      trim: true,
    },
    provider: {
      type: String,
      enum: {
        values: Object.values(AuthProvider),
        message: "Invalid auth provider: {VALUE}",
      },
      default: AuthProvider.CREDENTIALS,
      required: true,
    },
    providerId: {
      type: String,
      required: false,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    bio: {
      type: String,
      default: "Building better money habits one plant at a time.",
      trim: true,
      maxlength: [250, "Bio cannot exceed 250 characters."],
    },
    totalSaved: {
      type: Number,
      default: 0,
      min: 0,
    },
    monthlyAverage: {
      type: Number,
      default: 0,
      min: 0,
    },
    goalCompletion: {
      type: String,
      default: "0 / 0",
      trim: true,
    },
    totalIncome: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalExpense: {
      type: Number,
      default: 0,
      min: 0,
    },
    streak: {
      type: Number,
      default: 0,
      min: 0,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    onboardingStep: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
    profile: {
      type: UserProfileSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    strict: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc: unknown, ret: Record<string, unknown>) {
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ============================================================================
// INDEXES FOR QUERY OPTIMIZATION
// ============================================================================

UserSchema.index(
  { provider: 1, providerId: 1 },
  {
    sparse: true,
    name: "idx_oauth_provider_lookup",
  }
);

UserSchema.index(
  { email: 1, onboardingCompleted: 1 },
  { name: "idx_user_auth_onboarding" }
);

// ============================================================================
// VIRTUAL COMPUTED PROPERTIES
// ============================================================================

/**
 * Virtual: Dynamic Savings Rate Percentage
 * Computes savings rate based on income and expenses without storing redundant state.
 */
UserSchema.virtual("savingsRate").get(function (this: IUserDocument): number {
  if (!this.totalIncome || this.totalIncome <= 0) return 0;
  const saved = this.totalIncome - this.totalExpense;
  if (saved <= 0) return 0;
  return Math.min(100, Math.round((saved / this.totalIncome) * 100));
});

/**
 * Virtual: Gamified Aura Points
 * Dynamic score combining streak, goal activity, and net savings.
 */
UserSchema.virtual("globalAura").get(function (this: IUserDocument): number {
  const streakBonus = (this.streak || 0) * 15;
  const savingsBonus = Math.floor((this.totalSaved || 0) / 1000) * 5;
  return 1000 + streakBonus + savingsBonus;
});

// ============================================================================
// INSTANCE METHODS
// ============================================================================

UserSchema.methods.toPublicJSON = function (
  this: IUserDocument
): Record<string, unknown> {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

// ============================================================================
// STATIC MODEL METHODS
// ============================================================================

UserSchema.statics.findByEmail = async function (
  email: string
): Promise<IUserDocument | null> {
  const normalizedEmail = email.trim().toLowerCase();
  return this.findOne({ email: normalizedEmail });
};

UserSchema.statics.findOrCreateOAuthUser = async function (payload: {
  email: string;
  name: string;
  image?: string;
  providerId: string;
}): Promise<IUserDocument> {
  const normalizedEmail = payload.email.trim().toLowerCase();

  let user = await this.findOne({ email: normalizedEmail });

  if (!user) {
    user = await this.create({
      email: normalizedEmail,
      name: payload.name,
      image: payload.image || null,
      provider: AuthProvider.GOOGLE,
      providerId: payload.providerId,
      isVerified: true,
      onboardingCompleted: false,
      onboardingStep: 1,
    });
  } else if (user.provider !== AuthProvider.GOOGLE) {
    // Link Google OAuth details if existing credential user logs in with Google
    user.providerId = payload.providerId;
    user.isVerified = true;
    if (!user.image && payload.image) {
      user.image = payload.image;
    }
    await user.save();
  }

  return user;
};

// ============================================================================
// NEXT.JS SAFE MODEL COMPILATION
// ============================================================================

export const User: IUserModel =
  (models.User as IUserModel) ||
  model<IUserDocument, IUserModel>("User", UserSchema);

export default User;
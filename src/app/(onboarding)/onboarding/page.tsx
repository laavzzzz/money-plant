"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface OnboardingFormData {
  fullName: string;
  country: string;
  currency: string;
  occupation: string;
  monthlyIncome: number;
  hasVariableIncome: boolean;
  preferredCategories: string[];
  financialGoal: string;
  targetAmount: number;
  aiPreferences: string[];
  notifications: {
    dailyReminder: boolean;
    weeklyReport: boolean;
    monthlySummary: boolean;
    goalProgress: boolean;
    budgetAlerts: boolean;
  };
}

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<OnboardingFormData>({
    fullName: "",
    country: "India",
    currency: "INR (₹)",
    occupation: "Working Professional",
    monthlyIncome: 50000,
    hasVariableIncome: false,
    preferredCategories: ["Food", "Shopping", "Rent", "Bills", "Investments"],
    financialGoal: "Save Money",
    targetAmount: 100000,
    aiPreferences: ["Reduce unnecessary spending", "Daily AI insights"],
    notifications: {
      dailyReminder: true,
      weeklyReport: true,
      monthlySummary: true,
      goalProgress: true,
      budgetAlerts: true,
    },
  });

  const submitStep = async (nextStepNumber: number, isFinal = false) => {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStep: nextStepNumber,
          isFinalStep: isFinal,
          stepData: formData,
        }),
      });

      if (res.ok) {
        if (isFinal) {
          router.push("/dashboard");
        } else {
          setStep(nextStepNumber);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/50 flex flex-col justify-center items-center p-4">
      {/* Progress Bar */}
      <div className="w-full max-w-xl mb-8">
        <div className="flex justify-between text-xs font-semibold text-emerald-800 mb-2">
          <span>🌱 Seed</span>
          <span>💧 Water</span>
          <span>☀️ Sun</span>
          <span>🍃 Style</span>
          <span>🌳 Sprout</span>
        </div>
        <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Card Container */}
      <div className="w-full max-w-xl bg-white border border-emerald-100 shadow-xl rounded-2xl p-8">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              🌱 Step 1: Plant Your Seed
            </h2>
            <p className="text-sm text-gray-600">
              Tell us about yourself so we can tailor your MoneyPlant.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Alex Morgan"
              />
            </div>
            <button
              onClick={() => submitStep(2)}
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700"
            >
              Next: Water Your Seed →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              💧 Step 2: Water Your Seed
            </h2>
            <p className="text-sm text-gray-600">Set your monthly income baseline.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Income
              </label>
              <input
                type="number"
                value={formData.monthlyIncome}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    monthlyIncome: Number(e.target.value),
                  })
                }
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => submitStep(3)}
                disabled={loading}
                className="w-2/3 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700"
              >
                Next: Add Sunlight →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              ☀️ Step 3: Give It Sunlight
            </h2>
            <p className="text-sm text-gray-600">Define your target savings goal.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Savings Amount
              </label>
              <input
                type="number"
                value={formData.targetAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetAmount: Number(e.target.value),
                  })
                }
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => submitStep(4)}
                disabled={loading}
                className="w-2/3 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700"
              >
                Next: Garden Style →
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              🍃 Step 4: Choose Garden Style
            </h2>
            <p className="text-sm text-gray-600">Configure your notification preferences.</p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notifications.dailyReminder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notifications: {
                        ...formData.notifications,
                        dailyReminder: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="text-sm text-gray-700">Daily Reminders</span>
              </label>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep(3)}
                className="w-1/3 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => submitStep(5)}
                disabled={loading}
                className="w-2/3 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700"
              >
                Finalize Garden →
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="text-center space-y-6">
            <div className="text-6xl animate-bounce">🌳</div>
            <h2 className="text-3xl font-extrabold text-emerald-900">
              Your MoneyPlant Has Sprouted!
            </h2>
            <p className="text-gray-600">
              Your garden is setup and ready to grow. Let’s head to your personalized dashboard.
            </p>
            <button
              onClick={() => submitStep(5, true)}
              disabled={loading}
              className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200"
            >
              Go to Dashboard 🌱
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
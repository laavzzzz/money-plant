"use client";

import { useRouter } from "next/navigation";
import { LogOut, User, Trash2, ShieldAlert, Mail, Phone, Award } from "lucide-react";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import { useFinanceContext } from "@/components/providers/FinanceProvider";

const getSavingsTitle = (savings: number, income: number) => {
  if (income <= 0) return "🌱 Budget Rookie";
  const percentage = (savings / income) * 100;
  
  if (percentage < 5) return "🌱 Budget Rookie";
  if (percentage < 10) return "💸 Coin Collector";
  if (percentage < 15) return "🌿 Cash Sprout";
  if (percentage < 20) return "📈 Savings Explorer";
  if (percentage < 30) return "💎 Money Mover";
  if (percentage < 40) return "🚀 Wealth Builder";
  if (percentage < 50) return "🏆 Finance Slayer";
  if (percentage < 60) return "👑 Bag Secured";
  if (percentage < 75) return "🔥 Wealth Wizard";
  return "🌳 MoneyPlant Legend";
};


export default function ProfilePage() {
  const router = useRouter();
  const { profile, savings, income } = useFinanceContext();

  const savingsTitle = getSavingsTitle(savings, income);

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to log out? You will need to sign in again to access your wealth garden and track your spending."
    );

    if (confirmed) {
      localStorage.clear();
      sessionStorage.clear();
      router.replace("/login");
    }
  };

  const handleDeleteAccount = async () => {
    const firstConfirm = window.confirm(
      "CRITICAL ACTION: Are you absolutely sure you want to delete your account? This will permanently erase your transaction history, plant progress, and streak."
    );

    if (firstConfirm) {
      const secondConfirm = window.confirm("FINAL WARNING: This action CANNOT be undone. Proceed with deletion?");
      if (secondConfirm) {
        try {
          const response = await fetch("/api/user", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "x-user-phone": profile?.phone || "",
            },
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to delete account");
          }

          // Clear local state and redirect upon successful deletion
          localStorage.clear();
          sessionStorage.clear();
          router.replace("/login");
          alert("Your account and all associated data have been permanently deleted.");
        } catch (error: any) {
          console.error("Account deletion failed:", error);
          alert(error.message || "An unexpected error occurred. Please try again.");
        }
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] font-black text-text-light">
          Settings
        </p>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 grid place-items-center rounded-3xl bg-primary/10 text-primary">
            <User size={20} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-text-main">
            Your Profile
          </h1>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8 space-y-8"
      >
        {/* User Identity Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 rounded-[24px] bg-white/5 border border-white/10 flex flex-col gap-3 min-w-0 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Award size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Savings Rank</p>
              <p className="font-bold text-lg text-text-main truncate">{savingsTitle}</p>
            </div>
          </div>

          <div className="p-5 rounded-[24px] bg-white/5 border border-white/10 flex flex-col gap-3 min-w-0 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Mail size={20} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Email Address</p>
              <p className="font-bold text-text-main truncate leading-tight" title={profile?.email || "Not provided"}>
                {profile?.email || "Not provided"}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-[24px] bg-white/5 border border-white/10 flex flex-col gap-3 min-w-0 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Phone size={20} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Verified Phone</p>
              <p className="font-bold text-text-main truncate">{profile?.phone || "Not linked"}</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-text-main">Session Management</h3>
          <div className="flex flex-col gap-4">
            <Button
              onClick={handleLogout}
              leftIcon={<LogOut size={18} />}
              className="w-full sm:w-fit !bg-red-500 hover:!bg-red-600 !text-white !border-none shadow-lg shadow-red-500/20 font-bold transition-all active:scale-95"
            >
              Log Out
            </Button>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-widest text-red-500">Danger Zone</h3>
              <p className="text-sm text-text-light">
                Permanently remove your account and all associated data from the MoneyPlant database.
              </p>
            </div>
            <Button
              onClick={handleDeleteAccount}
              leftIcon={<Trash2 size={18} />}
              className="w-full sm:w-fit !bg-red-500 hover:!bg-red-600 !text-white !border-none shadow-lg shadow-red-500/20 font-bold transition-all active:scale-95"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
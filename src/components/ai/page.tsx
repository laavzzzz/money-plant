"use client";

import { useRouter } from "next/navigation";
import { LogOut, User, Trash2, ShieldAlert } from "lucide-react";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import { useFinanceContext } from "@/components/providers/FinanceProvider";

export default function ProfilePage() {
  const router = useRouter();
  const { profile } = useFinanceContext();

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
        className="glass-panel p-6 sm:p-8 space-y-6"
      >
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-text-main">Account Actions</h2>
          <p className="text-sm text-text-light">Manage your current session and security settings.</p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10">
              <ShieldAlert className="text-orange-500 shrink-0" size={20} />
              <p className="text-sm text-text-light leading-relaxed">
                Logging out will end your current session. You will need your phone number and verification to return to your garden.
              </p>
            </div>
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
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Camera, User, Shield, Zap, Award, Star, Edit3, MapPin, Mail, Phone, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const PROFILE_STORAGE_KEY = "moneyplant-profile";

export default function ProfilePage() {
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [name, setName] = useState("Player One");
  const [title, setTitle] = useState("Level 12 Wealth Guardian");
  const [email, setEmail] = useState("player.one@moneyplant.app");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [location, setLocation] = useState("Bengaluru, India");
  const [accountType, setAccountType] = useState("Premium Saver");
  const [joinedDate, setJoinedDate] = useState("June 2024");
  const [bio, setBio] = useState("Building better money habits one plant at a time.");
  const [totalSaved, setTotalSaved] = useState("₹1,24,800");
  const [monthlyAverage, setMonthlyAverage] = useState("₹12,300");
  const [goalCompletion, setGoalCompletion] = useState("8 / 12");
  const [profileCompletion, setProfileCompletion] = useState(86);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const calculateCompletion = (fields: Array<string | null>) => {
    const filled = fields.filter((value) => Boolean(value)).length;
    return Math.min(100, Math.round((filled / fields.length) * 100));
  };

  const loadProfileFromLocalStorage = () => {
    if (typeof window === "undefined") return;
    const storedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!storedProfile) {
      setProfileCompletion(calculateCompletion([name, email, phone, location, accountType, bio, profilePic]));
      setIsProfileLoaded(true);
      return;
    }

    try {
      const data = JSON.parse(storedProfile);
      const profileData = {
        name: data.name || name,
        title: data.title || title,
        email: data.email || email,
        phone: data.phone || phone,
        location: data.location || location,
        accountType: data.accountType || accountType,
        joinedDate: data.joinedDate || joinedDate,
        bio: data.bio || bio,
        totalSaved: data.totalSaved || totalSaved,
        monthlyAverage: data.monthlyAverage || monthlyAverage,
        goalCompletion: data.goalCompletion || goalCompletion,
        profilePic: data.profilePic || profilePic,
      };

      setName(profileData.name);
      setTitle(profileData.title);
      setEmail(profileData.email);
      setPhone(profileData.phone);
      setLocation(profileData.location);
      setAccountType(profileData.accountType);
      setJoinedDate(profileData.joinedDate);
      setBio(profileData.bio);
      setTotalSaved(profileData.totalSaved);
      setMonthlyAverage(profileData.monthlyAverage);
      setGoalCompletion(profileData.goalCompletion);
      setProfilePic(profileData.profilePic);
      setProfileCompletion(
        calculateCompletion([
          profileData.name,
          profileData.email,
          profileData.phone,
          profileData.location,
          profileData.accountType,
          profileData.bio,
          profileData.profilePic,
        ])
      );
    } catch {
      setProfileCompletion(calculateCompletion([name, email, phone, location, accountType, bio, profilePic]));
    }

    setIsProfileLoaded(true);
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile", { cache: "no-store" });
      if (!response.ok) throw new Error("Profile fetch failed");
      const result = await response.json();
      if (result.success && result.data) {
        const profileData = result.data;
        setName(profileData.name ?? name);
        setTitle(profileData.title ?? title);
        setEmail(profileData.email ?? email);
        setPhone(profileData.phone ?? phone);
        setLocation(profileData.location ?? location);
        setAccountType(profileData.accountType ?? accountType);
        setJoinedDate(profileData.joinedDate ?? joinedDate);
        setBio(profileData.bio ?? bio);
        setTotalSaved(profileData.totalSaved ?? totalSaved);
        setMonthlyAverage(profileData.monthlyAverage ?? monthlyAverage);
        setGoalCompletion(profileData.goalCompletion ?? goalCompletion);
        setProfilePic(profileData.profilePic ?? profilePic);
        setProfileCompletion(
          calculateCompletion([
            profileData.name ?? name,
            profileData.email ?? email,
            profileData.phone ?? phone,
            profileData.location ?? location,
            profileData.accountType ?? accountType,
            profileData.bio ?? bio,
            profileData.profilePic ?? profilePic,
          ])
        );
      }
    } catch {
      loadProfileFromLocalStorage();
    } finally {
      setIsProfileLoaded(true);
    }
  };

  const saveProfile = async () => {
    if (typeof window === "undefined") return;
    const profileData = {
      name,
      title,
      email,
      phone,
      location,
      accountType,
      joinedDate,
      bio,
      totalSaved,
      monthlyAverage,
      goalCompletion,
      profilePic,
    };

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();
      if (result.success) {
        window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
        setProfileCompletion(
          calculateCompletion([
            profileData.name,
            profileData.email,
            profileData.phone,
            profileData.location,
            profileData.accountType,
            profileData.bio,
            profileData.profilePic,
          ])
        );
        setMessage("Profile saved to backend and local storage.");
      } else {
        throw new Error(result.message || "Profile save failed");
      }
    } catch {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
      setProfileCompletion(
        calculateCompletion([
          profileData.name,
          profileData.email,
          profileData.phone,
          profileData.location,
          profileData.accountType,
          profileData.bio,
          profileData.profilePic,
        ])
      );
      setMessage("Saved locally; backend sync will be retried later.");
    }

    setTimeout(() => setMessage(""), 2400);
    setEditMode(false);
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8 p-4 md:p-8 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
            Character sheet
          </p>
          <p className="text-sm text-text-light mt-2 max-w-2xl">
            Manage your profile, update details, and keep your MoneyPlant identity consistent across the app.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEditMode((current) => !current)}
          className="inline-flex items-center gap-2 bg-yellow-400 text-black rounded-xl px-4 py-2 font-bold text-[10px] uppercase tracking-wider hover:scale-105 transition-transform shadow-sm"
        >
          <Edit3 size={14} />
          {editMode ? "Close edit" : "Edit profile"}
        </button>
      </div>

      {message ? (
        <div className="rounded-3xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-black text-green-700">
          {message}
        </div>
      ) : null}

      {/* PROFILE INFO CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
           <Zap size={200} />
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          {/* AVATAR UPLOAD SECTION */}
          <div className="relative group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-32 h-32 md:w-40 md:h-40 rounded-[45px] bg-gray-50 border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center cursor-pointer relative"
              onClick={triggerFileInput}
            >
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-gray-300">
                  <User size={48} />
                  <span className="text-[8px] font-black uppercase mt-1">No Image</span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="text-white" size={24} />
              </div>
            </motion.div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
            
            <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white p-2.5 rounded-2xl shadow-xl">
              <Shield size={20} />
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none mb-2">
              {name}
            </h1>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.2em] mb-4">
              {title}
            </p>
            <p className="text-sm text-text-light max-w-xl mx-auto md:mx-0 mb-6">
              {bio}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              <div className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-600 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-green-100">
                <Star size={12} fill="currentColor" /> Active streak: 5 days
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-purple-50 text-purple-600 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-purple-100">
                <Award size={12} /> Pro member
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-wider">
                <Mail size={12} /> {email}
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-wider">
                <Phone size={12} /> {phone}
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-wider">
                <MapPin size={12} /> {location}
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-wider">
                <ShieldCheck size={12} /> {accountType}
              </div>
            </div>
          </div>
        </div>

        {editMode ? (
          <div className="mt-10 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-black uppercase tracking-[0.35em] text-text-light">Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold outline-none"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-black uppercase tracking-[0.35em] text-text-light">Title</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold outline-none"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-black uppercase tracking-[0.35em] text-text-light">Email</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold outline-none"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-black uppercase tracking-[0.35em] text-text-light">Phone</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold outline-none"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-black uppercase tracking-[0.35em] text-text-light">Location</span>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold outline-none"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-black uppercase tracking-[0.35em] text-text-light">Account type</span>
                <input
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold outline-none"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm">
              <span className="font-black uppercase tracking-[0.35em] text-text-light">Bio</span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold outline-none"
              />
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={saveProfile}
                className="rounded-3xl bg-primary text-white py-3 px-5 text-sm font-black uppercase tracking-[0.35em] hover:brightness-110 transition"
              >
                Save changes
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="rounded-3xl border border-white/10 bg-white/10 text-text-main py-3 px-5 text-sm font-black uppercase tracking-[0.35em] hover:bg-white/20 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Email" value={email} color="text-text-main" />
            <StatCard label="Phone" value={phone} color="text-text-main" />
            <StatCard label="Location" value={location} color="text-text-main" />
            <StatCard label="Joined" value={joinedDate} color="text-text-main" />
            <StatCard label="Account" value={accountType} color="text-primary" />
            <StatCard label="Goals completed" value={goalCompletion} color="text-purple-500" />
          </div>
        )}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="glass-panel p-6 rounded-[32px] border border-white/10 bg-white/60 dark:bg-white/5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] font-black text-text-light">
                Profile completion
              </p>
              <h2 className="mt-3 text-2xl font-black text-text-main">{profileCompletion}% complete</h2>
            </div>
            <div className="rounded-3xl bg-primary/10 px-4 py-2 text-primary text-xs font-black uppercase tracking-[0.35em]">
              Keep profile updated
            </div>
          </div>
          <div className="mt-5 h-3 rounded-full bg-black/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-text-light">
            Complete your profile to unlock personalized suggestions, custom savings plans, and faster support.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-[32px] border border-white/10 bg-white/60 dark:bg-white/5 shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} className="text-primary" />
            <p className="text-sm font-black uppercase tracking-[0.35em] text-text-main">
              Security & account
            </p>
          </div>
          <div className="mt-5 space-y-4 text-sm text-text-light">
            <div className="flex items-center justify-between gap-3 rounded-3xl bg-black/5 px-4 py-3">
              <div>
                <p className="font-black text-text-main">Two-step verification</p>
                <p className="text-xs uppercase tracking-[0.35em] text-text-light">Strong</p>
              </div>
              <span className="rounded-full bg-success/10 px-3 py-1 text-[10px] font-black uppercase text-success">
                Enabled
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-3xl bg-black/5 px-4 py-3">
              <div>
                <p className="font-black text-text-main">Account type</p>
                <p className="text-xs uppercase tracking-[0.35em] text-text-light">Membership tier</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase text-primary">
                {accountType}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-3xl bg-black/5 px-4 py-3">
              <div>
                <p className="font-black text-text-main">Saved contact</p>
                <p className="text-xs uppercase tracking-[0.35em] text-text-light">Phone verified</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase text-primary">
                Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="Global Aura" value="+1,240" color="text-yellow-500" />
        <StatCard label="Savings Rate" value="64%" color="text-green-500" />
        <StatCard label="Achievements" value="12/50" color="text-purple-500" />
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-[35px] border border-gray-100 shadow-sm"
    >
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{label}</p>
      <p className={`text-3xl font-black tracking-tighter ${color}`}>{value}</p>
    </motion.div>
  );
}
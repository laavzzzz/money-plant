"use client";

import { useEffect, useState } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔄 simulate fetching user
  useEffect(() => {
    setTimeout(() => {
      setUser({
        id: "1",
        name: "Ananya",
        email: "ananya@mail.com",
      });
      setLoading(false);
    }, 800);
  }, []);

  const login = async () => {
    // 👉 replace with real auth later
    setUser({
      id: "1",
      name: "Ananya",
      email: "ananya@mail.com",
    });
  };

  const logout = () => {
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout,
  };
}
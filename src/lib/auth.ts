export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  // 🔥 Replace later with real auth
  return {
    id: "1",
    name: "Ananya",
    email: "ananya@mail.com",
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}
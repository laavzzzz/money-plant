export async function apiFetch(
  url: string,
  options?: RequestInit
) {
  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    if (!res.ok) {
      throw new Error("API Error");
    }

    return res.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
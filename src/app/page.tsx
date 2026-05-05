import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">MoneyPlant 🌿</h1>
        <p className="text-gray-500 mt-2">
          Grow your savings beautifully
        </p>

        <Link href="/dashboard">
          <button className="mt-6 px-6 py-3 bg-yellow-400 rounded-full text-white">
            Enter App
          </button>
        </Link>
      </div>
    </main>
  );
}
import ProgressBar from "./ProgressBars";

export default function GoalCard() {
  return (
    <div className="bg-white rounded-3xl p-4 shadow-md">

      <p className="font-semibold">New Laptop 💻</p>

      <ProgressBar value={60} />

      <p className="text-xs mt-2 text-gray-400">
        ₹45,000 / ₹80,000
      </p>

    </div>
  );
}
"use client";

export default function FloatingButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-4 bg-green-500 text-white p-4 rounded-full shadow-xl hover:scale-110 transition"
    >
      🤖
    </button>
  );
}
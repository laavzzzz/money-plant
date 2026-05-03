export default function BadgeDisplay({ label }: { label: string }) {
  return (
    <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs font-bold">
      {label}
    </span>
  );
}
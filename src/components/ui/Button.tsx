export default function Button({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white py-3 rounded-full font-semibold">
      {children}
    </button>
  );
}
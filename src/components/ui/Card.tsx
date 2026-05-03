export default function Card({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#fff3c4] rounded-3xl p-5 shadow-lg">
      {children}
    </div>
  );
}
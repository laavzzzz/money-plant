export default function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center text-gray-400 py-10">
      <p>{text}</p>
    </div>
  );
}
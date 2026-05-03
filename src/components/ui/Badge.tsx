export default function Badge({ text }: { text: string }) {
  return (
    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
      {text}
    </span>
  );
}
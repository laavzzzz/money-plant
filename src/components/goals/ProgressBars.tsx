export default function ProgressBars({ value }: { value: number }) {
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
      <div
        className="h-2 bg-green-400 rounded-full"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
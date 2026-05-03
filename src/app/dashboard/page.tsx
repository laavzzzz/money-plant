import Card from "@/components/ui/Card";
import PlantSection from "@/components/dashboard/PlantSection";
import SafeToSpendCard from "@/components/dashboard/SafeToSpendCard";
import OverviewChart from "@/components/dashboard/OverviewChart";
import QuickActions from "@/components/dashboard/QuickActions";

export default function Dashboard() {
  return (
    <div className="min-h-screen p-6 flex justify-center">
      <div className="w-full max-w-md space-y-6">

        {/* Greeting + Plant */}
        <Card>
          <h2 className="text-lg font-semibold">
            Hi, Ananya 👋
          </h2>
          <PlantSection />
        </Card>

        {/* Safe Spend */}
        <SafeToSpendCard />

        {/* Chart */}
        <OverviewChart />

        {/* Button */}
        <QuickActions />

      </div>
    </div>
  );
}
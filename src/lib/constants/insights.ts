export interface InsightCardData {
  id: number;
  title: string;
  desc: string;
  iconType: "flame" | "alert" | "check";
  color: string;
  border: string;
  progress: string;
}

export const INSIGHTS_DATA: InsightCardData[] = [
  {
    id: 1,
    title: "Big W",
    desc: "Saved ₹500 on coffee this week. Plant is thirsty for more!",
    iconType: "flame",
    color: "bg-orange-500/10",
    border: "border-orange-500/20",
    progress: "75%",
  },
  {
    id: 2,
    title: "Sus Spend",
    desc: "3 subscriptions detected. Do we really need all of them?",
    iconType: "alert",
    color: "bg-vibe-pink/10",
    border: "border-vibe-pink/20",
    progress: "40%",
  },
  {
    id: 3,
    title: "Clean Streak",
    desc: "No 'L' spends for 3 days. Your aura is glowing! ✨",
    iconType: "check",
    color: "bg-vibe-mint/10",
    border: "border-vibe-mint/20",
    progress: "95%",
  },
];
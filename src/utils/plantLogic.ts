import { PLANT_LEVELS } from "@/lib/constants/config";

export function getPlantStage(savings: number) {
  return (
    PLANT_LEVELS
      .slice()
      .reverse()
      .find((level) => savings >= level.min) || PLANT_LEVELS[0]
  );
}

export function getGrowthPercentage(savings: number) {
  return Math.min((savings / 10000) * 100, 100);
}
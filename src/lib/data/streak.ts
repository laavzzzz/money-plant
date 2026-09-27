import { Streak } from "@/models/Streak";
import { tryMongoConnect } from "@/lib/data/mongo";
import { getLocalStreak, saveLocalStreak, type StoreStreak } from "@/lib/data/local-store";
import { getToday, getYesterday } from "@/utils/dateHelpers";

export async function fetchStreak(userId: string): Promise<StoreStreak> {
  const mongoOk = await tryMongoConnect();

  if (mongoOk) {
    try {
      let streak = await Streak.findOne({ userId });
      if (!streak) {
        streak = await Streak.create({
          userId,
          count: 0,
          lastActiveDate: null,
        });
      }
      return {
        userId,
        count: streak.count,
        lastActiveDate: streak.lastActiveDate,
      };
    } catch (err) {
      console.error("Mongo streak fetch failed, using local:", err);
    }
  }

  return getLocalStreak();
}

export async function bumpStreak(userId: string): Promise<StoreStreak> {
  const mongoOk = await tryMongoConnect();
  const today = getToday();
  const yesterday = getYesterday();

  if (mongoOk) {
    try {
      let streak = await Streak.findOne({ userId });

      if (!streak) {
        streak = await Streak.create({
          userId,
          count: 1,
          lastActiveDate: today,
        });
        return {
          userId,
          count: streak.count,
          lastActiveDate: streak.lastActiveDate,
        };
      }

      if (streak.lastActiveDate === today) {
        return {
          userId,
          count: streak.count,
          lastActiveDate: streak.lastActiveDate,
        };
      }

      if (streak.lastActiveDate === yesterday) {
        streak.count += 1;
      } else {
        streak.count = 1;
      }
      streak.lastActiveDate = today;
      await streak.save();

      return {
        userId,
        count: streak.count,
        lastActiveDate: streak.lastActiveDate,
      };
    } catch (err) {
      console.error("Mongo streak update failed, using local:", err);
    }
  }

  const streak = await getLocalStreak();
  streak.userId = userId;
  if (streak.lastActiveDate === today) return streak;

  if (streak.lastActiveDate === yesterday) {
    streak.count += 1;
  } else {
    streak.count = 1;
  }
  streak.lastActiveDate = today;
  await saveLocalStreak(streak);
  return streak;
}

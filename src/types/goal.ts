export interface GoalType {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}
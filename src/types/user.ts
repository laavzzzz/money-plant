export interface UserType {
  id: string;
  name: string;
  email: string;
  image?: string;

  totalIncome: number;
  totalExpense: number;
  streak: number;
}
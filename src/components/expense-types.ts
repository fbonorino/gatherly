import type { ExpenseCategory } from "@prisma/client";

export type ExpenseData = {
  id: string;
  eventId: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  paidBy: string | null;
  date: Date | null;
};

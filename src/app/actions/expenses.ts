"use server";

import { prisma } from "@/lib/prisma";
import { ExpenseCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type ExpenseInput = {
  eventId: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  paidBy: string | null;
  date: Date | null;
};

export async function createExpense(input: ExpenseInput) {
  const expense = await prisma.expense.create({
    data: {
      eventId: input.eventId,
      description: input.description.trim(),
      category: input.category,
      amount: input.amount,
      paidBy: input.paidBy,
      date: input.date,
    },
  });
  revalidatePath(`/events/${input.eventId}`);
  return expense;
}

export async function updateExpense(expenseId: string, input: ExpenseInput) {
  const expense = await prisma.expense.update({
    where: { id: expenseId },
    data: {
      description: input.description.trim(),
      category: input.category,
      amount: input.amount,
      paidBy: input.paidBy,
      date: input.date,
    },
  });
  revalidatePath(`/events/${input.eventId}`);
  return expense;
}

export async function deleteExpense(expenseId: string, eventId: string) {
  await prisma.expense.delete({ where: { id: expenseId } });
  revalidatePath(`/events/${eventId}`);
}

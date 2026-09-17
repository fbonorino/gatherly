"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { ExpenseCategory } from "@prisma/client";
import type { ExpenseData } from "./expense-types";
import ExpenseRow from "./ExpenseRow";
import ExpenseCard from "./ExpenseCard";
import ExpenseFormModal from "./ExpenseFormModal";
import {
  createExpense,
  updateExpense,
  deleteExpense,
} from "@/app/actions/expenses";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ExpensesTable({
  eventId,
  initialExpenses,
}: {
  eventId: string;
  initialExpenses: ExpenseData[];
}) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseData | undefined>();

  const total = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  function openAddModal() {
    setEditingExpense(undefined);
    setModalOpen(true);
  }

  function openEditModal(expense: ExpenseData) {
    setEditingExpense(expense);
    setModalOpen(true);
  }

  async function handleDelete(expenseId: string) {
    const prev = expenses;
    const expense = expenses.find((e) => e.id === expenseId);
    setExpenses((p) => p.filter((e) => e.id !== expenseId));
    try {
      await deleteExpense(expenseId, eventId);
      toast.success(
        expense ? `"${expense.description}" removed` : "Expense removed"
      );
    } catch {
      setExpenses(prev);
      toast.error("Couldn't remove expense");
    }
  }

  async function handleSubmit(data: {
    description: string;
    category: ExpenseCategory;
    amount: number;
    paidBy: string | null;
    date: Date | null;
  }) {
    if (editingExpense) {
      const updated = await updateExpense(editingExpense.id, {
        eventId,
        ...data,
      });
      setExpenses((prev) =>
        prev.map((e) => (e.id === updated.id ? { ...e, ...data } : e))
      );
      toast.success("Expense updated");
    } else {
      const created = await createExpense({ eventId, ...data });
      setExpenses((prev) => [...prev, { ...created, eventId }]);
      toast.success("Expense added");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Card className="py-3 gap-0">
          <CardContent className="px-4">
            <p className="text-xs text-muted-foreground">Total expenses</p>
            <p className="text-xl font-semibold">${total.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Button onClick={openAddModal}>
          <Plus />
          Add expense
        </Button>
      </div>

      {/* Mobile: stacked cards */}
      <div className="sm:hidden space-y-2">
        {expenses.map((expense) => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        ))}
        {expenses.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm border border-border rounded-lg">
            No expenses yet.
          </p>
        )}
      </div>

      {/* Desktop/tablet: table */}
      <div className="hidden sm:block border border-border rounded-lg overflow-x-auto">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Paid by</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense, index) => (
              <ExpenseRow
                key={expense.id}
                expense={expense}
                index={index}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            ))}
          </TableBody>
        </Table>
        {expenses.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">
            No expenses yet.
          </p>
        )}
      </div>

      <ExpenseFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={editingExpense}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

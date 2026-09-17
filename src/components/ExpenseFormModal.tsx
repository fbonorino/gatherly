"use client";

import { useState } from "react";
import type { ExpenseCategory } from "@prisma/client";
import { CalendarIcon, Loader2, X } from "lucide-react";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS } from "@/lib/types";
import type { ExpenseData } from "./expense-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ExpenseFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: ExpenseData;
  onSubmit: (data: {
    description: string;
    category: ExpenseCategory;
    amount: number;
    paidBy: string | null;
    date: Date | null;
  }) => Promise<void>;
};

export default function ExpenseFormModal({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: ExpenseFormModalProps) {
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState<ExpenseCategory>(
    initial?.category ?? "OTHER"
  );
  const [amount, setAmount] = useState(
    initial?.amount != null ? String(initial.amount) : ""
  );
  const [paidBy, setPaidBy] = useState(initial?.paidBy ?? "");
  const [date, setDate] = useState<Date | undefined>(initial?.date ?? undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Adjust state during render when the dialog transitions to open, so it
  // reflects `initial` whether opened by a parent click or internally.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setDescription(initial?.description ?? "");
      setCategory(initial?.category ?? "OTHER");
      setAmount(initial?.amount != null ? String(initial.amount) : "");
      setPaidBy(initial?.paidBy ?? "");
      setDate(initial?.date ?? undefined);
      setError(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      setError("Description is required");
      return;
    }
    const parsedAmount = Number(amount);
    if (!amount.trim() || Number.isNaN(parsedAmount) || parsedAmount < 0) {
      setError("Enter a valid amount");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        description: description.trim(),
        category,
        amount: parsedAmount,
        paidBy: paidBy.trim() || null,
        date: date ?? null,
      });
      onOpenChange(false);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit expense" : "Add expense"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="expense-description">Description</Label>
            <Input
              id="expense-description"
              autoFocus
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Catering, drinks, DJ..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="expense-category">Category</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as ExpenseCategory)}
            >
              <SelectTrigger id="expense-category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {EXPENSE_CATEGORY_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="expense-amount">Amount</Label>
            <Input
              id="expense-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="expense-paid-by">
              Paid by <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="expense-paid-by"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              placeholder="Who fronted this?"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              Date <span className="text-muted-foreground">(optional)</span>
            </Label>
            <div className="flex gap-2">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 justify-start font-normal"
                    />
                  }
                >
                  <CalendarIcon className="size-4 text-muted-foreground" />
                  {date
                    ? date.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "No date"}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      setDate(d);
                      setCalendarOpen(false);
                    }}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
              {date && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Clear date"
                  onClick={() => setDate(undefined)}
                >
                  <X />
                </Button>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

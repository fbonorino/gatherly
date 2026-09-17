import { Pencil } from "lucide-react";
import {
  EXPENSE_CATEGORY_BADGE_CLASSES,
  EXPENSE_CATEGORY_LABELS,
} from "@/lib/types";
import type { ExpenseData } from "./expense-types";
import { formatCurrency } from "@/lib/currency";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DeleteExpenseAction from "./DeleteExpenseAction";

type ExpenseCardProps = {
  expense: ExpenseData;
  onEdit: (expense: ExpenseData) => void;
  onDelete: (expenseId: string) => void;
};

export default function ExpenseCard({
  expense,
  onEdit,
  onDelete,
}: ExpenseCardProps) {
  return (
    <Card className="py-3 gap-2">
      <CardContent className="px-3.5 flex items-start gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium leading-tight truncate">
              {expense.description}
            </p>
            <p className="font-semibold shrink-0">
              {formatCurrency(expense.amount, { cents: true })}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={EXPENSE_CATEGORY_BADGE_CLASSES[expense.category]}>
              {EXPENSE_CATEGORY_LABELS[expense.category]}
            </Badge>
            {expense.date && (
              <span className="text-xs text-muted-foreground">
                {expense.date.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>

          {expense.paidBy && (
            <p className="text-xs text-muted-foreground truncate">
              Paid by {expense.paidBy}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-0.5 shrink-0 -mr-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(expense)}
            aria-label={`Edit expense ${expense.description}`}
          >
            <Pencil />
          </Button>
          <DeleteExpenseAction
            description={expense.description}
            onDelete={() => onDelete(expense.id)}
            size="icon"
          />
        </div>
      </CardContent>
    </Card>
  );
}

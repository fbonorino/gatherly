import { Pencil } from "lucide-react";
import {
  EXPENSE_CATEGORY_BADGE_CLASSES,
  EXPENSE_CATEGORY_LABELS,
} from "@/lib/types";
import type { ExpenseData } from "./expense-types";
import { formatCurrency } from "@/lib/currency";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DeleteExpenseAction from "./DeleteExpenseAction";

type ExpenseRowProps = {
  expense: ExpenseData;
  index: number;
  onEdit: (expense: ExpenseData) => void;
  onDelete: (expenseId: string) => void;
};

export default function ExpenseRow({
  expense,
  index,
  onEdit,
  onDelete,
}: ExpenseRowProps) {
  return (
    <TableRow className={index % 2 === 1 ? "bg-muted/50" : undefined}>
      <TableCell className="font-medium">{expense.description}</TableCell>
      <TableCell>
        <Badge className={EXPENSE_CATEGORY_BADGE_CLASSES[expense.category]}>
          {EXPENSE_CATEGORY_LABELS[expense.category]}
        </Badge>
      </TableCell>
      <TableCell>{formatCurrency(expense.amount, { cents: true })}</TableCell>
      <TableCell className="text-muted-foreground">
        {expense.paidBy || <span className="text-muted-foreground">—</span>}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {expense.date
          ? expense.date.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "—"}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(expense)}
            aria-label={`Edit expense ${expense.description}`}
          >
            <Pencil />
          </Button>
          <DeleteExpenseAction
            description={expense.description}
            onDelete={() => onDelete(expense.id)}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

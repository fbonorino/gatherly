import { Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import type { GuestData } from "./guest-types";
import type { ExpenseData } from "./expense-types";

export default function BalanceCard({
  guests,
  expenses,
}: {
  guests: GuestData[];
  expenses: ExpenseData[];
}) {
  const collected = guests
    .filter((g) => g.mustPay && g.hasPaid)
    .reduce((sum, g) => sum + (g.amount ?? 0), 0);
  const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = collected - spent;
  const isPositive = balance >= 0;

  return (
    <Card className="py-4 gap-0">
      <CardContent className="px-4 flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Scale className="size-4" />
        </div>
        <div className="min-w-0 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <span className="text-sm">
            Collected{" "}
            <span className="font-semibold">{formatCurrency(collected)}</span>
          </span>
          <span className="text-muted-foreground text-sm">·</span>
          <span className="text-sm">
            Spent <span className="font-semibold">{formatCurrency(spent)}</span>
          </span>
          <span className="text-muted-foreground text-sm">·</span>
          <span className="text-sm">
            Balance{" "}
            <span
              className={`font-semibold ${
                isPositive ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {isPositive ? "+" : "-"}
              {formatCurrency(Math.abs(balance))}
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

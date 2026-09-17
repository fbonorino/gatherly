import { Users, CircleDollarSign, CheckCircle2, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { GuestData } from "./guest-types";

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Card className="py-4 gap-0">
      <CardContent className="px-4 flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-semibold leading-tight truncate">{value}</p>
          <p className="text-xs text-muted-foreground truncate">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SummaryBar({ guests }: { guests: GuestData[] }) {
  const total = guests.length;
  const mustPay = guests.filter((g) => g.mustPay);
  const paidCount = guests.filter((g) => g.hasPaid).length;
  const collected = mustPay
    .filter((g) => g.hasPaid)
    .reduce((sum, g) => sum + (g.amount ?? 0), 0);
  const pending = mustPay
    .filter((g) => !g.hasPaid)
    .reduce((sum, g) => sum + (g.amount ?? 0), 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard icon={Users} label="Guests" value={total} />
      <StatCard icon={Wallet} label="Must pay" value={mustPay.length} />
      <StatCard
        icon={CheckCircle2}
        label="Paid"
        value={`${paidCount}/${mustPay.length}`}
      />
      <StatCard
        icon={CircleDollarSign}
        label="Collected / Pending"
        value={
          <span>
            <span className="text-emerald-400">${collected.toFixed(0)}</span>
            <span className="text-muted-foreground"> / </span>
            <span className="text-amber-400">${pending.toFixed(0)}</span>
          </span>
        }
      />
    </div>
  );
}

import { Users, CircleDollarSign, CheckCircle2, Wallet, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { cn } from "cn";
import type { GuestData } from "./guest-types";

function StatCard({
  icon: Icon,
  label,
  value,
  wide = false,
  compact = false,
  iconClassName = "bg-primary/10 text-primary",
}: {
  icon: React.ElementType;
  label?: string;
  value: React.ReactNode;
  wide?: boolean;
  compact?: boolean;
  iconClassName?: string;
}) {
  return (
    <Card
      className={cn(
        "py-4 gap-0 min-w-0",
        wide && "col-span-2 md:col-span-1 lg:col-span-2"
      )}
    >
      <CardContent className="px-3 flex items-center gap-2 min-w-0">
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
        >
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          {compact ? (
            <div className="space-y-0.5">{value}</div>
          ) : (
            <p className="text-lg font-semibold leading-tight truncate">
              {value}
            </p>
          )}
          {label && (
            <p className="text-xs text-muted-foreground truncate">{label}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SummaryBar({ guests }: { guests: GuestData[] }) {
  const total = guests.length;
  const mustPay = guests.filter((g) => g.mustPay);
  const paidCount = guests.filter((g) => g.hasPaid).length;
  const confirmedCount = guests.filter((g) => g.rsvpStatus === "CONFIRMED").length;
  const collected = mustPay
    .filter((g) => g.hasPaid)
    .reduce((sum, g) => sum + (g.amount ?? 0), 0);
  const pending = mustPay
    .filter((g) => !g.hasPaid)
    .reduce((sum, g) => sum + (g.amount ?? 0), 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatCard icon={Users} label="Guests" value={total} />
      <StatCard icon={Wallet} label="Must pay" value={mustPay.length} />
      <StatCard
        icon={UserCheck}
        label="Confirmed"
        value={`${confirmedCount}/${total}`}
        iconClassName="bg-sky-500/10 text-sky-400"
      />
      <StatCard
        icon={CheckCircle2}
        label="Paid"
        value={`${paidCount}/${mustPay.length}`}
        iconClassName="bg-emerald-500/10 text-emerald-400"
      />
      <StatCard
        icon={CircleDollarSign}
        wide
        compact
        value={
          <>
            <p className="text-sm font-semibold leading-tight truncate">
              <span className="text-emerald-400">
                {formatCurrency(collected)}
              </span>{" "}
              <span className="text-muted-foreground font-normal text-xs">
                collected
              </span>
            </p>
            <p className="text-sm font-semibold leading-tight truncate">
              <span className="text-amber-400">{formatCurrency(pending)}</span>{" "}
              <span className="text-muted-foreground font-normal text-xs">
                pending
              </span>
            </p>
          </>
        }
      />
    </div>
  );
}

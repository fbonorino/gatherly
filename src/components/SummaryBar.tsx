import { Users, CircleDollarSign, CheckCircle2, Wallet, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { GuestData } from "./guest-types";

function StatCard({
  icon: Icon,
  label,
  value,
  wide = false,
  iconClassName = "bg-primary/10 text-primary",
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  wide?: boolean;
  iconClassName?: string;
}) {
  return (
    <Card className={`py-4 gap-0 ${wide ? "col-span-2 sm:col-span-1" : ""}`}>
      <CardContent className="px-4 flex items-center gap-3">
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
        >
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-semibold leading-tight whitespace-nowrap">
            {value}
          </p>
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
  const confirmedCount = guests.filter((g) => g.rsvpStatus === "CONFIRMED").length;
  const collected = mustPay
    .filter((g) => g.hasPaid)
    .reduce((sum, g) => sum + (g.amount ?? 0), 0);
  const pending = mustPay
    .filter((g) => !g.hasPaid)
    .reduce((sum, g) => sum + (g.amount ?? 0), 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
        label="Collected / Pending"
        wide
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

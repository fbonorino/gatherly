import Link from "next/link";
import type { EventType } from "@prisma/client";
import { Users } from "lucide-react";
import { eventDisplayType, EVENT_TYPE_ICONS } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type EventCardProps = {
  id: string;
  name: string;
  type: EventType;
  customType?: string | null;
  date: Date;
  guestCount: number;
};

export default function EventCard({
  id,
  name,
  type,
  customType,
  date,
  guestCount,
}: EventCardProps) {
  const Icon = EVENT_TYPE_ICONS[type];

  return (
    <Link href={`/events/${id}`} className="block group">
      <Card className="gap-4 py-5 transition-all duration-200 group-hover:border-primary/50 group-hover:shadow-[0_0_0_1px_var(--primary)] group-hover:-translate-y-0.5">
        <CardHeader className="px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <h2 className="font-semibold text-base leading-tight text-foreground">
                {name}
              </h2>
            </div>
            <Badge variant="secondary" className="shrink-0">
              {eventDisplayType(type, customType)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-5 flex flex-col gap-1.5">
          <p className="text-sm text-muted-foreground">
            {date.toLocaleDateString(undefined, {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}{" "}
            ·{" "}
            {date.toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Users className="size-3.5" />
            {guestCount} guest{guestCount === 1 ? "" : "s"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

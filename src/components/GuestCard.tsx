"use client";

import { useTransition } from "react";
import { Pencil } from "lucide-react";
import type { RsvpStatus } from "@prisma/client";
import {
  GENDER_LABELS,
  RSVP_STATUS_BADGE_CLASSES,
  RSVP_STATUS_LABELS,
  RSVP_STATUSES,
} from "@/lib/types";
import { initials, type GuestData } from "./guest-types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DeleteGuestAction from "./DeleteGuestAction";

type GuestCardProps = {
  guest: GuestData;
  onTogglePaid: (guestId: string, hasPaid: boolean) => void;
  onRsvpChange: (guestId: string, rsvpStatus: RsvpStatus) => void;
  onMustPayChange: (guestId: string, mustPay: boolean) => void;
  onEdit: (guest: GuestData) => void;
  onDelete: (guestId: string) => void;
};

export default function GuestCard({
  guest,
  onTogglePaid,
  onRsvpChange,
  onMustPayChange,
  onEdit,
  onDelete,
}: GuestCardProps) {
  const [, startTransition] = useTransition();

  return (
    <Card className="py-3 gap-2">
      <CardContent className="px-3.5 flex items-start gap-3">
        <Avatar className="size-9 mt-0.5 shrink-0">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {initials(guest.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium leading-tight truncate">{guest.name}</p>
            <button
              onClick={() =>
                startTransition(() => onTogglePaid(guest.id, !guest.hasPaid))
              }
              className="shrink-0"
            >
              <Badge
                className={
                  guest.hasPaid
                    ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 cursor-pointer"
                    : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 cursor-pointer"
                }
              >
                {guest.hasPaid ? "Paid" : "Pending"}
              </Badge>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{GENDER_LABELS[guest.gender]}</span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              Must pay
              <Switch
                size="sm"
                checked={guest.mustPay}
                onCheckedChange={(checked) =>
                  startTransition(() => onMustPayChange(guest.id, checked))
                }
                aria-label={`Toggle must pay for ${guest.name}`}
              />
              {guest.mustPay && guest.amount != null && `$${guest.amount}`}
            </span>
          </div>

          <Select
            value={guest.rsvpStatus}
            onValueChange={(value) =>
              startTransition(() =>
                onRsvpChange(guest.id, value as RsvpStatus)
              )
            }
          >
            <SelectTrigger className="h-auto w-fit border-0 bg-transparent p-0 shadow-none hover:opacity-80 dark:bg-transparent dark:hover:bg-transparent [&_svg]:hidden">
              <SelectValue>
                {() => (
                  <Badge
                    className={`cursor-pointer ${RSVP_STATUS_BADGE_CLASSES[guest.rsvpStatus]}`}
                  >
                    {RSVP_STATUS_LABELS[guest.rsvpStatus]}
                  </Badge>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {RSVP_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {RSVP_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {guest.comments && (
            <p className="text-xs text-muted-foreground truncate">
              {guest.comments}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-0.5 shrink-0 -mr-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(guest)}
            aria-label={`Edit ${guest.name}`}
          >
            <Pencil />
          </Button>
          <DeleteGuestAction
            guestName={guest.name}
            onDelete={() => onDelete(guest.id)}
            size="icon"
          />
        </div>
      </CardContent>
    </Card>
  );
}

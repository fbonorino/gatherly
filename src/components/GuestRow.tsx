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
import { TableRow, TableCell } from "@/components/ui/table";
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

type GuestRowProps = {
  guest: GuestData;
  index: number;
  onTogglePaid: (guestId: string, hasPaid: boolean) => void;
  onRsvpChange: (guestId: string, rsvpStatus: RsvpStatus) => void;
  onMustPayChange: (guestId: string, mustPay: boolean) => void;
  onEdit: (guest: GuestData) => void;
  onDelete: (guestId: string) => void;
};

export default function GuestRow({
  guest,
  index,
  onTogglePaid,
  onRsvpChange,
  onMustPayChange,
  onEdit,
  onDelete,
}: GuestRowProps) {
  const [, startTransition] = useTransition();

  return (
    <TableRow className={index % 2 === 1 ? "bg-muted/50" : undefined}>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2.5">
          <Avatar className="size-7">
            <AvatarFallback className="text-[11px] bg-primary/10 text-primary">
              {initials(guest.name)}
            </AvatarFallback>
          </Avatar>
          {guest.name}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {GENDER_LABELS[guest.gender]}
      </TableCell>
      <TableCell>
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
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-1.5">
          <Switch
            checked={guest.mustPay}
            onCheckedChange={(checked) =>
              startTransition(() => onMustPayChange(guest.id, checked))
            }
            aria-label={`Toggle must pay for ${guest.name}`}
          />
          {guest.mustPay && guest.amount != null && (
            <span className="text-muted-foreground text-xs">
              ${guest.amount}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-center">
        <button
          onClick={() =>
            startTransition(() => onTogglePaid(guest.id, !guest.hasPaid))
          }
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
      </TableCell>
      <TableCell className="text-muted-foreground max-w-40 truncate">
        {guest.comments}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(guest)}
            aria-label={`Edit ${guest.name}`}
          >
            <Pencil />
          </Button>
          <DeleteGuestAction
            guestName={guest.name}
            onDelete={() => onDelete(guest.id)}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

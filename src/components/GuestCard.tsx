"use client";

import { useTransition } from "react";
import { Pencil } from "lucide-react";
import { GENDER_LABELS, RSVP_STATUS_BADGE_CLASSES, RSVP_STATUS_LABELS } from "@/lib/types";
import { initials, type GuestData } from "./guest-types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import DeleteGuestAction from "./DeleteGuestAction";

type GuestCardProps = {
  guest: GuestData;
  onTogglePaid: (guestId: string, hasPaid: boolean) => void;
  onEdit: (guest: GuestData) => void;
  onDelete: (guestId: string) => void;
};

export default function GuestCard({
  guest,
  onTogglePaid,
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

          <p className="text-xs text-muted-foreground">
            {GENDER_LABELS[guest.gender]}
            {" · "}
            {guest.mustPay ? (
              <>Must pay{guest.amount != null ? ` ($${guest.amount})` : ""}</>
            ) : (
              "No payment due"
            )}
          </p>

          <Badge className={RSVP_STATUS_BADGE_CLASSES[guest.rsvpStatus]}>
            {RSVP_STATUS_LABELS[guest.rsvpStatus]}
          </Badge>

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

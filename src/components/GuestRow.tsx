"use client";

import { useTransition } from "react";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { GENDER_LABELS } from "@/lib/types";
import type { GuestData } from "./guest-types";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type GuestRowProps = {
  guest: GuestData;
  index: number;
  onTogglePaid: (guestId: string, hasPaid: boolean) => void;
  onEdit: (guest: GuestData) => void;
  onDelete: (guestId: string) => void;
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function GuestRow({
  guest,
  index,
  onTogglePaid,
  onEdit,
  onDelete,
}: GuestRowProps) {
  const [, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();

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
      <TableCell className="text-center">
        {guest.mustPay ? (
          <span>
            Yes{guest.amount != null ? ` ($${guest.amount})` : ""}
          </span>
        ) : (
          <span className="text-muted-foreground">No</span>
        )}
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
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${guest.name}`}
                />
              }
            >
              <Trash2 />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove {guest.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove them from the guest list. This action
                  can&apos;t be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={isDeleting}
                  onClick={() => startDelete(() => onDelete(guest.id))}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

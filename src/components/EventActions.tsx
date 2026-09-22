"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Pencil, MoreVertical, Copy, Trash2, Loader2 } from "lucide-react";
import { duplicateEvent, deleteEvent } from "@/app/actions/events";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export default function EventActions({ eventId }: { eventId: string }) {
  const [isDuplicating, startDuplicate] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Button render={<Link href={`/events/${eventId}/edit`} />} nativeButton={false} variant="outline">
        <Pencil />
        Edit
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={isDuplicating}
            closeOnClick
            onClick={() => {
              startDuplicate(() => duplicateEvent(eventId));
            }}
          >
            {isDuplicating ? <Loader2 className="animate-spin" /> : <Copy />}
            Duplicate
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="destructive" />}>
          <Trash2 />
          Delete
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the event and all of its guests.
              This action can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={() => {
                startDelete(() => deleteEvent(eventId));
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

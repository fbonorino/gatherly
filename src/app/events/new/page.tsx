import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EventForm from "@/components/EventForm";
import { createEvent } from "@/app/actions/events";

export default function NewEventPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-8 w-full">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">New event</h1>
        <p className="text-sm text-muted-foreground">
          Set up a new event and start inviting guests.
        </p>
      </div>
      <EventForm action={createEvent} submitLabel="Create event" />
    </main>
  );
}

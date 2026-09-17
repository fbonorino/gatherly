import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import EventForm from "@/components/EventForm";
import { updateEvent } from "@/app/actions/events";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) notFound();

  const action = updateEvent.bind(null, event.id);

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-8 w-full">
      <Link
        href={`/events/${event.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Edit event</h1>
        <p className="text-sm text-muted-foreground">
          Update the details for {event.name}.
        </p>
      </div>
      <EventForm action={action} defaultValues={event} submitLabel="Save changes" />
    </main>
  );
}

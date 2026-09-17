import Link from "next/link";
import { Suspense } from "react";
import { Plus, PartyPopper } from "lucide-react";
import { prisma } from "@/lib/prisma";
import EventCard from "@/components/EventCard";
import ToastFlag from "@/components/ToastFlag";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
    include: { _count: { select: { guests: true } } },
  });

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-8 w-full">
      <Suspense fallback={null}>
        <ToastFlag param="deleted" message="Event deleted" />
      </Suspense>

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Gatherly</h1>
        <Button render={<Link href="/events/new" />} nativeButton={false}>
          <Plus />
          New event
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-24 rounded-lg border border-dashed border-border">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
            <PartyPopper className="size-6" />
          </div>
          <p className="text-muted-foreground mb-4">No events yet.</p>
          <Button render={<Link href="/events/new" />} nativeButton={false}>
            <Plus />
            Create your first event
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              name={event.name}
              type={event.type}
              customType={event.customType}
              date={event.date}
              guestCount={event._count.guests}
            />
          ))}
        </div>
      )}
    </main>
  );
}

import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, CalendarDays } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { eventDisplayType, EVENT_TYPE_ICONS } from "@/lib/types";
import GuestTable from "@/components/GuestTable";
import ExpensesTable from "@/components/ExpensesTable";
import BalanceCard from "@/components/BalanceCard";
import EventActions from "@/components/EventActions";
import ToastFlag from "@/components/ToastFlag";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      guests: { orderBy: { createdAt: "asc" } },
      expenses: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!event) notFound();

  const Icon = EVENT_TYPE_ICONS[event.type];

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-8 w-full">
      <Suspense fallback={null}>
        <ToastFlag param="created" message="Event created" />
        <ToastFlag param="updated" message="Event updated" />
        <ToastFlag param="duplicated" message="Event duplicated" />
      </Suspense>

      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">{event.name}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">
                {eventDisplayType(event.type, event.customType)}
              </Badge>
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="size-3.5" />
                {event.date.toLocaleDateString(undefined, {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}{" "}
                ·{" "}
                {event.date.toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
              {event.location && (
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {event.location}
                </span>
              )}
            </div>
          </div>
        </div>
        <EventActions eventId={event.id} />
      </div>

      {event.notes && (
        <p className="text-sm text-muted-foreground bg-card border border-border rounded-lg p-4 whitespace-pre-wrap">
          {event.notes}
        </p>
      )}

      <BalanceCard guests={event.guests} expenses={event.expenses} />

      <Tabs defaultValue="guests">
        <TabsList>
          <TabsTrigger value="guests">Guests</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>
        <TabsContent value="guests" className="pt-6">
          <GuestTable eventId={event.id} initialGuests={event.guests} />
        </TabsContent>
        <TabsContent value="expenses" className="pt-6">
          <ExpensesTable eventId={event.id} initialExpenses={event.expenses} />
        </TabsContent>
      </Tabs>
    </main>
  );
}

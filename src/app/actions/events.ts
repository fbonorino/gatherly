"use server";

import { prisma } from "@/lib/prisma";
import { EventType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type EventFormInput = {
  name: string;
  type: EventType;
  customType?: string;
  date: string; // datetime-local string
  location?: string;
  notes?: string;
};

function parseEventForm(formData: FormData): EventFormInput {
  return {
    name: String(formData.get("name") ?? "").trim(),
    type: String(formData.get("type") ?? "OTHER") as EventType,
    customType: String(formData.get("customType") ?? "").trim() || undefined,
    date: String(formData.get("date") ?? ""),
    location: String(formData.get("location") ?? "").trim() || undefined,
    notes: String(formData.get("notes") ?? "").trim() || undefined,
  };
}

export async function createEvent(formData: FormData) {
  const input = parseEventForm(formData);
  if (!input.name || !input.date) {
    throw new Error("Name and date are required");
  }

  const event = await prisma.event.create({
    data: {
      name: input.name,
      type: input.type,
      customType: input.type === "OTHER" ? input.customType : null,
      date: new Date(input.date),
      location: input.location,
      notes: input.notes,
    },
  });

  revalidatePath("/");
  redirect(`/events/${event.id}?created=1`);
}

export async function updateEvent(eventId: string, formData: FormData) {
  const input = parseEventForm(formData);
  if (!input.name || !input.date) {
    throw new Error("Name and date are required");
  }

  await prisma.event.update({
    where: { id: eventId },
    data: {
      name: input.name,
      type: input.type,
      customType: input.type === "OTHER" ? input.customType : null,
      date: new Date(input.date),
      location: input.location,
      notes: input.notes,
    },
  });

  revalidatePath("/");
  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}?updated=1`);
}

export async function deleteEvent(eventId: string) {
  await prisma.event.delete({ where: { id: eventId } });
  revalidatePath("/");
  redirect("/?deleted=1");
}

export async function duplicateEvent(eventId: string) {
  const original = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
  });

  const copy = await prisma.event.create({
    data: {
      name: `${original.name} (copy)`,
      type: original.type,
      customType: original.customType,
      date: original.date,
      location: original.location,
      notes: original.notes,
    },
  });

  revalidatePath("/");
  redirect(`/events/${copy.id}?duplicated=1`);
}

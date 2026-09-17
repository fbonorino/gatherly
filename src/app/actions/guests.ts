"use server";

import { prisma } from "@/lib/prisma";
import { Gender, RsvpStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { resolveRsvpStatus } from "@/lib/rsvp";

export type GuestInput = {
  eventId: string;
  name: string;
  gender: Gender;
  mustPay: boolean;
  hasPaid: boolean;
  rsvpStatus: RsvpStatus;
  amount: number | null;
  comments: string | null;
};

export async function createGuest(input: GuestInput) {
  const guest = await prisma.guest.create({
    data: {
      eventId: input.eventId,
      name: input.name.trim(),
      gender: input.gender,
      mustPay: input.mustPay,
      hasPaid: input.hasPaid,
      rsvpStatus: resolveRsvpStatus(input.hasPaid, input.rsvpStatus),
      amount: input.amount,
      comments: input.comments,
    },
  });
  revalidatePath(`/events/${input.eventId}`);
  return guest;
}

export async function updateGuest(guestId: string, input: GuestInput) {
  const guest = await prisma.guest.update({
    where: { id: guestId },
    data: {
      name: input.name.trim(),
      gender: input.gender,
      mustPay: input.mustPay,
      hasPaid: input.hasPaid,
      rsvpStatus: resolveRsvpStatus(input.hasPaid, input.rsvpStatus),
      amount: input.amount,
      comments: input.comments,
    },
  });
  revalidatePath(`/events/${input.eventId}`);
  return guest;
}

export async function deleteGuest(guestId: string, eventId: string) {
  await prisma.guest.delete({ where: { id: guestId } });
  revalidatePath(`/events/${eventId}`);
}

export async function toggleGuestPaid(guestId: string, eventId: string, hasPaid: boolean) {
  const guest = await prisma.guest.update({
    where: { id: guestId },
    data: {
      hasPaid,
      // One-directional rule: forces CONFIRMED when marking paid, but
      // leaves rsvpStatus untouched (omitted from the update) when
      // unmarking - see src/lib/rsvp.ts.
      ...(hasPaid ? { rsvpStatus: RsvpStatus.CONFIRMED } : {}),
    },
  });
  revalidatePath(`/events/${eventId}`);
  return guest;
}

export async function updateGuestRsvpStatus(
  guestId: string,
  eventId: string,
  rsvpStatus: RsvpStatus
) {
  const existing = await prisma.guest.findUniqueOrThrow({
    where: { id: guestId },
    select: { hasPaid: true },
  });
  const guest = await prisma.guest.update({
    where: { id: guestId },
    data: { rsvpStatus: resolveRsvpStatus(existing.hasPaid, rsvpStatus) },
  });
  revalidatePath(`/events/${eventId}`);
  return guest;
}

export async function updateGuestMustPay(
  guestId: string,
  eventId: string,
  mustPay: boolean
) {
  const guest = await prisma.guest.update({
    where: { id: guestId },
    data: { mustPay },
  });
  revalidatePath(`/events/${eventId}`);
  return guest;
}

"use server";

import { prisma } from "@/lib/prisma";
import { Gender } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type GuestInput = {
  eventId: string;
  name: string;
  gender: Gender;
  mustPay: boolean;
  hasPaid: boolean;
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
    data: { hasPaid },
  });
  revalidatePath(`/events/${eventId}`);
  return guest;
}

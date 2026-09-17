import type { Gender } from "@prisma/client";

export type GuestData = {
  id: string;
  eventId: string;
  name: string;
  gender: Gender;
  mustPay: boolean;
  hasPaid: boolean;
  amount: number | null;
  comments: string | null;
};

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

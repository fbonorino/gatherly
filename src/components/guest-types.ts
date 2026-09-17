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

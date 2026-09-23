import type { RsvpStatus } from "@prisma/client";

/**
 * Single source of truth for the hasPaid -> rsvpStatus business rule:
 * paying implies attending, so hasPaid=true always forces CONFIRMED
 * (overriding even an explicit DECLINED selection). The relationship is
 * one-directional - hasPaid=false never changes rsvpStatus, it just
 * passes the requested status through untouched.
 *
 * Used by every write path (quick toggle, add dialog, edit dialog) so the
 * rule can't drift between call sites.
 */
export function resolveRsvpStatus(
  hasPaid: boolean,
  requestedStatus: RsvpStatus
): RsvpStatus {
  return hasPaid ? "CONFIRMED" : requestedStatus;
}

/**
 * Whether a guest's payment still counts toward the event's money metrics.
 * A guest who declined isn't attending, so they're not expected to pay even
 * if mustPay is on - their amount is excluded from "must pay" and "pending".
 */
export function owesPayment(guest: {
  mustPay: boolean;
  rsvpStatus: RsvpStatus;
}): boolean {
  return guest.mustPay && guest.rsvpStatus !== "DECLINED";
}

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

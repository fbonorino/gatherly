import type { RsvpStatus } from "@prisma/client";

type PaymentFields = {
  mustPay: boolean;
  hasPaid: boolean;
  rsvpStatus: RsvpStatus;
  amount: number | null;
};

/**
 * Only confirmed guests can owe money. Pending and Declined guests never
 * count as payable, and the UI hides/disables the must-pay controls for them.
 */
export function canOwePayment(rsvpStatus: RsvpStatus) {
  return rsvpStatus === "CONFIRMED";
}

/**
 * Single source of truth for "does this guest owe money?". The raw mustPay
 * flag is deliberately left untouched in the DB when RSVP changes, so a guest
 * who goes Pending -> Confirmed gets their previous must-pay setting back.
 */
export function isPayable(guest: Pick<PaymentFields, "mustPay" | "rsvpStatus">) {
  return canOwePayment(guest.rsvpStatus) && guest.mustPay;
}

/**
 * What the Paid column shows for a guest:
 * - PAID: a payment was recorded. Shown regardless of RSVP/mustPay so real
 *   money received is never hidden.
 * - PENDING: payable and not paid yet.
 * - NONE: nothing to pay (not confirmed, or confirmed but exempt).
 */
export type PaymentStatus = "PAID" | "PENDING" | "NONE";

export function paymentStatus(
  guest: Pick<PaymentFields, "mustPay" | "hasPaid" | "rsvpStatus">
): PaymentStatus {
  if (guest.hasPaid) return "PAID";
  if (isPayable(guest)) return "PENDING";
  return "NONE";
}

export type PaymentFilter = "ALL" | "PAID" | "PENDING";

export function parsePaymentFilter(value: string | null): PaymentFilter {
  return value === "PAID" || value === "PENDING" ? value : "ALL";
}

/** Shared by the guest table and the CSV export so both filter identically. */
export function matchesPaymentFilter(
  guest: Pick<PaymentFields, "mustPay" | "hasPaid" | "rsvpStatus">,
  filter: PaymentFilter
) {
  return filter === "ALL" || paymentStatus(guest) === filter;
}

export type PaymentStats = {
  /** Guests who owe money (isPayable). */
  payableCount: number;
  /** Payable guests who have paid. */
  paidPayableCount: number;
  /** Every recorded payment, regardless of current RSVP or mustPay. */
  collected: number;
  /** Amounts still owed by payable guests who haven't paid. */
  pending: number;
};

export function computePaymentStats(guests: PaymentFields[]): PaymentStats {
  const stats: PaymentStats = {
    payableCount: 0,
    paidPayableCount: 0,
    collected: 0,
    pending: 0,
  };
  for (const g of guests) {
    const amount = g.amount ?? 0;
    if (g.hasPaid) stats.collected += amount;
    if (isPayable(g)) {
      stats.payableCount += 1;
      if (g.hasPaid) stats.paidPayableCount += 1;
      else stats.pending += amount;
    }
  }
  return stats;
}

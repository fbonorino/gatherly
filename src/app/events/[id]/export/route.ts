import { NextResponse } from "next/server";
import type { Gender, RsvpStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  canOwePayment,
  computePaymentStats,
  isPayable,
  matchesPaymentFilter,
  parsePaymentFilter,
  paymentStatus,
} from "@/lib/payments";
import {
  GENDER_LABELS,
  GENDERS,
  RSVP_STATUS_LABELS,
  RSVP_STATUSES,
} from "@/lib/types";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { guests: { orderBy: { createdAt: "asc" } } },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Mirrors the filtering logic in GuestTable.tsx so the export matches
  // whatever the guest table currently shows.
  const searchParams = new URL(req.url).searchParams;
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const genderParam = searchParams.get("gender");
  const rsvpParam = searchParams.get("rsvp");
  const paymentParam = searchParams.get("payment");

  const genderFilter = GENDERS.includes(genderParam as Gender)
    ? (genderParam as Gender)
    : null;
  const rsvpFilter = RSVP_STATUSES.includes(rsvpParam as RsvpStatus)
    ? (rsvpParam as RsvpStatus)
    : null;
  const paymentFilter = parsePaymentFilter(paymentParam);

  const guests = event.guests.filter((g) => {
    if (search && !g.name.toLowerCase().includes(search)) return false;
    if (genderFilter && g.gender !== genderFilter) return false;
    if (rsvpFilter && g.rsvpStatus !== rsvpFilter) return false;
    if (!matchesPaymentFilter(g, paymentFilter)) return false;
    return true;
  });

  const header = [
    "Name",
    "Gender",
    "RSVP",
    "Must Pay",
    "Paid",
    "Amount",
    "Comments",
    "Balance",
    "Status",
  ];

  const rows = guests.map((g) => {
    const canOwe = canOwePayment(g.rsvpStatus);
    const payable = isPayable(g);
    const status = paymentStatus(g);
    // Balance still owed; only payable guests who haven't paid owe anything.
    const balance = status === "PENDING" ? (g.amount ?? 0) : 0;

    const statusLabel =
      status === "PAID"
        ? "Pagado"
        : status === "PENDING"
          ? "Pendiente"
          : !canOwe
            ? g.rsvpStatus === "DECLINED"
              ? "Declinado"
              : "Sin confirmar"
            : "Exento";

    // Must Pay / Paid / Amount are left empty when they don't apply (guest
    // not confirmed), except that a recorded payment is always shown.
    return [
      g.name,
      GENDER_LABELS[g.gender],
      RSVP_STATUS_LABELS[g.rsvpStatus],
      canOwe ? (g.mustPay ? "Yes" : "No") : "",
      status === "PAID" ? "Yes" : payable ? "No" : "",
      (payable || g.hasPaid) && g.amount != null ? String(g.amount) : "",
      g.comments ?? "",
      String(balance),
      statusLabel,
    ];
  });

  const { collected, pending } = computePaymentStats(guests);
  const totalsRow = [
    `Total guests: ${guests.length}`,
    "",
    "",
    "",
    "",
    "",
    "",
    `Recaudado: ${collected}`,
    `Pendiente: ${pending}`,
  ];

  const csv = [header, ...rows, totalsRow]
    .map((row) => row.map((cell) => csvEscape(String(cell))).join(","))
    .join("\n");

  const exportDate = new Date().toISOString().slice(0, 10);
  const filterSuffixParts = [
    search && "search",
    genderFilter,
    rsvpFilter,
    paymentFilter !== "ALL" && paymentFilter,
  ].filter(Boolean);
  const filterSuffix = filterSuffixParts.length
    ? `-${filterSuffixParts.join("-").toLowerCase()}`
    : "";
  const filename = `${event.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-guests${filterSuffix}-${exportDate}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

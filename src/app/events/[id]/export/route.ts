import { NextResponse } from "next/server";
import type { Gender, RsvpStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { GENDER_LABELS, GENDERS, RSVP_STATUSES } from "@/lib/types";

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
  const paymentFilter =
    paymentParam === "PAID" || paymentParam === "PENDING" ? paymentParam : null;

  const guests = event.guests.filter((g) => {
    if (search && !g.name.toLowerCase().includes(search)) return false;
    if (genderFilter && g.gender !== genderFilter) return false;
    if (rsvpFilter && g.rsvpStatus !== rsvpFilter) return false;
    if (paymentFilter === "PAID" && !g.hasPaid) return false;
    if (paymentFilter === "PENDING" && g.hasPaid) return false;
    return true;
  });

  const header = [
    "Name",
    "Gender",
    "Must Pay",
    "Paid",
    "Amount",
    "Comments",
    "Balance",
    "Status",
  ];

  let totalRecaudado = 0;
  let totalPendiente = 0;

  const rows = guests.map((g) => {
    const amount = g.amount ?? 0;
    const paidAmount = g.hasPaid ? amount : 0;
    const balance = amount - paidAmount;

    const status = !g.mustPay ? "Exento" : g.hasPaid ? "Pagado" : "Pendiente";

    totalRecaudado += paidAmount;
    if (g.mustPay && !g.hasPaid) totalPendiente += balance;

    return [
      g.name,
      GENDER_LABELS[g.gender],
      g.mustPay ? "Yes" : "No",
      g.hasPaid ? "Yes" : "No",
      g.amount != null ? String(g.amount) : "",
      g.comments ?? "",
      String(balance),
      status,
    ];
  });

  const totalsRow = [
    `Total guests: ${guests.length}`,
    "",
    "",
    "",
    "",
    "",
    `Recaudado: ${totalRecaudado}`,
    `Pendiente: ${totalPendiente}`,
  ];

  const csv = [header, ...rows, totalsRow]
    .map((row) => row.map((cell) => csvEscape(String(cell))).join(","))
    .join("\n");

  const exportDate = new Date().toISOString().slice(0, 10);
  const filename = `${event.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-guests-${exportDate}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
